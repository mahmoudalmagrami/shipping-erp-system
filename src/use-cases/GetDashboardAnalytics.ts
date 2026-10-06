import { AccountRepository } from '../repositories/AccountRepository.js';
import { OrderRepository } from '../repositories/OrderRepository.js';
import { CarrierRepository } from '../repositories/CarrierRepository.js';

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
    const [accounts, allOrders, carriers] = await Promise.all([
      AccountRepository.getAll(),
      OrderRepository.getAll(),
      CarrierRepository.getAll(),
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

    // 2. Order status counts
    let initialCount = 0;
    let dispatchedCount = 0;
    let cancelledCount = 0;

    for (const order of allOrders) {
      if (order.status === 'initial') initialCount++;
      else if (order.status === 'final_dispatched') dispatchedCount++;
      else if (order.status === 'cancelled') cancelledCount++;
    }

    const totalOrdersCount = allOrders.length;

    // 3. Daily trend (past N days)
    const trendMap = new Map<string, { sales: number; cost: number; profit: number; orderCount: number }>();

    // Generate date sequence for the last N days
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      trendMap.set(dateKey, { sales: 0, cost: 0, profit: 0, orderCount: 0 });
    }

    for (const order of allOrders) {
      if (!order.createdAt) continue;
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      
      // If within our monitored range
      if (trendMap.has(orderDate)) {
        const entry = trendMap.get(orderDate)!;
        entry.orderCount += 1;
        if (order.status !== 'cancelled') {
          const salesVal = Number(order.amount || order.totalSalesAmount || 0);
          const costVal = Number(order.carrierCost || 0);
          entry.sales += salesVal;
          entry.cost += costVal;
          entry.profit += (salesVal - costVal);
        }
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

    // 4. Carrier Volume & Cost Share
    const carrierMap = new Map<number, { count: number; totalCost: number; totalSales: number }>();
    let totalDispatchedWithCarrier = 0;

    for (const order of allOrders) {
      if (order.status === 'final_dispatched' && (order as any).carrierId) {
        const carrierId = (order as any).carrierId;
        totalDispatchedWithCarrier++;
        const cur = carrierMap.get(carrierId) || { count: 0, totalCost: 0, totalSales: 0 };
        cur.count += 1;
        cur.totalCost += Number(order.carrierCost || 0);
        cur.totalSales += Number(order.amount || order.totalSalesAmount || 0);
        carrierMap.set(carrierId, cur);
      }
    }

    const carrierShare: CarrierShareItem[] = carriers.map((c) => {
      const stats = carrierMap.get(c.id) || { count: 0, totalCost: 0, totalSales: 0 };
      const percentage = totalDispatchedWithCarrier > 0
        ? Math.round((stats.count / totalDispatchedWithCarrier) * 1000) / 10
        : 0;
      return {
        carrierId: c.id,
        carrierName: c.name,
        carrierCode: c.carrierCode,
        shipmentsCount: stats.count,
        percentage,
        totalCost: Math.round(stats.totalCost * 100) / 100,
        totalSales: Math.round(stats.totalSales * 100) / 100,
        grossProfit: Math.round((stats.totalSales - stats.totalCost) * 100) / 100,
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
