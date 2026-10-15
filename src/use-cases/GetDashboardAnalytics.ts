import { sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { AccountRepository } from '../repositories/AccountRepository.js';

export interface DailyTrendPoint {
  date: string;
  displayDate: string;
  sales: number;
  cost: number;
  profit: number;
  orderCount: number;
}

export interface CarrierShareItem {
  carrierId: number;
  carrierName: string;
  carrierCode: string;
  shipmentsCount: number;
  percentage: number;
  totalCost: number;
  totalSales: number;
  grossProfit: number;
}

export interface DashboardAnalyticsResponse {
  kpi: {
    totalSales: number;
    totalCost: number;
    grossProfit: number;
    profitMarginPct: number;
    cashBox: number;
    bankExchange: number;
    liquidTotal: number;
    accountsReceivable: number;
    accountsPayableCarriers: number;
    workingCapitalCoveragePct: number;
  };
  orderStatusCounts: {
    initial: number;
    finalDispatched: number;
    cancelled: number;
    total: number;
  };
  liquidityDistribution: {
    cashBox: number;
    cashPct: number;
    bankExchange: number;
    bankPct: number;
    total: number;
  };
  debtRatio: {
    receivables: number;
    payables: number;
    netBalance: number;
    coveragePct: number;
  };
  dailyTrend: DailyTrendPoint[];
  carrierShare: CarrierShareItem[];
}

export class GetDashboardAnalytics {
  static async execute(days: number = 14): Promise<DashboardAnalyticsResponse> {
    const [accounts, statusResult, dailyTrendResult, carrierShareResult] = await Promise.all([
      AccountRepository.getAll(),
      db.execute(sql`
        SELECT status, COUNT(*)::int as count 
        FROM initial_orders 
        GROUP BY status
      `),
      db.execute(sql`
        SELECT
          TO_CHAR(io.created_at, 'YYYY-MM-DD') as day,
          COUNT(*)::int as order_count,
          COALESCE(SUM(CASE WHEN io.status != 'cancelled' THEN io.total_sales_amount::numeric ELSE 0 END), 0)::float as sales,
          COALESCE(SUM(CASE WHEN io.status != 'cancelled' THEN COALESCE(fs.carrier_cost::numeric, 0) ELSE 0 END), 0)::float as cost
        FROM initial_orders io
        LEFT JOIN final_shipments fs ON io.id = fs.initial_order_id
        WHERE io.created_at >= NOW() - (${days} || ' days')::interval
        GROUP BY TO_CHAR(io.created_at, 'YYYY-MM-DD')
      `),
      db.execute(sql`
        SELECT
          cs.id as carrier_id,
          cs.name as carrier_name,
          cs.carrier_code as carrier_code,
          COUNT(fs.id)::int as shipments_count,
          COALESCE(SUM(fs.carrier_cost::numeric), 0)::float as total_cost,
          COALESCE(SUM(io.total_sales_amount::numeric), 0)::float as total_sales
        FROM carrier_suppliers cs
        LEFT JOIN final_shipments fs ON cs.id = fs.carrier_id
        LEFT JOIN initial_orders io ON fs.initial_order_id = io.id AND io.status = 'final_dispatched'
        GROUP BY cs.id, cs.name, cs.carrier_code
      `),
    ]);

    // 1. Account balances
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
    const workingCapitalCoveragePct = accountsPayableCarriers > 0
      ? Math.round((accountsReceivable / accountsPayableCarriers) * 10000) / 100
      : 100;

    // 2. Order status counts via SQL
    let initialCount = 0;
    let dispatchedCount = 0;
    let cancelledCount = 0;
    let totalOrdersCount = 0;

    const statusRows = ((statusResult as any).rows || statusResult) as Array<{ status: string; count: number }>;
    for (const row of statusRows) {
      const count = Number(row.count || 0);
      totalOrdersCount += count;
      if (row.status === 'initial') initialCount = count;
      else if (row.status === 'final_dispatched') dispatchedCount = count;
      else if (row.status === 'cancelled') cancelledCount = count;
    }

    // 3. Daily trend (past N days) via SQL
    const trendMap = new Map<string, { sales: number; cost: number; profit: number; orderCount: number }>();

    // Generate date sequence for the last N days
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      trendMap.set(dateKey, { sales: 0, cost: 0, profit: 0, orderCount: 0 });
    }

    const trendRows = ((dailyTrendResult as any).rows || dailyTrendResult) as Array<{
      day: string;
      order_count: number;
      sales: number;
      cost: number;
    }>;

    for (const row of trendRows) {
      const dateKey = row.day;
      if (trendMap.has(dateKey)) {
        const sales = Number(row.sales || 0);
        const cost = Number(row.cost || 0);
        trendMap.set(dateKey, {
          orderCount: Number(row.order_count || 0),
          sales,
          cost,
          profit: sales - cost,
        });
      }
    }

    const dailyTrend: DailyTrendPoint[] = Array.from(trendMap.entries()).map(([dateStr, metrics]) => {
      const dateObj = new Date(dateStr);
      const displayDate = dateObj.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
      return {
        date: dateStr,
        displayDate,
        sales: Math.round(metrics.sales * 100) / 100,
        cost: Math.round(metrics.cost * 100) / 100,
        profit: Math.round(metrics.profit * 100) / 100,
        orderCount: metrics.orderCount,
      };
    });

    // 4. Carrier Volume & Cost Share via SQL
    const carrierRows = ((carrierShareResult as any).rows || carrierShareResult) as Array<{
      carrier_id: number;
      carrier_name: string;
      carrier_code: string;
      shipments_count: number;
      total_cost: number;
      total_sales: number;
    }>;

    const totalDispatchedWithCarrier = carrierRows.reduce((sum, r) => sum + Number(r.shipments_count || 0), 0);

    const carrierShare: CarrierShareItem[] = carrierRows.map((r) => {
      const count = Number(r.shipments_count || 0);
      const percentage = totalDispatchedWithCarrier > 0
        ? Math.round((count / totalDispatchedWithCarrier) * 1000) / 10
        : 0;
      const totalCost = Number(r.total_cost || 0);
      const totalSales = Number(r.total_sales || 0);
      return {
        carrierId: Number(r.carrier_id),
        carrierName: r.carrier_name,
        carrierCode: r.carrier_code,
        shipmentsCount: count,
        percentage,
        totalCost: Math.round(totalCost * 100) / 100,
        totalSales: Math.round(totalSales * 100) / 100,
        grossProfit: Math.round((totalSales - totalCost) * 100) / 100,
      };
    }).sort((a, b) => b.shipmentsCount - a.shipmentsCount);

    // 5. Liquidity distribution percentages
    const cashPct = liquidTotal > 0 ? Math.round((cashBox / liquidTotal) * 1000) / 10 : 0;
    const bankPct = liquidTotal > 0 ? Math.round((bankExchange / liquidTotal) * 1000) / 10 : 0;

    return {
      kpi: {
        totalSales,
        totalCost,
        grossProfit,
        profitMarginPct,
        cashBox,
        bankExchange,
        liquidTotal,
        accountsReceivable,
        accountsPayableCarriers,
        workingCapitalCoveragePct,
      },
      orderStatusCounts: {
        initial: initialCount,
        finalDispatched: dispatchedCount,
        cancelled: cancelledCount,
        total: totalOrdersCount,
      },
      liquidityDistribution: {
        cashBox,
        cashPct,
        bankExchange,
        bankPct,
        total: liquidTotal,
      },
      debtRatio: {
        receivables: accountsReceivable,
        payables: accountsPayableCarriers,
        netBalance: Math.round((accountsReceivable - accountsPayableCarriers) * 100) / 100,
        coveragePct: workingCapitalCoveragePct,
      },
      dailyTrend,
      carrierShare,
    };
  }
}
