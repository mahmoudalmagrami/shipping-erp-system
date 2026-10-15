import { count, inArray } from 'drizzle-orm';
import { db } from '../db/index.js';
import { initialOrders, journalLines } from '../db/schema.js';
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

    // Order Counts - استعلام تجميعي واحد بدلاً من 3 استعلامات منفصلة
    const statusCounts = await db
      .select({
        status: initialOrders.status,
        count: count(),
      })
      .from(initialOrders)
      .groupBy(initialOrders.status);

    let totalOrders = 0;
    let pendingOrders = 0;
    let dispatchedOrders = 0;

    for (const sc of statusCounts) {
      const c = Number(sc.count || 0);
      totalOrders += c;
      if (sc.status === 'initial') pendingOrders = c;
      if (sc.status === 'final_dispatched') dispatchedOrders = c;
    }

    // Recent Journals with Lines - جلب دفعة واحدة بدون N+1
    const recentJournals = await JournalRepository.getRecentEntries(10);
    const entryIds = recentJournals.map((j) => j.id);

    let detailedJournals: any[] = [];
    if (entryIds.length > 0) {
      const allLines = await db
        .select()
        .from(journalLines)
        .where(inArray(journalLines.journalEntryId, entryIds));

      const linesByEntry = new Map<number, any[]>();
      for (const line of allLines) {
        const list = linesByEntry.get(line.journalEntryId) || [];
        list.push(line);
        linesByEntry.set(line.journalEntryId, list);
      }

      detailedJournals = recentJournals.map((j) => ({
        ...j,
        lines: linesByEntry.get(j.id) || [],
      }));
    }

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
