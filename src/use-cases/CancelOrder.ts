import { z } from 'zod';
import { db } from '../db/index.js';
import { OrderRepository } from '../repositories/OrderRepository.js';
import { AccountingEngine } from '../domain/services/AccountingEngine.js';
import { BusinessRuleError, NotFoundError } from '../domain/errors/index.js';

const schema = z.object({
  orderId: z.number().int().positive('معرف الطلب مطلوب')
});

export class CancelOrder {
  static async execute(input: unknown) {
    const data = schema.parse(input);
    
    return db.transaction(async (tx) => {
      const order = await OrderRepository.getById(data.orderId, tx);
      if (!order) throw new NotFoundError('الطلب غير موجود');
      if (order.status === 'cancelled') throw new BusinessRuleError('الطلب ملغى مسبقاً');
      if (order.status === 'final_dispatched') throw new BusinessRuleError('لا يمكن إلغاء طلب تم ترحيله نهائياً للمورد');

      await OrderRepository.updateStatus(data.orderId, 'cancelled', tx);

      const result = await AccountingEngine.reversalEntry({
        orderId: order.id,
        orderNumber: order.orderNumber,
      }, tx);

      return {
        success: true,
        orderId: data.orderId,
        orderNumber: order.orderNumber,
        status: 'cancelled',
        reversalJournalEntryNumber: result.entryNumber
      };
    });
  }
}
