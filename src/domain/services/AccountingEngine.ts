import { db } from '../../db/index.js';
import { AccountRepository } from '../../repositories/AccountRepository.js';
import { JournalRepository } from '../../repositories/JournalRepository.js';
import { CustomerRepository } from '../../repositories/CustomerRepository.js';
import { CarrierRepository } from '../../repositories/CarrierRepository.js';
import { AccountingError } from '../errors/index.js';
import type { JournalLineInput, PaymentType } from '../types/index.js';

interface JournalEntryRequest {
  referenceType: string;
  referenceId: number | string;
  description: string;
  lines: JournalLineInput[];
}

export class AccountingEngine {
  static async postBalancedJournalEntry(req: JournalEntryRequest, tx: any = db): Promise<{ journalEntryId: number; entryNumber: string; totalDebit: number; totalCredit: number }> {
    let totalDebit = 0;
    let totalCredit = 0;

    for (const line of req.lines) {
      if (line.debit > 0 && line.credit > 0) {
        throw new AccountingError('لا يمكن أن يحتوي السطر على مدين ودائن في نفس الوقت');
      }
      totalDebit += line.debit;
      totalCredit += line.credit;
    }

    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      throw new AccountingError('القيد المحاسبي غير متزن: مجموع المدين لا يساوي مجموع الدائن');
    }

    const entryNumber = JournalRepository.generateEntryNumber();
    
    const entry = await JournalRepository.createEntry({
      entryNumber,
      referenceType: req.referenceType,
      referenceId: req.referenceId.toString(),
      totalDebit: totalDebit.toFixed(2),
      totalCredit: totalCredit.toFixed(2),
      description: req.description,
    }, tx);

    const journalEntryId = entry.id;

    for (const line of req.lines) {
      await JournalRepository.createLine({
        journalEntryId,
        accountCode: line.accountCode,
        debitAmount: line.debit.toFixed(2),
        creditAmount: line.credit.toFixed(2),
        memo: line.memo || req.description,
      }, tx);

      const account = await AccountRepository.getByCode(line.accountCode, tx);
      if (!account) {
        throw new AccountingError(`الحساب رقم [${line.accountCode}] غير موجود في دليل الحسابات`);
      }
      
      let balanceChange = 0;
      if (account.accountType === 'asset' || account.accountType === 'expense') {
        balanceChange = line.debit - line.credit;
      } else {
        balanceChange = line.credit - line.debit;
      }
      
      await AccountRepository.updateBalance(line.accountCode, balanceChange, tx);
    }

    return { journalEntryId, entryNumber, totalDebit, totalCredit };
  }

  static async processInitialOrderAccounting(params: {
    orderId: number;
    orderNumber: string;
    customerId?: number | null;
    senderName?: string;
    paymentType: PaymentType;
    amount: number;
  }, tx: any = db) {
    const lines: JournalLineInput[] = [];
    const memo = `إيراد طلب شحن رقم [${params.orderNumber}] - العميل: ${params.senderName || 'نقدي'}`;

    // إيرادات المبيعات دائنة (4100)
    lines.push({ accountCode: '4100', debit: 0, credit: params.amount, memo });

    if (params.paymentType === 'cash') {
      // الصندوق الرئيسي مدين (1010)
      lines.push({ accountCode: '1010', debit: params.amount, credit: 0, memo });
      
      const currentVault = await AccountRepository.getByCode('1010', tx);
      const balanceAfter = (Number(currentVault?.currentBalance || 0) + params.amount).toFixed(2);

      await JournalRepository.createCashMovement({
        accountCode: '1010',
        orderId: params.orderId,
        movementType: 'inflow',
        amount: params.amount.toFixed(2),
        balanceAfter,
        notes: memo,
      }, tx);

    } else if (params.paymentType === 'bank') {
      // حساب البنك/الصراف مدين (1020)
      lines.push({ accountCode: '1020', debit: params.amount, credit: 0, memo });

      const currentVault = await AccountRepository.getByCode('1020', tx);
      const balanceAfter = (Number(currentVault?.currentBalance || 0) + params.amount).toFixed(2);

      await JournalRepository.createCashMovement({
        accountCode: '1020',
        orderId: params.orderId,
        movementType: 'inflow',
        amount: params.amount.toFixed(2),
        balanceAfter,
        notes: memo,
      }, tx);

    } else if (params.paymentType === 'credit') {
      // ذمم العملاء مدينة (1100)
      lines.push({ accountCode: '1100', debit: params.amount, credit: 0, memo });
      if (params.customerId) {
        await CustomerRepository.updateBalance(params.customerId, params.amount, tx);
      }
    }

    return this.postBalancedJournalEntry({
      referenceType: 'initial_order',
      referenceId: params.orderId,
      description: memo,
      lines,
    }, tx);
  }

  static async processFinalDispatchAccounting(params: {
    initialOrderId: number;
    orderNumber: string;
    carrierId: number;
    supplierWaybillNumber: string;
    carrierCost: number;
  }, tx: any = db) {
    const memo = `تكلفة ترحيل طلب [${params.orderNumber}] - بوليصة المورد [${params.supplierWaybillNumber}]`;
    
    const lines: JournalLineInput[] = [
      // تكلفة خدمات الشحن مدينة (5100)
      { accountCode: '5100', debit: params.carrierCost, credit: 0, memo },
      // ذمم الموردين والناقلين دائنة (2100)
      { accountCode: '2100', debit: 0, credit: params.carrierCost, memo },
    ];

    await CarrierRepository.updateBalance(params.carrierId, params.carrierCost, tx);

    return this.postBalancedJournalEntry({
      referenceType: 'final_shipment',
      referenceId: params.initialOrderId,
      description: memo,
      lines,
    }, tx);
  }

  static async reversalEntry(params: {
    orderId: number;
    orderNumber: string;
    originalJournalEntryId?: number;
  }, tx: any = db) {
    let entryId = params.originalJournalEntryId;

    if (!entryId) {
      const entry = await JournalRepository.findByReference('initial_order', params.orderId.toString(), tx);
      if (entry) {
        entryId = entry.id;
      }
    }

    if (!entryId) {
      throw new AccountingError('تعذر العثور على القيد الأصلي لعكسه');
    }

    const linesDb = await JournalRepository.getLinesByEntryId(entryId, tx);
    if (!linesDb || linesDb.length === 0) {
      throw new AccountingError('تعذر العثور على أطراف القيد الأصلي لعكسه');
    }

    const lines: JournalLineInput[] = linesDb.map((line) => ({
      accountCode: line.accountCode,
      debit: Number(line.creditAmount || 0),
      credit: Number(line.debitAmount || 0),
      memo: `قيد عكسي لإلغاء طلب [${params.orderNumber}]`,
    }));

    return this.postBalancedJournalEntry({
      referenceType: 'cancellation',
      referenceId: params.orderId,
      description: `قيد عكسي لإلغاء الطلب [${params.orderNumber}]`,
      lines,
    }, tx);
  }
}
