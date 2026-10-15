import { z } from 'zod';
import { db } from '../db/index.js';
import { OrderRepository } from '../repositories/OrderRepository.js';
import { CustomerRepository } from '../repositories/CustomerRepository.js';
import { AccountRepository } from '../repositories/AccountRepository.js';
import { JournalRepository } from '../repositories/JournalRepository.js';
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

      // عكس ذمة العميل إذا كان الدفع آجلاً
      if (order.paymentType === 'credit' && order.customerId) {
        await CustomerRepository.updateBalance(
          order.customerId,
          -Number(order.totalSalesAmount),
          tx
        );
      }

      // تسجيل حركة نقدية خارجة إذا كان الدفع نقدياً أو بنكياً
      if (order.paymentType === 'cash' || order.paymentType === 'bank') {
        const vaultCode = order.paymentType === 'bank' ? '1020' : '1010';
        const vault = await AccountRepository.getByCode(vaultCode, tx);
        const amountNum = Number(order.totalSalesAmount);
        const balanceAfter = Number(vault?.currentBalance || 0).toFixed(2);

        await JournalRepository.createCashMovement({
          accountCode: vaultCode,
          orderId: order.id,
          movementType: 'outflow',
          amount: amountNum.toFixed(2),
          balanceAfter,
          notes: `استرداد نقدي - إلغاء الطلب [${order.orderNumber}]`,
        }, tx);
      }

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
