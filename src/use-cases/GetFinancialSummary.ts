import { count, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { initialOrders } from '../db/schema.js';
import { AccountRepository } from '../repositories/AccountRepository.js';
import { JournalRepository } from '../repositories/JournalRepository.js';

export class GetFinancialSummary {
  static async execute() {
    const accounts = await AccountRepository.getAll();
    
    let cashBox = 0;
    let bankExchange = 0;
    let accountsReceivable = 0;
    let accountsPayableCarriers = 0;
    let totalSales = 0;
    let totalCost = 0;

    for (const acc of accounts) {
      const bal = Number(acc.currentBalance || 0);
      if (acc.accountCode === '1010') cashBox = bal;
      if (acc.accountCode === '1020') bankExchange = bal;
      if (acc.accountCode === '1100') accountsReceivable = bal;
      if (acc.accountCode === '2100') accountsPayableCarriers = bal;
      if (acc.accountCode === '4100') totalSales = bal;
      if (acc.accountCode === '5100') totalCost = bal;
    }

    const liquidTotal = cashBox + bankExchange;
    const grossProfit = Math.round((totalSales - totalCost) * 100) / 100;
    const profitMarginPct = totalSales > 0 ? Math.round((grossProfit / totalSales) * 10000) / 100 : 0;

    // Order Counts
    const totalOrdersRes = await db.select({ value: count() }).from(initialOrders);
    const pendingOrdersRes = await db.select({ value: count() }).from(initialOrders).where(eq(initialOrders.status, 'initial'));
    const dispatchedOrdersRes = await db.select({ value: count() }).from(initialOrders).where(eq(initialOrders.status, 'final_dispatched'));

    const totalOrders = totalOrdersRes[0]?.value || 0;
    const pendingOrders = pendingOrdersRes[0]?.value || 0;
    const dispatchedOrders = dispatchedOrdersRes[0]?.value || 0;

    // Recent Journals with Lines
    const recentJournals = await JournalRepository.getRecentEntries(10);
    const detailedJournals = await Promise.all(
      recentJournals.map(async (j) => {
        const lines = await JournalRepository.getLinesByEntryId(j.id);
        return {
          ...j,
          lines,
        };
      })
    );

    const recentCashMovements = await JournalRepository.getRecentCashMovements(10);

    return {
      kpi: {
        cashBox,
        bankExchange,
        liquidTotal,
        accountsReceivable,
        accountsPayableCarriers,
        totalSales,
        totalCost,
        grossProfit,
        profitMarginPct,
      },
      counts: {
        totalOrders,
        pendingOrders,
        dispatchedOrders,
      },
      accounts,
      recentJournals: detailedJournals,
      recentCashMovements,
    };
  }
}
