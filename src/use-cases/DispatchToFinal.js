import { z } from 'zod';
import { db } from '../config/database.js';
import { AccountingEngine } from '../domain/services/AccountingEngine.js';

const DispatchToFinalSchema = z.object({
  initialOrderId: z.number().int().positive('معرف الطلب الأولي إلزامي'),
  carrierId: z.number().int().positive('يجب اختيار الناقل / المورد'),
  supplierWaybillNumber: z.string().min(3, 'رقم بوليصة المورد إلزامي (3 أحرف على الأقل)'),
  carrierCost: z.number().positive('تكلفة المورد يجب أن تكون أكبر من الصفر'),
  notes: z.string().optional()
});

export class DispatchToFinalUseCase {
  static execute(input) {
    const validated = DispatchToFinalSchema.parse(input);

    // 1. التحقق من وجود الطلب الأولي وحالته
    const order = db.prepare('SELECT * FROM initial_orders WHERE id = ?').get(validated.initialOrderId);
    if (!order) {
      throw new Error(`الطلب الأولي رقم [${validated.initialOrderId}] غير موجود`);
    }

    if (order.status === 'final_dispatched') {
      throw new Error(`الطلب [${order.order_number}] مرحل مسبقاً برقم بوليصة ولا يمكن إعادة ترحيله`);
    }

    if (order.status === 'cancelled') {
      throw new Error(`الطلب [${order.order_number}] ملغى`);
    }

    // 2. التحقق من عدم تكرار رقم بوليصة المورد
    const existingWaybill = db.prepare('SELECT id FROM final_shipments WHERE supplier_waybill_number = ?').get(validated.supplierWaybillNumber);
    if (existingWaybill) {
      throw new Error(`رقم بوليصة المورد [${validated.supplierWaybillNumber}] مسجل مسبقاً في النظام لشحنة أخرى!`);
    }

    // 3. التحقق من المورد
    const carrier = db.prepare('SELECT id, carrier_code, name FROM carrier_suppliers WHERE id = ?').get(validated.carrierId);
    if (!carrier) {
      throw new Error('الناقل / المورد المحدد غير موجود');
    }

    // 4. احتساب صافي الربح للشحنة
    const salesAmount = Number(order.total_sales_amount);
    const cost = Number(validated.carrierCost);
    const grossProfit = Math.round((salesAmount - cost) * 100) / 100;

    // 5. الترحيل الذري وقيد استحقاق المورد في المعاملة
    let finalShipmentId = null;
    let journal = null;

    db.exec('BEGIN TRANSACTION;');
    try {
      const insertFinal = db.prepare(`
        INSERT INTO final_shipments (
          initial_order_id, carrier_id, supplier_waybill_number,
          carrier_cost, gross_profit, notes
        ) VALUES (?, ?, ?, ?, ?, ?)
      `);

      const res = insertFinal.run(
        order.id,
        carrier.id,
        validated.supplierWaybillNumber,
        cost,
        grossProfit,
        validated.notes || null
      );
      finalShipmentId = Number(res.lastInsertRowid);

      // تحديث حالة الطلب الأولي
      db.prepare(`
        UPDATE initial_orders 
        SET status = 'final_dispatched' 
        WHERE id = ?
      `).run(order.id);

      // توليد قيد استحقاق المورد المالي (تكلفة الشحن مدين / المورد دائن)
      journal = AccountingEngine.processFinalDispatchAccounting({
        initialOrderId: order.id,
        orderNumber: order.order_number,
        carrierId: carrier.id,
        supplierWaybillNumber: validated.supplierWaybillNumber,
        carrierCost: cost
      });

      db.exec('COMMIT;');
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }

    return {
      finalShipmentId,
      orderNumber: order.order_number,
      carrierName: carrier.name,
      supplierWaybillNumber: validated.supplierWaybillNumber,
      salesAmount,
      carrierCost: cost,
      grossProfit,
      journalEntryNumber: journal.entryNumber,
      dispatchedAt: new Date().toISOString()
    };
  }
}
