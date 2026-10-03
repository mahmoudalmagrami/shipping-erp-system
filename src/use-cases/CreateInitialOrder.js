import { z } from 'zod';
import { db } from '../config/database.js';
import { PricingCalculator } from '../domain/services/PricingCalculator.js';
import { AccountingEngine } from '../domain/services/AccountingEngine.js';

const CreateInitialOrderSchema = z.object({
  customerId: z.number().int().positive().optional().nullable(),
  senderName: z.string().min(2, 'اسم المرسل إلزامي (حرفين على الأقل)'),
  senderPhone: z.string().min(6, 'رقم هاتف المرسل إلزامي'),
  receiverName: z.string().min(2, 'اسم المستلم إلزامي'),
  receiverPhone: z.string().min(6, 'رقم هاتف المستلم إلزامي'),
  receiverAddress: z.string().min(3, 'عنوان المستلم إلزامي'),
  zoneId: z.number().int().positive('يجب اختيار وجهة شحن صالحة'),
  actualWeight: z.number().positive('الوزن الفعلي يجب أن يكون أكبر من الصفر').max(5000, 'الوزن يتجاوز الحد المسموح به (5000 كجم)'),
  dimensions: z.object({
    length: z.number().min(0).optional().default(0),
    width: z.number().min(0).optional().default(0),
    height: z.number().min(0).optional().default(0)
  }).optional(),
  paymentType: z.enum(['cash', 'bank', 'credit'], {
    errorMap: () => ({ message: 'نوع الدفع يجب أن يكون نقداً (cash) أو صراف/بنك (bank) أو آجل (credit)' })
  }),
  notes: z.string().optional()
}).refine(data => {
  if (data.paymentType === 'credit') {
    return data.customerId != null && data.customerId > 0;
  }
  return true;
}, {
  message: 'يجب اختيار عميل مسجل من القائمة عند اختيار السداد الآجل على الحساب',
  path: ['customerId']
});

export class CreateInitialOrderUseCase {
  static execute(input) {
    const validated = CreateInitialOrderSchema.parse(input);

    // التحقق من وجود العميل إذا تم تحديده
    if (validated.customerId) {
      const cust = db.prepare('SELECT id, full_name FROM customers WHERE id = ?').get(validated.customerId);
      if (!cust) {
        throw new Error(`العميل المحدد برقم [${validated.customerId}] غير موجود بالنظام`);
      }
    }

    // 1. استخراج شرائح أسعار الوجهة المختارة
    const zone = db.prepare('SELECT id, zone_code, name_ar FROM destination_zones WHERE id = ?').get(validated.zoneId);
    if (!zone) {
      throw new Error('الوجهة المحددة غير موجودة في النظام');
    }

    const tiers = db.prepare(`
      SELECT * FROM pricing_matrix 
      WHERE zone_id = ? AND is_active = 1 
      ORDER BY weight_min_kg ASC
    `).all(validated.zoneId);

    if (!tiers || tiers.length === 0) {
      throw new Error(`لا توجد شرائح أسعار معرفة لوجهة: ${zone.name_ar}`);
    }

    // 2. حساب الأوزان (الفعلي، الحجمي، والمفوتر)
    const dim = validated.dimensions || { length: 0, width: 0, height: 0 };
    const volumetricWeight = PricingCalculator.calculateVolumetricWeight(dim.length, dim.width, dim.height);
    const chargeableWeight = PricingCalculator.determineChargeableWeight(validated.actualWeight, volumetricWeight);

    // 3. حساب السعر عبر الشريحة المطبقة
    const rateResult = PricingCalculator.evaluateRate(chargeableWeight, tiers);
    const totalSalesAmount = rateResult.totalSalesPrice;

    // 4. التنفيذ المحاسبي والتشغيلي كعملية ذرية واحدة (Atomically in Transaction)
    let createdOrderId = null;
    let orderNumber = null;
    let journal = null;

    db.exec('BEGIN TRANSACTION;');
    try {
      // توليد رقم تسلسلي فريد وموثوق داخل المعاملة
      const lastOrder = db.prepare('SELECT id, order_number FROM initial_orders ORDER BY id DESC LIMIT 1').get();
      let nextSeq = 1;
      if (lastOrder && lastOrder.order_number) {
        const parts = lastOrder.order_number.split('-');
        const parsed = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(parsed)) {
          nextSeq = parsed + 1;
        }
      }
      orderNumber = `ORD-2026-${String(nextSeq).padStart(5, '0')}`;

      const insertOrder = db.prepare(`
        INSERT INTO initial_orders (
          order_number, customer_id, sender_name, sender_phone,
          receiver_name, receiver_phone, receiver_address, zone_id,
          actual_weight, volumetric_weight, chargeable_weight,
          total_sales_amount, payment_type, status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'initial', ?)
      `);

      const result = insertOrder.run(
        orderNumber,
        validated.customerId || null,
        validated.senderName,
        validated.senderPhone,
        validated.receiverName,
        validated.receiverPhone,
        validated.receiverAddress,
        validated.zoneId,
        validated.actualWeight,
        volumetricWeight,
        chargeableWeight,
        totalSalesAmount,
        validated.paymentType,
        validated.notes || null
      );

      createdOrderId = Number(result.lastInsertRowid);

      // التأثير المالي المحاسبي الفوري
      journal = AccountingEngine.processInitialOrderAccounting({
        orderId: createdOrderId,
        orderNumber,
        customerId: validated.customerId,
        senderName: validated.senderName,
        paymentType: validated.paymentType,
        amount: totalSalesAmount
      });

      db.exec('COMMIT;');
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }

    return {
      orderId: createdOrderId,
      orderNumber,
      zoneName: zone.name_ar,
      actualWeight: validated.actualWeight,
      volumetricWeight,
      chargeableWeight,
      tierApplied: rateResult.tierName,
      totalSalesAmount,
      paymentType: validated.paymentType,
      journalEntryNumber: journal.entryNumber,
      status: 'initial'
    };
  }
}
