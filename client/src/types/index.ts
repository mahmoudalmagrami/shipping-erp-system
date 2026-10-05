export interface User {
  id: string;
  username: string;
  role: 'admin' | 'cashier' | 'accountant' | 'manager';
  name: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  zoneId: string;
  actualWeight: number;
  length?: number;
  width?: number;
  height?: number;
  paymentType: 'cash' | 'bank' | 'credit';
  customerId?: string;
  notes?: string;
  status: 'initial' | 'dispatched' | 'cancelled';
  amount: number;
  waybillNumber?: string;
  createdAt: string;
}

export interface Tier {
  id: string;
  name: string;
  minWeight: number;
  maxWeight: number;
  basePrice: number;
  extraKgPrice: number;
  estCost: number;
}

export interface Zone {
  id: string;
  name: string;
  tiers: Tier[];
}

export interface Carrier {
  id: string;
  name: string;
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  address?: string;
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
}
