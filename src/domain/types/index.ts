import type { 
  users,
  initialOrders,
  finalShipments,
  journalEntries,
  journalLines,
  cashMovements,
  chartOfAccounts,
  customers,
  carrierSuppliers,
  destinationZones,
  pricingMatrix
} from '../../db/schema.js';

export type PaymentType = 'cash' | 'bank' | 'credit';
export type OrderStatus = 'initial' | 'final_dispatched' | 'cancelled';
export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
export type UserRole = 'admin' | 'cashier' | 'warehouse' | 'accountant';
export type MovementType = 'inflow' | 'outflow';

export interface JournalLineInput {
  accountCode: string;
  debit: number;
  credit: number;
  memo?: string;
}

export interface CreateOrderInput {
  customerId?: number;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  zoneId: number;
  actualWeight: number;
  volumetricWeight?: number;
  chargeableWeight: number;
  totalSalesAmount: number;
  paymentType: PaymentType;
  notes?: string;
}

export interface DispatchInput {
  initialOrderId: number;
  carrierId: number;
  supplierWaybillNumber: string;
  carrierCost: number;
  notes?: string;
}

export interface CalculateRateInput {
  zoneId: number;
  actualWeight: number;
  volumetricWeight?: number;
}

export interface TokenPayload {
  userId: number;
  username: string;
  role: UserRole;
  fullName: string;
  exp: number;
}

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type InitialOrder = typeof initialOrders.$inferSelect;
export type NewInitialOrder = typeof initialOrders.$inferInsert;

export type FinalShipment = typeof finalShipments.$inferSelect;
export type NewFinalShipment = typeof finalShipments.$inferInsert;

export type JournalEntry = typeof journalEntries.$inferSelect;
export type NewJournalEntry = typeof journalEntries.$inferInsert;

export type JournalLine = typeof journalLines.$inferSelect;
export type NewJournalLine = typeof journalLines.$inferInsert;

export type CashMovement = typeof cashMovements.$inferSelect;
export type NewCashMovement = typeof cashMovements.$inferInsert;

export type ChartOfAccount = typeof chartOfAccounts.$inferSelect;
export type NewChartOfAccount = typeof chartOfAccounts.$inferInsert;

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

export type CarrierSupplier = typeof carrierSuppliers.$inferSelect;
export type NewCarrierSupplier = typeof carrierSuppliers.$inferInsert;

export type DestinationZone = typeof destinationZones.$inferSelect;
export type NewDestinationZone = typeof destinationZones.$inferInsert;

export type PricingMatrix = typeof pricingMatrix.$inferSelect;
export type NewPricingMatrix = typeof pricingMatrix.$inferInsert;
