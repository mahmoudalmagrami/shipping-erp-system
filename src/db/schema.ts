import { 
  pgTable, 
  serial, 
  varchar, 
  text, 
  numeric, 
  timestamp, 
  boolean, 
  integer, 
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const chartOfAccounts = pgTable('chart_of_accounts', {
  accountCode: varchar('account_code', { length: 20 }).primaryKey(),
  accountNameAr: varchar('account_name_ar', { length: 150 }).notNull(), // اسم الحساب بالعربي
  accountNameEn: varchar('account_name_en', { length: 150 }), // اسم الحساب بالانجليزي
  accountType: varchar('account_type', { length: 30 }).notNull(), // 'asset','liability','equity','revenue','expense'
  currentBalance: numeric('current_balance', { precision: 14, scale: 2 }).default('0'), // الرصيد الحالي
});

export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  customerCode: varchar('customer_code', { length: 30 }).unique().notNull(), // رمز العميل
  fullName: varchar('full_name', { length: 150 }).notNull(), // الاسم الكامل
  phone: varchar('phone', { length: 30 }).notNull(), // رقم الجوال
  address: text('address'), // العنوان
  currentBalance: numeric('current_balance', { precision: 14, scale: 2 }).default('0'), // الرصيد الحالي
  createdAt: timestamp('created_at').defaultNow(), // تاريخ الانشاء
});

export const carrierSuppliers = pgTable('carrier_suppliers', {
  id: serial('id').primaryKey(),
  carrierCode: varchar('carrier_code', { length: 30 }).unique().notNull(), // رمز المورد
  name: varchar('name', { length: 150 }).notNull(), // الاسم
  nameEn: varchar('name_en', { length: 150 }), // الاسم بالانجليزي
  phone: varchar('phone', { length: 30 }), // رقم الجوال
  currentBalance: numeric('current_balance', { precision: 14, scale: 2 }).default('0'), // الرصيد الحالي
  createdAt: timestamp('created_at').defaultNow(), // تاريخ الانشاء
});

export const destinationZones = pgTable('destination_zones', {
  id: serial('id').primaryKey(),
  zoneCode: varchar('zone_code', { length: 30 }).unique().notNull(), // رمز المنطقة
  nameAr: varchar('name_ar', { length: 100 }).notNull(), // اسم المنطقة بالعربي
  nameEn: varchar('name_en', { length: 100 }).notNull(), // اسم المنطقة بالانجليزي
  countriesList: text('countries_list'), // قائمة الدول
  description: text('description'), // وصف المنطقة
});

export const pricingMatrix = pgTable('pricing_matrix', {
  id: serial('id').primaryKey(),
  zoneId: integer('zone_id').notNull().references(() => destinationZones.id, { onDelete: 'cascade' }),
  tierName: varchar('tier_name', { length: 100 }).notNull(), // اسم الفئة
  tierNameEn: varchar('tier_name_en', { length: 100 }), // اسم الفئة بالانجليزي
  weightMinKg: numeric('weight_min_kg', { precision: 8, scale: 3 }).notNull(), // الوزن الأدنى
  weightMaxKg: numeric('weight_max_kg', { precision: 8, scale: 3 }).notNull(), // الوزن الأقصى
  baseSellingPrice: numeric('base_selling_price', { precision: 12, scale: 2 }).notNull(), // سعر البيع الأساسي
  extraKgPrice: numeric('extra_kg_price', { precision: 12, scale: 2 }).default('0'), // سعر الكيلو الإضافي
  estimatedCost: numeric('estimated_cost', { precision: 12, scale: 2 }).default('0'), // التكلفة التقديرية
  isActive: boolean('is_active').default(true), // نشط؟
});

export const initialOrders = pgTable('initial_orders', {
  id: serial('id').primaryKey(),
  orderNumber: varchar('order_number', { length: 40 }).unique().notNull(), // رقم الطلب
  customerId: integer('customer_id').references(() => customers.id),
  senderName: varchar('sender_name', { length: 150 }).notNull(), // اسم المرسل
  senderPhone: varchar('sender_phone', { length: 30 }).notNull(), // جوال المرسل
  receiverName: varchar('receiver_name', { length: 150 }).notNull(), // اسم المستلم
  receiverPhone: varchar('receiver_phone', { length: 30 }).notNull(), // جوال المستلم
  receiverAddress: text('receiver_address').notNull(), // عنوان المستلم
  zoneId: integer('zone_id').notNull().references(() => destinationZones.id),
  actualWeight: numeric('actual_weight', { precision: 8, scale: 3 }).notNull(), // الوزن الفعلي
  volumetricWeight: numeric('volumetric_weight', { precision: 8, scale: 3 }).default('0'), // الوزن الحجمي
  chargeableWeight: numeric('chargeable_weight', { precision: 8, scale: 3 }).notNull(), // الوزن المعتمد
  totalSalesAmount: numeric('total_sales_amount', { precision: 12, scale: 2 }).notNull(), // إجمالي المبيعات
  paymentType: varchar('payment_type', { length: 30 }).notNull(), // 'cash','bank','credit'
  status: varchar('status', { length: 30 }).default('initial'), // 'initial','final_dispatched','cancelled'
  notes: text('notes'), // ملاحظات
  createdAt: timestamp('created_at').defaultNow(), // تاريخ الانشاء
}, (table) => {
  return {
    statusIdx: index('idx_orders_status').on(table.status),
    customerIdx: index('idx_orders_customer').on(table.customerId),
    zoneIdx: index('idx_orders_zone').on(table.zoneId),
    createdIdx: index('idx_orders_created').on(table.createdAt),
  };
});

export const finalShipments = pgTable('final_shipments', {
  id: serial('id').primaryKey(),
  initialOrderId: integer('initial_order_id').unique().notNull().references(() => initialOrders.id, { onDelete: 'restrict' }),
  carrierId: integer('carrier_id').notNull().references(() => carrierSuppliers.id, { onDelete: 'restrict' }),
  supplierWaybillNumber: varchar('supplier_waybill_number', { length: 100 }).unique().notNull(), // بوليصة المورد
  carrierCost: numeric('carrier_cost', { precision: 12, scale: 2 }).notNull(), // تكلفة المورد
  grossProfit: numeric('gross_profit', { precision: 12, scale: 2 }).notNull(), // الربح الإجمالي
  dispatchedAt: timestamp('dispatched_at').defaultNow(), // تاريخ الارسال
  notes: text('notes'), // ملاحظات
}, (table) => {
  return {
    carrierIdx: index('idx_final_shipments_carrier').on(table.carrierId),
  };
});

export const journalEntries = pgTable('journal_entries', {
  id: serial('id').primaryKey(),
  entryNumber: varchar('entry_number', { length: 40 }).unique().notNull(), // رقم القيد
  entryDate: timestamp('entry_date').defaultNow(), // تاريخ القيد
  referenceType: varchar('reference_type', { length: 40 }).notNull(), // 'initial_order','final_shipment','settlement','cancellation'
  referenceId: varchar('reference_id', { length: 50 }).notNull(), // المعرف المرجعي
  totalDebit: numeric('total_debit', { precision: 14, scale: 2 }).notNull(), // إجمالي المدين
  totalCredit: numeric('total_credit', { precision: 14, scale: 2 }).notNull(), // إجمالي الدائن
  description: text('description').notNull(), // البيان
}, (table) => {
  return {
    refIdx: index('idx_journal_ref').on(table.referenceType, table.referenceId),
  };
});

export const journalLines = pgTable('journal_lines', {
  id: serial('id').primaryKey(),
  journalEntryId: integer('journal_entry_id').notNull().references(() => journalEntries.id, { onDelete: 'cascade' }),
  accountCode: varchar('account_code', { length: 20 }).notNull().references(() => chartOfAccounts.accountCode),
  debitAmount: numeric('debit_amount', { precision: 14, scale: 2 }).default('0'), // مدين
  creditAmount: numeric('credit_amount', { precision: 14, scale: 2 }).default('0'), // دائن
  memo: text('memo'), // ملاحظة السطر
}, (table) => {
  return {
    entryIdx: index('idx_journal_lines_entry').on(table.journalEntryId),
    accountIdx: index('idx_journal_lines_account').on(table.accountCode),
  };
});

export const cashMovements = pgTable('cash_movements', {
  id: serial('id').primaryKey(),
  accountCode: varchar('account_code', { length: 20 }).notNull(), // كود الحساب
  orderId: integer('order_id').references(() => initialOrders.id), // رقم الطلب (اختياري)
  movementType: varchar('movement_type', { length: 20 }).notNull(), // 'inflow','outflow'
  amount: numeric('amount', { precision: 14, scale: 2 }).notNull(), // المبلغ
  balanceAfter: numeric('balance_after', { precision: 14, scale: 2 }).notNull(), // الرصيد بعد الحركة
  notes: text('notes'), // ملاحظات
  createdAt: timestamp('created_at').defaultNow(), // تاريخ الحركة
}, (table) => {
  return {
    accountIdx: index('idx_cash_movements_account').on(table.accountCode),
  };
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).unique().notNull(), // اسم المستخدم
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  salt: varchar('salt', { length: 64 }).notNull(),
  fullName: varchar('full_name', { length: 150 }).notNull(), // الاسم الكامل
  role: varchar('role', { length: 30 }).notNull(), // 'admin','cashier','warehouse','accountant'
  isActive: boolean('is_active').default(true), // نشط؟
  createdAt: timestamp('created_at').defaultNow(), // تاريخ الانشاء
});

// Relations (العلاقات)
export const destinationZonesRelations = relations(destinationZones, ({ many }) => ({
  pricingMatrices: many(pricingMatrix),
  initialOrders: many(initialOrders),
}));

export const pricingMatrixRelations = relations(pricingMatrix, ({ one }) => ({
  zone: one(destinationZones, {
    fields: [pricingMatrix.zoneId],
    references: [destinationZones.id],
  }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  initialOrders: many(initialOrders),
}));

export const initialOrdersRelations = relations(initialOrders, ({ one }) => ({
  customer: one(customers, {
    fields: [initialOrders.customerId],
    references: [customers.id],
  }),
  zone: one(destinationZones, {
    fields: [initialOrders.zoneId],
    references: [destinationZones.id],
  }),
  finalShipment: one(finalShipments, {
    fields: [initialOrders.id],
    references: [finalShipments.initialOrderId],
  }),
}));

export const carrierSuppliersRelations = relations(carrierSuppliers, ({ many }) => ({
  finalShipments: many(finalShipments),
}));

export const finalShipmentsRelations = relations(finalShipments, ({ one }) => ({
  initialOrder: one(initialOrders, {
    fields: [finalShipments.initialOrderId],
    references: [initialOrders.id],
  }),
  carrier: one(carrierSuppliers, {
    fields: [finalShipments.carrierId],
    references: [carrierSuppliers.id],
  }),
}));

export const journalEntriesRelations = relations(journalEntries, ({ many }) => ({
  lines: many(journalLines),
}));

export const journalLinesRelations = relations(journalLines, ({ one }) => ({
  journalEntry: one(journalEntries, {
    fields: [journalLines.journalEntryId],
    references: [journalEntries.id],
  }),
  account: one(chartOfAccounts, {
    fields: [journalLines.accountCode],
    references: [chartOfAccounts.accountCode],
  }),
}));
