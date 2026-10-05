import { db, queryClient } from './index.js';
import { 
  chartOfAccounts, 
  destinationZones, 
  pricingMatrix, 
  carrierSuppliers, 
  customers, 
  users 
} from './schema.js';
import { logger } from '../config/logger.js';
import * as crypto from 'crypto';

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

async function seed() {
  try {
    logger.info('Starting seed...');

    // Chart of Accounts (دليل الحسابات)
    await db.insert(chartOfAccounts).values([
      { accountCode: '1010', accountNameAr: 'النقدية بالصندوق', accountNameEn: 'Main Cash', accountType: 'asset' },
      { accountCode: '1020', accountNameAr: 'البنك / الصرافة', accountNameEn: 'Bank/Exchange', accountType: 'asset' },
      { accountCode: '1100', accountNameAr: 'الذمم المدينة', accountNameEn: 'AR', accountType: 'asset' },
      { accountCode: '2100', accountNameAr: 'الذمم الدائنة', accountNameEn: 'AP', accountType: 'liability' },
      { accountCode: '4100', accountNameAr: 'إيرادات المبيعات', accountNameEn: 'Sales Revenue', accountType: 'revenue' },
      { accountCode: '5100', accountNameAr: 'تكلفة البضاعة المباعة', accountNameEn: 'COGS', accountType: 'expense' },
    ]).onConflictDoNothing();

    // Destination Zones (مناطق التوصيل)
    await db.insert(destinationZones).values([
      { zoneCode: 'ZONE_GULF', nameAr: 'دول الخليج', nameEn: 'Gulf', countriesList: 'KSA, UAE, Qatar, Bahrain, Kuwait, Oman', description: 'Gulf Cooperation Council countries' },
      { zoneCode: 'ZONE_EU', nameAr: 'أوروبا', nameEn: 'EU', countriesList: 'UK, France, Germany, Italy', description: 'European Union & UK' },
      { zoneCode: 'ZONE_NA', nameAr: 'أمريكا وكندا', nameEn: 'US/Canada', countriesList: 'USA, Canada', description: 'North America' },
      { zoneCode: 'ZONE_ASIA_ROW', nameAr: 'آسيا وباقي العالم', nameEn: 'Asia/ROW', countriesList: 'China, India, Japan, Australia', description: 'Asia and Rest of World' },
    ]).onConflictDoNothing();

    const zones = await db.select().from(destinationZones);

    // Pricing Matrix (مصفوفة التسعير)
    const tiers = [
      { name: 'Light', en: 'Light', min: '0', max: '1' },
      { name: 'Medium', en: 'Medium', min: '1.001', max: '5' },
      { name: 'Large', en: 'Large', min: '5.001', max: '10' },
      { name: 'Heavy', en: 'Heavy', min: '10.001', max: '999' },
    ];

    for (const zone of zones) {
      for (const tier of tiers) {
        await db.insert(pricingMatrix).values({
          zoneId: zone.id,
          tierName: tier.name,
          tierNameEn: tier.en,
          weightMinKg: tier.min,
          weightMaxKg: tier.max,
          baseSellingPrice: '100',
          extraKgPrice: tier.name === 'Heavy' ? '10' : '0',
          estimatedCost: '50',
        }).onConflictDoNothing();
      }
    }

    // Carriers (الموردين / شركات الشحن)
    await db.insert(carrierSuppliers).values([
      { carrierCode: 'CAR_DHL', name: 'دي إتش إل', nameEn: 'DHL', phone: '123456789' },
      { carrierCode: 'CAR_ARX', name: 'أرامكس', nameEn: 'Aramex', phone: '123456789' },
      { carrierCode: 'CAR_FDX', name: 'فيديكس', nameEn: 'FedEx', phone: '123456789' },
      { carrierCode: 'CAR_GW', name: 'جلف وينجز', nameEn: 'Gulf Wings', phone: '123456789' },
    ]).onConflictDoNothing();

    // Customers (العملاء)
    await db.insert(customers).values([
      { customerCode: 'CUST_001', fullName: 'الرياض للتجارة', phone: '987654321', address: 'الرياض' },
      { customerCode: 'CUST_002', fullName: 'أفق الدولية', phone: '987654321', address: 'جدة' },
    ]).onConflictDoNothing();

    // Users (المستخدمين)
    const adminAuth = hashPassword('admin123');
    const cashierAuth = hashPassword('cashier123');
    const warehouseAuth = hashPassword('wh123');
    const accountantAuth = hashPassword('acc123');

    await db.insert(users).values([
      { username: 'admin', passwordHash: adminAuth.hash, salt: adminAuth.salt, fullName: 'مدير النظام', role: 'admin' },
      { username: 'cashier', passwordHash: cashierAuth.hash, salt: cashierAuth.salt, fullName: 'موظف المبيعات', role: 'cashier' },
      { username: 'warehouse', passwordHash: warehouseAuth.hash, salt: warehouseAuth.salt, fullName: 'موظف المستودع', role: 'warehouse' },
      { username: 'accountant', passwordHash: accountantAuth.hash, salt: accountantAuth.salt, fullName: 'المحاسب', role: 'accountant' },
    ]).onConflictDoNothing();

    logger.info('Seed completed successfully.');
  } catch (error) {
    logger.error({ error }, 'Seed failed');
  } finally {
    await queryClient.end();
  }
}

seed();
