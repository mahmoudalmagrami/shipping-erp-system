import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { destinationZones, pricingMatrix } from '../db/schema.js';
import { OrderRepository } from '../repositories/OrderRepository.js';
import { CustomerRepository } from '../repositories/CustomerRepository.js';
import { PricingCalculator } from '../domain/services/PricingCalculator.js';
import { AccountingEngine } from '../domain/services/AccountingEngine.js';
import { NotFoundError, BusinessRuleError } from '../domain/errors/index.js';
import type { PaymentType } from '../domain/types/index.js';

const schema = z.object({
  customerId: z.coerce.number().optional().nullable(),
  senderName: z.string().min(2, 'اسم المرسل إلزامي'),
  senderPhone: z.string().min(6, 'رقم هاتف المرسل إلزامي'),
  receiverName: z.string().min(2, 'اسم المستلم إلزامي'),
  receiverPhone: z.string().min(6, 'رقم هاتف المستلم إلزامي'),
  receiverAddress: z.string().min(3, 'عنوان المستلم إلزامي'),
  zoneId: z.coerce.number().int().positive('يجب اختيار وجهة شحن صالحة'),
  paymentType: z.enum(['cash', 'credit', 'bank']),
  actualWeight: z.coerce.number().positive('الوزن الفعلي يجب أن يكون أكبر من الصفر'),
  lengthCm: z.coerce.number().optional().default(0),
  widthCm: z.coerce.number().optional().default(0),
  heightCm: z.coerce.number().optional().default(0),
  notes: z.string().optional()
}).refine(data => {
  if (data.paymentType === 'credit') {
    return data.customerId != null && data.customerId > 0;
  }
  return true;
}, {
  message: 'يجب اختيار عميل مسجل عند اختيار السداد الآجل على الحساب',
  path: ['customerId']
});

export class CreateInitialOrder {
  static async execute(input: unknown) {
    const raw = (input && typeof input === 'object') ? input as any : {};
    const normalizedInput = {
      ...raw,
      customerId: raw.customerId ? Number(raw.customerId) : undefined,
      zoneId: Number(raw.zoneId),
      actualWeight: Number(raw.actualWeight),
      lengthCm: Number(raw.lengthCm ?? raw.length ?? 0),
      widthCm: Number(raw.widthCm ?? raw.width ?? 0),
      heightCm: Number(raw.heightCm ?? raw.height ?? 0),
    };
    const data = schema.parse(normalizedInput);
    
    if (data.customerId) {
      const customer = await CustomerRepository.getById(data.customerId);
      if (!customer) throw new NotFoundError('العميل المحدد غير موجود');
    }

    const zone = (await db.select().from(destinationZones).where(eq(destinationZones.id, data.zoneId)).limit(1))[0];
    if (!zone) {
      throw new NotFoundError('وجهة الشحن المحددة غير موجودة');
    }

    const tiers = await db
      .select()
      .from(pricingMatrix)
      .where(and(eq(pricingMatrix.zoneId, data.zoneId), eq(pricingMatrix.isActive, true)));

    if (!tiers || tiers.length === 0) {
      throw new BusinessRuleError(`لا توجد شرائح تسعير مفعلة لوجهة: ${zone.nameAr}`);
    }

    const volWeight = PricingCalculator.calculateVolumetricWeight(
      data.lengthCm || 0,
      data.widthCm || 0,
      data.heightCm || 0
    );
    
    const chargeableWeight = PricingCalculator.determineChargeableWeight(data.actualWeight, volWeight);
    const rate = PricingCalculator.evaluateRate(chargeableWeight, tiers as any);

    return db.transaction(async (tx) => {
      const orderNumber = await OrderRepository.generateOrderNumber(tx);
      
      const order = await OrderRepository.create({
        orderNumber,
        customerId: data.customerId || null,
        senderName: data.senderName,
        senderPhone: data.senderPhone,
        receiverName: data.receiverName,
        receiverPhone: data.receiverPhone,
        receiverAddress: data.receiverAddress,
        zoneId: data.zoneId,
        actualWeight: data.actualWeight.toFixed(3),
        volumetricWeight: volWeight.toFixed(3),
        chargeableWeight: chargeableWeight.toFixed(3),
        totalSalesAmount: rate.totalSalesPrice.toFixed(2),
        paymentType: data.paymentType as PaymentType,
        status: 'initial',
        notes: data.notes || null,
      }, tx);

      const accountingResult = await AccountingEngine.processInitialOrderAccounting({
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerId: data.customerId,
        senderName: data.senderName,
        paymentType: data.paymentType as PaymentType,
        amount: rate.totalSalesPrice,
      }, tx);

      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        zoneName: zone.nameAr,
        actualWeight: data.actualWeight,
        volumetricWeight: volWeight,
        chargeableWeight,
        tierApplied: rate.tierName,
        totalSalesAmount: rate.totalSalesPrice,
        paymentType: data.paymentType,
        journalEntryNumber: accountingResult.entryNumber,
        status: 'initial'
      };
    });
  }
}
