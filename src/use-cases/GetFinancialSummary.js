import { db } from '../config/database.js';

export class GetFinancialSummaryUseCase {
  static execute() {
    // 1. أرصدة الحسابات المالية
    const accounts = db.prepare('SELECT account_code, account_name_ar, account_name_en, account_type, current_balance FROM chart_of_accounts').all();

    const accountsMap = {};
    accounts.forEach(a => {
      accountsMap[a.account_code] = Number(a.current_balance);
    });

    const cashBox = accountsMap['1010'] || 0;
    const bankExchange = accountsMap['1020'] || 0;
    const accountsReceivable = accountsMap['1100'] || 0;
    const accountsPayableCarriers = accountsMap['2100'] || 0;
    const totalSales = accountsMap['4100'] || 0;
    const totalCost = accountsMap['5100'] || 0;
    const grossProfit = Math.round((totalSales - totalCost) * 100) / 100;

    // 2. إحصائيات الشحنات والطرود
    const totalOrders = db.prepare('SELECT count(*) as count FROM initial_orders').get().count;
    const pendingOrders = db.prepare("SELECT count(*) as count FROM initial_orders WHERE status = 'initial'").get().count;
    const dispatchedOrders = db.prepare("SELECT count(*) as count FROM initial_orders WHERE status = 'final_dispatched'").get().count;

    // 3. آخر 10 قيود محاسبية مسجلة
    const recentJournals = db.prepare(`
      SELECT j.id, j.entry_number, j.entry_date, j.reference_type, j.reference_id, j.total_debit, j.total_credit, j.description
      FROM journal_entries j
      ORDER BY j.id DESC
      LIMIT 10
    `).all();

    // إرفاق تفاصيل أطراف كل قيد
    const getLines = db.prepare(`
      SELECT l.account_code, a.account_name_ar, a.account_name_en, l.debit_amount, l.credit_amount, l.memo
      FROM journal_lines l
      JOIN chart_of_accounts a ON l.account_code = a.account_code
      WHERE l.journal_entry_id = ?
    `);

    const detailedJournals = recentJournals.map(j => ({
      ...j,
      lines: getLines.all(j.id)
    }));

    // 4. آخر حركات الصناديق
    const recentCashMovements = db.prepare(`
      SELECT c.*, a.account_name_ar
      FROM cash_movements c
      JOIN chart_of_accounts a ON c.account_code = a.account_code
      ORDER BY c.id DESC
      LIMIT 10
    `).all();

    return {
      kpi: {
        cashBox,
        bankExchange,
        liquidTotal: cashBox + bankExchange,
        accountsReceivable,
        accountsPayableCarriers,
        totalSales,
        totalCost,
        grossProfit,
        profitMarginPct: totalSales > 0 ? Math.round((grossProfit / totalSales) * 10000) / 100 : 0
      },
      counts: {
        totalOrders,
        pendingOrders,
        dispatchedOrders
      },
      accounts,
      recentJournals: detailedJournals,
      recentCashMovements
    };
  }
}
