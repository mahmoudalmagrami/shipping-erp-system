import type { FastifyInstance } from 'fastify';
import { authenticate, requireRole } from '../middlewares/auth.js';
import { AccountRepository } from '../../repositories/AccountRepository.js';

export default async function reportsRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);
  fastify.addHook('preHandler', requireRole(['admin', 'accountant']));

  // 1. ميزان المراجعة (Trial Balance)
  fastify.get('/trial-balance', async () => {
    const accounts = await AccountRepository.getAll();

    let totalDebit = 0;
    let totalCredit = 0;

    const items = accounts.map((acc) => {
      const balance = Number(acc.currentBalance || 0);
      let debit = 0;
      let credit = 0;

      // Assets and Expenses are naturally debit normal
      if (acc.accountType === 'asset' || acc.accountType === 'expense') {
        if (balance >= 0) debit = balance;
        else credit = Math.abs(balance);
      } else {
        // Liabilities, Equity, Revenues are naturally credit normal
        if (balance >= 0) credit = balance;
        else debit = Math.abs(balance);
      }

      totalDebit += debit;
      totalCredit += credit;

      return {
        accountCode: acc.accountCode,
        accountNameAr: acc.accountNameAr,
        accountNameEn: acc.accountNameEn,
        accountType: acc.accountType,
        debit: Math.round(debit * 100) / 100,
        credit: Math.round(credit * 100) / 100,
      };
    });

    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.05;

    return {
      success: true,
      data: {
        reportName: 'ميزان المراجعة',
        generatedAt: new Date().toISOString(),
        isBalanced,
        totalDebit: Math.round(totalDebit * 100) / 100,
        totalCredit: Math.round(totalCredit * 100) / 100,
        items,
      },
    };
  });

  // 2. قائمة الدخل (Income Statement)
  fastify.get('/income-statement', async () => {
    const accounts = await AccountRepository.getAll();

    const revenues = accounts
      .filter((a) => a.accountType === 'revenue')
      .map((a) => ({
        accountCode: a.accountCode,
        accountName: a.accountNameAr,
        amount: Number(a.currentBalance || 0),
      }));

    const expenses = accounts
      .filter((a) => a.accountType === 'expense')
      .map((a) => ({
        accountCode: a.accountCode,
        accountName: a.accountNameAr,
        amount: Number(a.currentBalance || 0),
      }));

    const totalRevenues = revenues.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netIncome = Math.round((totalRevenues - totalExpenses) * 100) / 100;

    return {
      success: true,
      data: {
        reportName: 'قائمة الدخل (الأرباح والخسائر)',
        generatedAt: new Date().toISOString(),
        totalRevenues: Math.round(totalRevenues * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        netIncome,
        revenues,
        expenses,
      },
    };
  });

  // 3. الميزانية العمومية (Balance Sheet)
  fastify.get('/balance-sheet', async () => {
    const accounts = await AccountRepository.getAll();

    const assets = accounts
      .filter((a) => a.accountType === 'asset')
      .map((a) => ({
        accountCode: a.accountCode,
        accountName: a.accountNameAr,
        amount: Number(a.currentBalance || 0),
      }));

    const liabilities = accounts
      .filter((a) => a.accountType === 'liability')
      .map((a) => ({
        accountCode: a.accountCode,
        accountName: a.accountNameAr,
        amount: Number(a.currentBalance || 0),
      }));

    const equity = accounts
      .filter((a) => a.accountType === 'equity')
      .map((a) => ({
        accountCode: a.accountCode,
        accountName: a.accountNameAr,
        amount: Number(a.currentBalance || 0),
      }));

    // Calculate current period net income to balance the balance sheet
    const totalRevenues = accounts
      .filter((a) => a.accountType === 'revenue')
      .reduce((sum, a) => sum + Number(a.currentBalance || 0), 0);
    const totalExpenses = accounts
      .filter((a) => a.accountType === 'expense')
      .reduce((sum, a) => sum + Number(a.currentBalance || 0), 0);
    const netIncome = totalRevenues - totalExpenses;

    const totalAssets = assets.reduce((sum, a) => sum + a.amount, 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0);
    const baseEquity = equity.reduce((sum, e) => sum + e.amount, 0);
    const totalEquity = baseEquity + netIncome;

    const isBalanced = Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.05;

    return {
      success: true,
      data: {
        reportName: 'الميزانية العمومية',
        generatedAt: new Date().toISOString(),
        isBalanced,
        totalAssets: Math.round(totalAssets * 100) / 100,
        totalLiabilities: Math.round(totalLiabilities * 100) / 100,
        totalEquity: Math.round(totalEquity * 100) / 100,
        netIncomeCurrentPeriod: Math.round(netIncome * 100) / 100,
        assets,
        liabilities,
        equity,
      },
    };
  });
}
