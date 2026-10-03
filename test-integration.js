import assert from 'node:assert';
import { initializeDatabase, db } from './src/config/database.js';
import { CreateInitialOrderUseCase } from './src/use-cases/CreateInitialOrder.js';
import { DispatchToFinalUseCase } from './src/use-cases/DispatchToFinal.js';
import { GetFinancialSummaryUseCase } from './src/use-cases/GetFinancialSummary.js';
import { PricingCalculator } from './src/domain/services/PricingCalculator.js';

console.log('🧪 بدء الفحص الآلي الشامل لسلامة العمليات المحاسبية ودورة الشحن...');

// 1. Initialize DB
initializeDatabase();
console.log('✅ تهيئة قاعدة البيانات والجداول وبذور البيانات تمت بنجاح.');

// 2. Test Pricing Calculation
const volWeight = PricingCalculator.calculateVolumetricWeight(40, 30, 20); // (40*30*20)/5000 = 4.8
assert.strictEqual(volWeight, 4.8, 'Volumetric calculation must equal 4.8 kg');

const chargeable = PricingCalculator.determineChargeableWeight(3.0, volWeight);
assert.strictEqual(chargeable, 4.8, 'Chargeable weight must be max(3.0, 4.8) = 4.8');
console.log('✅ محرك احتساب الأوزان (الفعلي والحجمي والمفوتر) يعمل بدقة.');

// 3. Test Initial Order Creation (Cash Box Impact)
const initialSummary = GetFinancialSummaryUseCase.execute();
const cashBefore = initialSummary.kpi.cashBox;
const salesBefore = initialSummary.kpi.totalSales;

const order1 = CreateInitialOrderUseCase.execute({
  senderName: 'شركة تجريبية للاختبار',
  senderPhone: '+966500000001',
  receiverName: 'London Client Ltd',
  receiverPhone: '+447000000001',
  receiverAddress: '10 Downing St, London, UK',
  zoneId: 2, // Zone EU
  actualWeight: 2.5,
  dimensions: { length: 0, width: 0, height: 0 },
  paymentType: 'cash'
});

console.log(`✅ تم إنشاء الطلب الأولي بنجاح برقم: ${order1.orderNumber} بمبلغ: ${order1.totalSalesAmount}$ قيد: ${order1.journalEntryNumber}`);

const afterSummary1 = GetFinancialSummaryUseCase.execute();
assert.strictEqual(afterSummary1.kpi.cashBox, cashBefore + order1.totalSalesAmount, 'Cash box must increase by order total');
assert.strictEqual(afterSummary1.kpi.totalSales, salesBefore + order1.totalSalesAmount, 'Sales must increase by order total');
console.log('✅ التأثير المالي للطلب الأولي (الصندوق + المبيعات) مطابق 100%.');

// 4. Test Dispatch to Final (Supplier Waybill & Carrier Liability Impact)
const carriersPayableBefore = afterSummary1.kpi.accountsPayableCarriers;
const carrierCost = 35.00;
const supplierWaybill = `AWB-TEST-${Date.now()}`;

const dispatchResult = DispatchToFinalUseCase.execute({
  initialOrderId: order1.orderId,
  carrierId: 1, // DHL Express
  supplierWaybillNumber: supplierWaybill,
  carrierCost: carrierCost
});

console.log(`✅ تم ترحيل الطلب للنهائي بنجاح برقم بوليصة المورد: ${dispatchResult.supplierWaybillNumber} - ربح الشحنة: ${dispatchResult.grossProfit}$`);

const afterSummary2 = GetFinancialSummaryUseCase.execute();
assert.strictEqual(afterSummary2.kpi.accountsPayableCarriers, carriersPayableBefore + carrierCost, 'Supplier payables must increase by carrier cost');
assert.strictEqual(dispatchResult.grossProfit, order1.totalSalesAmount - carrierCost, 'Gross profit must equal sales - cost');
console.log('✅ التأثير المالي للطلب النهائي (المورد + التكلفة + هامش الربح) مطابق 100%.');

// 5. Test Waybill Uniqueness Constraint
assert.throws(() => {
  DispatchToFinalUseCase.execute({
    initialOrderId: order1.orderId,
    carrierId: 1,
    supplierWaybillNumber: supplierWaybill,
    carrierCost: 30
  });
}, /مسجل مسبقاً|مرحل مسبقاً/);
console.log('✅ حماية تكرار الترحيل أو تكرار بوليصة المورد تعمل بصلابة.');

// 6. Test Pricing Calculator Fix (Incremental Heavy Weight Calculation)
const heavyRate = PricingCalculator.evaluateRate(25.0, [
  { id: 1, tier_name: 'خفيف', weight_min_kg: 0, weight_max_kg: 1.0, base_selling_price: 25, extra_kg_price: 0 },
  { id: 2, tier_name: 'متوسط', weight_min_kg: 1.0, weight_max_kg: 5.0, base_selling_price: 45, extra_kg_price: 0 },
  { id: 3, tier_name: 'كبير', weight_min_kg: 5.0, weight_max_kg: 10.0, base_selling_price: 75, extra_kg_price: 0 },
  { id: 4, tier_name: 'ثقيل', weight_min_kg: 10.0, weight_max_kg: 999.0, base_selling_price: 75, extra_kg_price: 5.0 }
]);
// 25 kg should be 75 + (15 extra kg * 5) = 150
assert.strictEqual(heavyRate.extraWeightKg, 15, 'Extra weight must equal 15 kg');
assert.strictEqual(heavyRate.extraCharge, 75, 'Extra charge must equal 75$');
assert.strictEqual(heavyRate.totalSalesPrice, 150, 'Total sales price must equal 150$');
console.log('✅ فحص معالجة الكيلو الإضافي للشحن الثقيل: نجاح منع تسريب الإيرادات (150$ لـ 25 كجم).');

// 7. Test Credit Payment Validation (Customer must be required)
assert.throws(() => {
  CreateInitialOrderUseCase.execute({
    senderName: 'عميل آجل بدون حساب',
    senderPhone: '+966500000002',
    receiverName: 'Dubai Receiver',
    receiverPhone: '+971500000002',
    receiverAddress: 'Dubai Marina',
    zoneId: 1,
    actualWeight: 1.5,
    paymentType: 'credit' // بدون customerId
  });
}, /اختيار عميل مسجل/);
console.log('✅ حماية الدفع الآجل: منع إنشاء طلب آجل دون تحديد عميل مسجل.');

console.log('\n🎉🎉 كافة الفحوصات المحاسبية والأمنية والهندسية اجتازت بنجاح وبدون أي أخطاء! 🎉🎉\n');
