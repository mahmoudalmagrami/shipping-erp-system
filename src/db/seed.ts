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
import crypto from 'crypto';
import { fileURLToPath } from 'url';

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export async function seed() {
  try {
    logger.info('Starting seed...');

    // 1. Chart of Accounts (دليل الحسابات المالي)
    await db.insert(chartOfAccounts).values([
      { accountCode: '1010', accountNameAr: 'الصندوق الرئيسي (Cash Box)', accountNameEn: 'Main Cash Drawer', accountType: 'asset' },
      { accountCode: '1020', accountNameAr: 'حساب الصراف / البنك (Exchange/Bank)', accountNameEn: 'Bank & Exchange Vault', accountType: 'asset' },
      { accountCode: '1100', accountNameAr: 'ذمم العملاء (Accounts Receivable)', accountNameEn: 'Accounts Receivable (Customers)', accountType: 'asset' },
      { accountCode: '2100', accountNameAr: 'ذمم الموردين وشركات الشحن (Accounts Payable)', accountNameEn: 'Accounts Payable (Carriers)', accountType: 'liability' },
      { accountCode: '4100', accountNameAr: 'إيرادات مبيعات خدمات الشحن (Shipping Sales)', accountNameEn: 'Shipping Sales Revenue', accountType: 'revenue' },
      { accountCode: '5100', accountNameAr: 'تكلفة مبيعات خدمات الشحن (COGS)', accountNameEn: 'Cost of Shipping Services', accountType: 'expense' },
    ]).onConflictDoNothing();

    // 2. Destination Zones (مناطق الوجهات)
    await db.insert(destinationZones).values([
      { zoneCode: 'ZONE-GULF', nameAr: 'دول الخليج العربي', nameEn: 'Arabian Gulf Countries', countriesList: 'السعودية، الإمارات، الكويت، قطر، عمان، البحرين', description: 'شحن بري وجوي سريع واقتصادي لمنطقة الخليج' },
      { zoneCode: 'ZONE-EU', nameAr: 'الدول الأوروبية', nameEn: 'European Union & UK', countriesList: 'بريطانيا، ألمانيا، فرنسا، إيطاليا، هولندا، إسبانيا...', description: 'شحن جوي سريع واقتصادي للمدن الأوروبية' },
      { zoneCode: 'ZONE-US', nameAr: 'أمريكا الشمالية (أمريكا وكندا)', nameEn: 'North America (USA & Canada)', countriesList: 'الولايات المتحدة، كندا', description: 'خدمات التوصيل المباشر والتجارة الإلكترونية' },
      { zoneCode: 'ZONE-ASIA', nameAr: 'شرق آسيا وبقية دول العالم', nameEn: 'Asia & Rest of World', countriesList: 'الصين، تركيا، ماليزيا، أستراليا، اليابان...', description: 'تغطية الوجهات العالمية الأخرى' },
    ]).onConflictDoNothing();

    const zones = await db.select().from(destinationZones);

    // 3. Pricing Matrix (مصفوفة الشرائح والأسعار)
    const tiersDefinition = [
      { name: 'شريحة الطرود الخفيفة (0 - 1 كجم)', nameEn: 'Light (0 - 1 kg)', min: '0', max: '1.000', base: '25.00', extra: '0.00', cost: '15.00' },
      { name: 'شريحة الطرود المتوسطة (1.001 - 5 كجم)', nameEn: 'Medium (1.001 - 5 kg)', min: '1.001', max: '5.000', base: '45.00', extra: '0.00', cost: '28.00' },
      { name: 'شريحة الطرود الكبيرة (5.001 - 10 كجم)', nameEn: 'Large (5.001 - 10 kg)', min: '5.001', max: '10.000', base: '75.00', extra: '0.00', cost: '45.00' },
      { name: 'شريحة الشحن الثقيل (أكثر من 10 كجم)', nameEn: 'Heavy (10+ kg)', min: '10.001', max: '999.000', base: '75.00', extra: '5.00', cost: '3.50' },
    ];

    for (const zone of zones) {
      for (const t of tiersDefinition) {
        await db.insert(pricingMatrix).values({
          zoneId: zone.id,
          tierName: t.name,
          tierNameEn: t.nameEn,
          weightMinKg: t.min,
          weightMaxKg: t.max,
          baseSellingPrice: t.base,
          extraKgPrice: t.extra,
          estimatedCost: t.cost,
          isActive: true,
        }).onConflictDoNothing();
      }
    }

    // 4. Carriers (الناقلين والموردين)
    await db.insert(carrierSuppliers).values([
      { carrierCode: 'CAR-DHL', name: 'دي إتش إل إكسبريس (DHL Express)', nameEn: 'DHL Express', phone: '+966 800 345 000' },
      { carrierCode: 'CAR-ARAMEX', name: 'أرامكس الدولية (Aramex International)', nameEn: 'Aramex International', phone: '+966 920 027 447' },
      { carrierCode: 'CAR-FEDEX', name: 'فيديكس العالمية (FedEx)', nameEn: 'FedEx Global', phone: '+966 800 244 2222' },
      { carrierCode: 'CAR-GULF', name: 'شركة أجنحة الخليج للنقل السريع', nameEn: 'Gulf Wings Express Logistics', phone: '+966 50 888 9999' },
    ]).onConflictDoNothing();

    // 5. Default Customers (العملاء الافتراضيين)
    await db.insert(customers).values([
      { customerCode: 'CUST-1001', fullName: 'مؤسسة الرياض التجارية', phone: '+966 50 111 2233', address: 'الرياض - الملز' },
      { customerCode: 'CUST-1002', fullName: 'شركة الأفق الدولية للاستيراد', phone: '+966 55 444 7788', address: 'جدة - طريق الملك' },
    ]).onConflictDoNothing();

    // 6. Users (المستخدمين وصلاحياتهم)
    const adminAuth = hashPassword('admin123');
    const cashierAuth = hashPassword('cashier123');
    const warehouseAuth = hashPassword('wh123');
    const accountantAuth = hashPassword('acc123');

    await db.insert(users).values([
      { username: 'admin', passwordHash: adminAuth.hash, salt: adminAuth.salt, fullName: 'المدير العام (System Admin)', role: 'admin' },
      { username: 'cashier', passwordHash: cashierAuth.hash, salt: cashierAuth.salt, fullName: 'أحمد الكاشير (موظف الاستقبال)', role: 'cashier' },
      { username: 'warehouse', passwordHash: warehouseAuth.hash, salt: warehouseAuth.salt, fullName: 'فهد المستودع (مسؤول الترحيل)', role: 'warehouse' },
      { username: 'accountant', passwordHash: accountantAuth.hash, salt: accountantAuth.salt, fullName: 'سالم المحاسب (المحاسب المالي)', role: 'accountant' },
    ]).onConflictDoNothing();

    logger.info('Database seed completed successfully.');
  } catch (error) {
    logger.error({ error }, 'Database seed failed');
    throw error;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed()
    .then(() => queryClient.close())
    .catch(() => process.exit(1));
}
