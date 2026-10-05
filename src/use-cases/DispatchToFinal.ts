import { z } from 'zod';
import { db } from '../db/index.js';
import { OrderRepository } from '../repositories/OrderRepository.js';
import { CarrierRepository } from '../repositories/CarrierRepository.js';
import { AccountingEngine } from '../domain/services/AccountingEngine.js';
import { NotFoundError, BusinessRuleError } from '../domain/errors/index.js';

const schema = z.object({
  initialOrderId: z.number().int().positive('معرف الطلب إلزامي'),
  carrierId: z.number().int().positive('يجب اختيار الناقل / المورد'),
  supplierWaybillNumber: z.string().min(3, 'رقم بوليصة المورد إلزامي (3 أحرف على الأقل)'),
  carrierCost: z.number().positive('تكلفة المورد يجب أن تكون أكبر من الصفر'),
  notes: z.string().optional()
});

export class DispatchToFinal {
  static async execute(input: unknown) {
    const data = schema.parse(input);
    
    return db.transaction(async (tx) => {
      const order = await OrderRepository.getById(data.initialOrderId, tx);
      if (!order) throw new NotFoundError('الطلب غير موجود');
      if (order.status === 'final_dispatched') throw new BusinessRuleError('الطلب مرحل مسبقاً برقم بوليصة ولا يمكن إعادة ترحيله');
      if (order.status === 'cancelled') throw new BusinessRuleError('الطلب ملغى ولا يمكن ترحيله');

      const carrier = await CarrierRepository.getById(data.carrierId, tx);
      if (!carrier) throw new NotFoundError('الناقل / المورد المحدد غير موجود');

      const existingWaybill = await OrderRepository.findByWaybill(data.supplierWaybillNumber, tx);
      if (existingWaybill) throw new BusinessRuleError(`رقم بوليصة المورد [${data.supplierWaybillNumber}] مسجل مسبقاً في النظام`);

      const salesPrice = Number(order.totalSalesAmount);
      const grossProfit = Math.round((salesPrice - data.carrierCost) * 100) / 100;

      const shipment = await OrderRepository.createFinalShipment({
        initialOrderId: order.id,
        carrierId: carrier.id,
        supplierWaybillNumber: data.supplierWaybillNumber,
        carrierCost: data.carrierCost.toFixed(2),
        grossProfit: grossProfit.toFixed(2),
        notes: data.notes || null,
      }, tx);

      await OrderRepository.updateStatus(order.id, 'final_dispatched', tx);

      const accountingResult = await AccountingEngine.processFinalDispatchAccounting({
        initialOrderId: order.id,
        orderNumber: order.orderNumber,
        carrierId: carrier.id,
        supplierWaybillNumber: data.supplierWaybillNumber,
        carrierCost: data.carrierCost,
      }, tx);

      return {
        finalShipmentId: shipment.id,
        orderNumber: order.orderNumber,
        carrierName: carrier.name,
        supplierWaybillNumber: data.supplierWaybillNumber,
        salesAmount: salesPrice,
        carrierCost: data.carrierCost,
        grossProfit,
        journalEntryNumber: accountingResult.entryNumber,
        dispatchedAt: new Date().toISOString(),
      };
    });
  }
}
