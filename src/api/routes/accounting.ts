import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate, requireRole } from '../middlewares/auth.js';
import { GetFinancialSummary } from '../../use-cases/GetFinancialSummary.js';
import { AccountingEngine } from '../../domain/services/AccountingEngine.js';

const receiptSchema = z.object({
  customerId: z.coerce.number().int().positive('يجب اختيار العميل'),
  amount: z.coerce.number().positive('مبلغ سند القبض يجب أن يكون أكبر من الصفر'),
  paymentMethod: z.enum(['cash', 'bank']).default('cash'),
  notes: z.string().optional(),
});

const paymentSchema = z.object({
  carrierId: z.coerce.number().int().positive('يجب اختيار شركة الشحن / الناقل'),
  amount: z.coerce.number().positive('مبلغ سند الصرف يجب أن يكون أكبر من الصفر'),
  paymentMethod: z.enum(['cash', 'bank']).default('cash'),
  notes: z.string().optional(),
});

export default async function accountingRoutes(fastify: FastifyInstance) {
  fastify.get('/summary', { preHandler: [authenticate, requireRole(['admin', 'accountant'])] }, async () => {
    const summary = await GetFinancialSummary.execute();
    return { success: true, data: summary };
  });

  // سند قبض من عميل (تسديد ذمم مدينة)
  fastify.post('/vouchers/receipt', { preHandler: [authenticate, requireRole(['admin', 'accountant', 'cashier'])] }, async (request) => {
    const data = receiptSchema.parse(request.body);
    const result = await AccountingEngine.processCustomerReceiptVoucher(data);
    fastify.broadcastUpdate('voucher_created', result);
    return { success: true, message: `تم تسجيل سند القبض برقم [${result.entryNumber}] بنجاح`, data: result };
  });

  // سند صرف لشركة شحن (تسديد ذمم دائنة)
  fastify.post('/vouchers/payment', { preHandler: [authenticate, requireRole(['admin', 'accountant'])] }, async (request) => {
    const data = paymentSchema.parse(request.body);
    const result = await AccountingEngine.processCarrierPaymentVoucher(data);
    fastify.broadcastUpdate('voucher_created', result);
    return { success: true, message: `تم تسجيل سند الصرف برقم [${result.entryNumber}] بنجاح`, data: result };
  });
}
