export interface User {
  id: number | string;
  username: string;
  role: 'admin' | 'cashier' | 'accountant' | 'warehouse';
  fullName?: string;
  name?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  zoneId: string | number;
  zoneName?: string;
  carrierName?: string;
  actualWeight: number;
  volumetricWeight?: number;
  chargeableWeight?: number;
  length?: number;
  width?: number;
  height?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  paymentType: 'cash' | 'bank' | 'credit';
  customerId?: string | number;
  notes?: string;
  status: 'initial' | 'final_dispatched' | 'dispatched' | 'cancelled';
  amount: number;
  totalSalesAmount?: number | string;
  waybillNumber?: string;
  supplierWaybillNumber?: string;
  carrierCost?: number;
  grossProfit?: number;
  dispatchedAt?: string;
  createdAt: string;
}

export interface Tier {
  id: string | number;
  name?: string;
  tierName?: string;
  tierNameEn?: string;
  minWeight?: number;
  maxWeight?: number;
  basePrice?: number;
  extraKgPrice?: number;
  estCost?: number;
}

export interface Zone {
  id: string | number;
  zoneCode?: string;
  name?: string;
  nameAr?: string;
  nameEn?: string;
  countriesList?: string;
  description?: string;
  tiers?: Tier[];
}

export interface Carrier {
  id: string | number;
  name: string;
  nameEn?: string;
  phone?: string;
  carrierCode?: string;
  currentBalance?: number | string;
}

export interface Customer {
  id: string | number;
  fullName: string;
  phone: string;
  address?: string;
  customerCode?: string;
  currentBalance?: number | string;
}

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
}

export interface JournalLine {
  id: string;
  accountId: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  lines: JournalLine[];
}

export interface CashMovement {
  id: string;
  date: string;
  amount: number;
  type: 'in' | 'out';
  description: string;
}

export interface FinancialSummary {
  kpi: {
    mainCash: number;
    bank: number;
    totalLiquid: number;
    ar: number;
    ap: number;
    totalSales: number;
    totalCost: number;
    grossProfit: number;
    margin: number;
  };
  counts: {
    totalOrders: number;
    pendingOrders: number;
    dispatchedOrders: number;
  };
  accounts: Account[];
  recentJournals: JournalEntry[];
  recentCashMovements: CashMovement[];
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  total?: number;
  count?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}

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

export interface DashboardAnalytics {
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
