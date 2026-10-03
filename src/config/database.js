import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'shipping_erp.sqlite');
export const db = new DatabaseSync(dbPath);

// Enable foreign keys, WAL mode for resilience & concurrency
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA synchronous = NORMAL;');

export function initializeDatabase() {
  db.exec(`
    -- 1. دليل الحسابات المالي (Chart of Accounts)
    CREATE TABLE IF NOT EXISTS chart_of_accounts (
      account_code VARCHAR(20) PRIMARY KEY,
      account_name_ar VARCHAR(150) NOT NULL,
      account_name_en VARCHAR(150),
      account_type VARCHAR(30) NOT NULL, -- asset, liability, equity, revenue, expense
      current_balance NUMERIC(14, 2) DEFAULT 0.00
    );

    -- 2. العملاء (Customers)
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_code VARCHAR(30) UNIQUE NOT NULL,
      full_name VARCHAR(150) NOT NULL,
      phone VARCHAR(30) NOT NULL,
      address TEXT,
      current_balance NUMERIC(14, 2) DEFAULT 0.00,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. الموردين وشركات الشحن الناقلة (Carriers / Suppliers)
    CREATE TABLE IF NOT EXISTS carrier_suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      carrier_code VARCHAR(30) UNIQUE NOT NULL,
      name VARCHAR(150) NOT NULL,
      name_en VARCHAR(150),
      phone VARCHAR(30),
      current_balance NUMERIC(14, 2) DEFAULT 0.00, -- مستحقات المورد (دائن)
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 4. مناطق وجهات خدمات الشحن (Destination Zones)
    CREATE TABLE IF NOT EXISTS destination_zones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      zone_code VARCHAR(30) UNIQUE NOT NULL,
      name_ar VARCHAR(100) NOT NULL,
      name_en VARCHAR(100) NOT NULL,
      countries_list TEXT,
      description TEXT
    );

    -- 5. مصفوفة الشرائح والأسعار (Pricing Matrix)
    CREATE TABLE IF NOT EXISTS pricing_matrix (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      zone_id INTEGER NOT NULL REFERENCES destination_zones(id) ON DELETE CASCADE,
      tier_name VARCHAR(100) NOT NULL,
      tier_name_en VARCHAR(100),
      weight_min_kg NUMERIC(8, 3) NOT NULL,
      weight_max_kg NUMERIC(8, 3) NOT NULL,
      base_selling_price NUMERIC(12, 2) NOT NULL,
      extra_kg_price NUMERIC(12, 2) DEFAULT 0.00,
      estimated_cost NUMERIC(12, 2) DEFAULT 0.00,
      is_active INTEGER DEFAULT 1
    );

    -- 6. الطلب الأولي (Initial Orders)
    CREATE TABLE IF NOT EXISTS initial_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number VARCHAR(40) UNIQUE NOT NULL, -- رقم تسلسلي مستقل
      customer_id INTEGER REFERENCES customers(id),
      sender_name VARCHAR(150) NOT NULL,
      sender_phone VARCHAR(30) NOT NULL,
      receiver_name VARCHAR(150) NOT NULL,
      receiver_phone VARCHAR(30) NOT NULL,
      receiver_address TEXT NOT NULL,
      zone_id INTEGER NOT NULL REFERENCES destination_zones(id),
      actual_weight NUMERIC(8, 3) NOT NULL,
      volumetric_weight NUMERIC(8, 3) DEFAULT 0.00,
      chargeable_weight NUMERIC(8, 3) NOT NULL,
      total_sales_amount NUMERIC(12, 2) NOT NULL,
      payment_type VARCHAR(30) NOT NULL, -- 'cash' (الصندوق), 'bank' (الصراف/البنك), 'credit' (على حساب العميل)
      status VARCHAR(30) DEFAULT 'initial', -- 'initial' (طلب أولي معلق), 'final_dispatched' (مرحل نهائي), 'cancelled'
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 7. الترحيل إلى نهائي ببوليصة المورد (Final Shipments)
    CREATE TABLE IF NOT EXISTS final_shipments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      initial_order_id INTEGER UNIQUE NOT NULL REFERENCES initial_orders(id) ON DELETE RESTRICT,
      carrier_id INTEGER NOT NULL REFERENCES carrier_suppliers(id) ON DELETE RESTRICT,
      supplier_waybill_number VARCHAR(100) UNIQUE NOT NULL, -- رقم البوليصة الواردة من المورد
      carrier_cost NUMERIC(12, 2) NOT NULL, -- تكلفة المورد المستحقة له
      gross_profit NUMERIC(12, 2) NOT NULL, -- صافي الربح المحقق (المبيعات - التكلفة)
      dispatched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      notes TEXT
    );

    -- 8. القيود المحاسبية اليومية المزدوجة (Journal Entries)
    CREATE TABLE IF NOT EXISTS journal_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_number VARCHAR(40) UNIQUE NOT NULL,
      entry_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      reference_type VARCHAR(40) NOT NULL, -- 'initial_order' | 'final_shipment' | 'settlement'
      reference_id VARCHAR(50) NOT NULL,
      total_debit NUMERIC(14, 2) NOT NULL,
      total_credit NUMERIC(14, 2) NOT NULL,
      description TEXT NOT NULL
    );

    -- 9. أطراف القيود المحاسبية (Journal Lines)
    CREATE TABLE IF NOT EXISTS journal_lines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      journal_entry_id INTEGER NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
      account_code VARCHAR(20) NOT NULL REFERENCES chart_of_accounts(account_code),
      debit_amount NUMERIC(14, 2) DEFAULT 0.00,
      credit_amount NUMERIC(14, 2) DEFAULT 0.00,
      memo TEXT
    );

    -- 10. حركات الصناديق والصرافين (Cash & Exchange Vaults)
    CREATE TABLE IF NOT EXISTS cash_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_code VARCHAR(20) NOT NULL,
      order_id INTEGER REFERENCES initial_orders(id),
      movement_type VARCHAR(20) NOT NULL, -- 'inflow', 'outflow'
      amount NUMERIC(14, 2) NOT NULL,
      balance_after NUMERIC(14, 2) NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 11. إدارة المستخدمين وتوزيع الصلاحيات (Users & RBAC Roles)
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      salt VARCHAR(64) NOT NULL,
      full_name VARCHAR(150) NOT NULL,
      role VARCHAR(30) NOT NULL, -- 'admin', 'cashier', 'warehouse', 'accountant'
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Safe migrations for bilingual columns
  function safeAddColumn(sql) {
    try {
      db.exec(sql);
    } catch (e) {
      if (!e.message || !e.message.includes('duplicate column name')) {
        console.warn(`[DB Migration Warning] ${e.message}`);
      }
    }
  }
  safeAddColumn("ALTER TABLE chart_of_accounts ADD COLUMN account_name_en VARCHAR(150);");
  safeAddColumn("ALTER TABLE carrier_suppliers ADD COLUMN name_en VARCHAR(150);");
  safeAddColumn("ALTER TABLE pricing_matrix ADD COLUMN tier_name_en VARCHAR(100);");

  seedInitialData();
}

function seedInitialData() {
  // 1. Chart of Accounts
  const countAccounts = db.prepare('SELECT count(*) as count FROM chart_of_accounts').get().count;
  if (countAccounts === 0) {
    const insertAccount = db.prepare(`
      INSERT INTO chart_of_accounts (account_code, account_name_ar, account_name_en, account_type, current_balance)
      VALUES (?, ?, ?, ?, 0.00)
    `);

    insertAccount.run('1010', 'الصندوق الرئيسي (Cash Box)', 'Main Cash Drawer', 'asset');
    insertAccount.run('1020', 'حساب الصراف / البنك (Exchange/Bank)', 'Bank & Exchange Vault', 'asset');
    insertAccount.run('1100', 'ذمم العملاء (Accounts Receivable)', 'Accounts Receivable (Customers)', 'asset');
    insertAccount.run('2100', 'ذمم الموردين وشركات الشحن (Accounts Payable)', 'Accounts Payable (Carriers)', 'liability');
    insertAccount.run('4100', 'إيرادات مبيعات خدمات الشحن (Shipping Sales)', 'Shipping Sales Revenue', 'revenue');
    insertAccount.run('5100', 'تكلفة مبيعات خدمات الشحن (Cost of Shipping / COGS)', 'Cost of Shipping Services', 'expense');
  } else {
    // Ensure English names are populated
    db.prepare("UPDATE chart_of_accounts SET account_name_en = 'Main Cash Drawer' WHERE account_code = '1010'").run();
    db.prepare("UPDATE chart_of_accounts SET account_name_en = 'Bank & Exchange Vault' WHERE account_code = '1020'").run();
    db.prepare("UPDATE chart_of_accounts SET account_name_en = 'Accounts Receivable (Customers)' WHERE account_code = '1100'").run();
    db.prepare("UPDATE chart_of_accounts SET account_name_en = 'Accounts Payable (Carriers)' WHERE account_code = '2100'").run();
    db.prepare("UPDATE chart_of_accounts SET account_name_en = 'Shipping Sales Revenue' WHERE account_code = '4100'").run();
    db.prepare("UPDATE chart_of_accounts SET account_name_en = 'Cost of Shipping Services' WHERE account_code = '5100'").run();
  }

  // 2. Destination Zones
  const countZones = db.prepare('SELECT count(*) as count FROM destination_zones').get().count;
  if (countZones === 0) {
    const insertZone = db.prepare(`
      INSERT INTO destination_zones (zone_code, name_ar, name_en, countries_list, description)
      VALUES (?, ?, ?, ?, ?)
    `);

    const z1 = insertZone.run(
      'ZONE-GULF',
      'دول الخليج العربي',
      'Arabian Gulf Countries',
      'السعودية، الإمارات، الكويت، قطر، عمان، البحرين',
      'شحن بري وجوي سريع واقتصادي لمنطقة الخليج'
    );
    const z2 = insertZone.run(
      'ZONE-EU',
      'الدول الأوروبية',
      'European Union & UK',
      'بريطانيا، ألمانيا، فرنسا، إيطاليا، هولندا، إسبانيا...',
      'شحن جوي سريع واقتصادي للمدن الأوروبية'
    );
    const z3 = insertZone.run(
      'ZONE-US',
      'أمريكا الشمالية (أمريكا وكندا)',
      'North America (USA & Canada)',
      'الولايات المتحدة، كندا',
      'خدمات التوصيل المباشر والتجارة الإلكترونية'
    );
    const z4 = insertZone.run(
      'ZONE-ASIA',
      'شرق آسيا وبقية دول العالم',
      'Asia & Rest of World',
      'الصين، تركيا، ماليزيا، أستراليا، اليابان...',
      'تغطية الوجهات العالمية الأخرى'
    );

    // 3. Pricing Matrix Tiers
    const insertTier = db.prepare(`
      INSERT INTO pricing_matrix (zone_id, tier_name, weight_min_kg, weight_max_kg, base_selling_price, extra_kg_price, estimated_cost)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // Zone 1 Tiers
    insertTier.run(Number(z1.lastInsertRowid), 'شريحة الطرود الخفيفة (0 - 1 كجم)', 0, 1.0, 25.00, 0.00, 15.00);
    insertTier.run(Number(z1.lastInsertRowid), 'شريحة الطرود المتوسطة (1.001 - 5 كجم)', 1.001, 5.0, 45.00, 0.00, 28.00);
    insertTier.run(Number(z1.lastInsertRowid), 'شريحة الطرود الكبيرة (5.001 - 10 كجم)', 5.001, 10.0, 75.00, 0.00, 45.00);
    insertTier.run(Number(z1.lastInsertRowid), 'شريحة الشحن الثقيل (أكثر من 10 كجم)', 10.001, 999.0, 75.00, 5.00, 3.50);

    // Zone 2 Tiers
    insertTier.run(Number(z2.lastInsertRowid), 'شريحة الطرود الخفيفة (0 - 1 كجم)', 0, 1.0, 35.00, 0.00, 22.00);
    insertTier.run(Number(z2.lastInsertRowid), 'شريحة الطرود المتوسطة (1.001 - 5 كجم)', 1.001, 5.0, 65.00, 0.00, 40.00);
    insertTier.run(Number(z2.lastInsertRowid), 'شريحة الطرود الكبيرة (5.001 - 10 كجم)', 5.001, 10.0, 110.00, 0.00, 70.00);
    insertTier.run(Number(z2.lastInsertRowid), 'شريحة الشحن الثقيل (أكثر من 10 كجم)', 10.001, 999.0, 110.00, 8.00, 5.50);

    // Zone 3 Tiers
    insertTier.run(Number(z3.lastInsertRowid), 'شريحة الطرود الخفيفة (0 - 1 كجم)', 0, 1.0, 40.00, 0.00, 25.00);
    insertTier.run(Number(z3.lastInsertRowid), 'شريحة الطرود المتوسطة (1.001 - 5 كجم)', 1.001, 5.0, 75.00, 0.00, 48.00);
    insertTier.run(Number(z3.lastInsertRowid), 'شريحة الطرود الكبيرة (5.001 - 10 كجم)', 5.001, 10.0, 125.00, 0.00, 80.00);
    insertTier.run(Number(z3.lastInsertRowid), 'شريحة الشحن الثقيل (أكثر من 10 كجم)', 10.001, 999.0, 125.00, 9.50, 6.50);

    // Zone 4 Tiers
    insertTier.run(Number(z4.lastInsertRowid), 'شريحة الطرود الخفيفة (0 - 1 كجم)', 0, 1.0, 45.00, 0.00, 28.00);
    insertTier.run(Number(z4.lastInsertRowid), 'شريحة الطرود المتوسطة (1.001 - 5 كجم)', 1.001, 5.0, 85.00, 0.00, 55.00);
    insertTier.run(Number(z4.lastInsertRowid), 'شريحة الطرود الكبيرة (5.001 - 10 كجم)', 5.001, 10.0, 140.00, 0.00, 90.00);
    insertTier.run(Number(z4.lastInsertRowid), 'شريحة الشحن الثقيل (أكثر من 10 كجم)', 10.001, 999.0, 140.00, 11.00, 7.50);
  }

  // 4. Carrier Suppliers
  const countCarriers = db.prepare('SELECT count(*) as count FROM carrier_suppliers').get().count;
  if (countCarriers === 0) {
    const insertCarrier = db.prepare(`
      INSERT INTO carrier_suppliers (carrier_code, name, name_en, phone, current_balance)
      VALUES (?, ?, ?, ?, 0.00)
    `);
    insertCarrier.run('CAR-DHL', 'دي إتش إل إكسبريس (DHL Express)', 'DHL Express', '+966 800 345 000');
    insertCarrier.run('CAR-ARAMEX', 'أرامكس الدولية (Aramex International)', 'Aramex International', '+966 920 027 447');
    insertCarrier.run('CAR-FEDEX', 'فيديكس العالمية (FedEx)', 'FedEx Global', '+966 800 244 2222');
    insertCarrier.run('CAR-GULF', 'شركة أجنحة الخليج للنقل السريع', 'Gulf Wings Express Logistics', '+966 50 888 9999');
  } else {
    try {
      db.prepare("UPDATE carrier_suppliers SET name_en = 'DHL Express' WHERE carrier_code = 'CAR-DHL'").run();
      db.prepare("UPDATE carrier_suppliers SET name_en = 'Aramex International' WHERE carrier_code = 'CAR-ARAMEX'").run();
      db.prepare("UPDATE carrier_suppliers SET name_en = 'FedEx Global' WHERE carrier_code = 'CAR-FEDEX'").run();
      db.prepare("UPDATE carrier_suppliers SET name_en = 'Gulf Wings Express Logistics' WHERE carrier_code = 'CAR-GULF'").run();
    } catch (e) {}
  }

  // 5. Default Customers
  const countCustomers = db.prepare('SELECT count(*) as count FROM customers').get().count;
  if (countCustomers === 0) {
    const insertCust = db.prepare(`
      INSERT INTO customers (customer_code, full_name, phone, address, current_balance)
      VALUES (?, ?, ?, ?, 0.00)
    `);
    insertCust.run('CUST-1001', 'مؤسسة الرياض التجارية', '+966 50 111 2233', 'الرياض - الملز');
    insertCust.run('CUST-1002', 'شركة الأفق الدولية للاستيراد', '+966 55 444 7788', 'جدة - طريق الملك');
  }

  // 6. Users & RBAC Roles (بذور المستخدمين وصلاحياتهم)
  const countUsers = db.prepare('SELECT count(*) as count FROM users').get().count;
  if (countUsers === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (username, password_hash, salt, full_name, role, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `);

    // Helper to generate scrypt hash
    const makeHash = (pwd) => {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.scryptSync(pwd, salt, 64).toString('hex');
      return { hash, salt };
    };

    // 1. المدير العام (Full Access)
    const adminHash = makeHash('admin123');
    insertUser.run('admin', adminHash.hash, adminHash.salt, 'المدير العام (System Admin)', 'admin');

    // 2. كاشير الاستقبال (Booking & Cash only)
    const cashierHash = makeHash('cashier123');
    insertUser.run('cashier', cashierHash.hash, cashierHash.salt, 'أحمد الكاشير (موظف الاستقبال)', 'cashier');

    // 3. مسؤول المستودع (Dispatch & Waybills only)
    const whHash = makeHash('wh123');
    insertUser.run('warehouse', whHash.hash, whHash.salt, 'فهد المستودع (مسؤول الترحيل)', 'warehouse');

    // 4. المحاسب المالي (Ledger & Financial Statements only)
    const accHash = makeHash('acc123');
    insertUser.run('accountant', accHash.hash, accHash.salt, 'سالم المحاسب (المحاسب المالي)', 'accountant');
  }
}
