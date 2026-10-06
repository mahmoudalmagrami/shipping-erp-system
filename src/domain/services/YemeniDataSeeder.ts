import { db } from '../../db/index.js';
import { 
  destinationZones, 
  pricingMatrix, 
  carrierSuppliers, 
  customers, 
  initialOrders, 
  finalShipments, 
  journalEntries 
} from '../../db/schema.js';
import { AccountingEngine } from './AccountingEngine.js';
import { logger } from '../../config/logger.js';
import { eq } from 'drizzle-orm';

export class YemeniDataSeeder {
  static async seed() {
    logger.info('Starting Yemeni Mock Data Seeder...');

    // 1. Yemeni Destination Zones
    const yemeniZones = [
      { zoneCode: 'ZONE-SAA', nameAr: 'صنعاء وأمانة العاصمة', nameEn: 'Sanaa & Capital Hub', countriesList: 'اليمن - صنعاء وضواحيها', description: 'المستودع الرئيسي - التوزيع في أمانة العاصمة' },
      { zoneCode: 'ZONE-ADE', nameAr: 'عدن والمحافظات الجنوبية', nameEn: 'Aden & Southern Hub', countriesList: 'عدن، لحج، أبين', description: 'محطة الشحن البحري والجوي المركزية' },
      { zoneCode: 'ZONE-HADH', nameAr: 'حضرموت (المكلا وسيئون)', nameEn: 'Hadhramout (Mukalla & Seiyun)', countriesList: 'المكلا، سيئون، الشحر، تريم', description: 'خط ساحل ووادي حضرموت' },
      { zoneCode: 'ZONE-TAI', nameAr: 'تعز والساحل الغربي', nameEn: 'Taiz & West Coast Hub', countriesList: 'تعز، الحوبان، المخا، التربة', description: 'شحن الطرود والبضائع لتعز والمخا' },
      { zoneCode: 'ZONE-MAR', nameAr: 'مأرب وشبوة', nameEn: 'Marib & Shabwah Hub', countriesList: 'مأرب، عتق، بيحان، الجوف', description: 'الخط التجاري الشرقي' },
      { zoneCode: 'ZONE-KSA', nameAr: 'الخط الدولي (اليمن ⇄ الرياض/جدة)', nameEn: 'International Yemen-KSA Route', countriesList: 'منفذ الوديعة، شرورة، الرياض، جدة', description: 'شحن بري سريع بين المدن اليمنية والسعودية' },
    ];

    for (const z of yemeniZones) {
      await db.insert(destinationZones).values(z).onConflictDoNothing();
    }

    const allZones = await db.select().from(destinationZones);

    // 2. Pricing Tiers for zones
    const existingTiers = await db.select().from(pricingMatrix);
    const zoneIdsWithTiers = new Set(existingTiers.map(t => t.zoneId));

    for (const zone of allZones) {
      if (!zoneIdsWithTiers.has(zone.id)) {
        await db.insert(pricingMatrix).values([
          { zoneId: zone.id, tierName: 'شريحة الطرود الخفيفة (0 - 1 كجم)', tierNameEn: 'Light (0-1kg)', weightMinKg: '0', weightMaxKg: '1.000', baseSellingPrice: '35.00', extraKgPrice: '0.00', estimatedCost: '20.00', isActive: true },
          { zoneId: zone.id, tierName: 'شريحة الطرود المتوسطة (1.001 - 5 كجم)', tierNameEn: 'Medium (1-5kg)', weightMinKg: '1.001', weightMaxKg: '5.000', baseSellingPrice: '60.00', extraKgPrice: '0.00', estimatedCost: '36.00', isActive: true },
          { zoneId: zone.id, tierName: 'شريحة الطرود الكبيرة (5.001 - 10 كجم)', tierNameEn: 'Large (5-10kg)', weightMinKg: '5.001', weightMaxKg: '10.000', baseSellingPrice: '95.00', extraKgPrice: '0.00', estimatedCost: '58.00', isActive: true },
          { zoneId: zone.id, tierName: 'شريحة الشحن الثقيل (أكثر من 10 كجم)', tierNameEn: 'Heavy (10+ kg)', weightMinKg: '10.001', weightMaxKg: '999.000', baseSellingPrice: '95.00', extraKgPrice: '8.00', estimatedCost: '5.00', isActive: true },
        ]);
      }
    }

    // 3. Yemeni Carriers
    const yemeniCarriers = [
      { carrierCode: 'CAR-RUW', name: 'شركة الرويشان للنقل السريع', nameEn: 'Al-Rowaishan Express', phone: '+967 777 123 456' },
      { carrierCode: 'CAR-BURAQ', name: 'شركة البراق للنقل والشحن الدولي', nameEn: 'Al-Buraq International Cargo', phone: '+967 733 987 654' },
      { carrierCode: 'CAR-RAHA', name: 'شركة راحة إكسبريس للخدمات اللوجستية', nameEn: 'Raha Express Logistics', phone: '+967 711 555 444' },
      { carrierCode: 'CAR-INJAZ', name: 'شركة الإنجاز للنقل البري والطرود', nameEn: 'Al-Injaz Cargo & Parcel Express', phone: '+967 770 222 333' },
      { carrierCode: 'CAR-ARAMEX-YE', name: 'أرامكس اليمن (Aramex Yemen)', nameEn: 'Aramex Yemen Logistics', phone: '+967 1 448 888' },
      { carrierCode: 'CAR-DHL-YE', name: 'دي إتش إل إكسبريس عدن وصنعاء', nameEn: 'DHL Express Yemen', phone: '+967 2 245 555' },
    ];

    for (const c of yemeniCarriers) {
      await db.insert(carrierSuppliers).values({
        carrierCode: c.carrierCode,
        name: c.name,
        nameEn: c.nameEn,
        phone: c.phone,
        currentBalance: '0.00',
      }).onConflictDoNothing();
    }

    const allCarriers = await db.select().from(carrierSuppliers);

    // 4. Yemeni Customers
    const yemeniCustomers = [
      { customerCode: 'CUST-701', fullName: 'المهندس صادق محمد الحاشدي', phone: '+967 771 234 567', address: 'صنعاء - شارع حدة، برج الأمل' },
      { customerCode: 'CUST-702', fullName: 'الشيخ وضاح عبدالرحمن السقاف', phone: '+967 733 456 789', address: 'عدن - المعلا، الشارع الرئيسي' },
      { customerCode: 'CUST-703', fullName: 'فؤاد سالم باوزير', phone: '+967 711 789 123', address: 'المكلا - حي الديس، بجانب البريد' },
      { customerCode: 'CUST-704', fullName: 'أصيل مروان الصنوي', phone: '+967 777 987 654', address: 'تعز - شارع جمال، عمارة التضامن' },
      { customerCode: 'CUST-705', fullName: 'نبيل عبدالكريم القاسمي', phone: '+967 734 555 666', address: 'إب - الدائري الغربي، مفرق جبلة' },
      { customerCode: 'CUST-706', fullName: 'معاذ عبدالله العولقي', phone: '+967 712 333 444', address: 'شبوة - عتق، السوق العام' },
      { customerCode: 'CUST-707', fullName: 'عمر صالح باعباد', phone: '+967 775 666 777', address: 'سيئون - حي القرن، مقابل الغرفة التجارية' },
      { customerCode: 'CUST-708', fullName: 'توفيق حميد المقطري', phone: '+967 736 888 999', address: 'مأرب - شارع الأربعين، مجمع النور' },
      { customerCode: 'CUST-709', fullName: 'بشير أحمد الشرجبي', phone: '+967 772 111 222', address: 'صنعاء - الستين الجنوبي، قرب الجامعة' },
      { customerCode: 'CUST-710', fullName: 'خالد يحيى الكبسي', phone: '+967 735 999 000', address: 'الحديدة - شارع الميناء، جوار الغرفة الملاحية' },
    ];

    for (const cust of yemeniCustomers) {
      await db.insert(customers).values({
        customerCode: cust.customerCode,
        fullName: cust.fullName,
        phone: cust.phone,
        address: cust.address,
        currentBalance: '0.00',
      }).onConflictDoNothing();
    }

    const allCustomers = await db.select().from(customers);

    // Receivers list
    const receiversList = [
      { name: 'عمار ياسر الأهدل', phone: '+967 773 222 111', address: 'صنعاء - التحرير' },
      { name: 'سالم عوض بارحيم', phone: '+967 713 444 555', address: 'المكلا - فوه، الإنشاءات' },
      { name: 'مروان سعيد شمسان', phone: '+967 770 666 555', address: 'عدن - كريتر، شارع أروى' },
      { name: 'عبدالسلام مهيوب المخلافي', phone: '+967 737 111 444', address: 'تعز - وادي القاضي' },
      { name: 'فيصل صالح بن حبريش', phone: '+967 715 888 222', address: 'سيئون - السحيل' },
      { name: 'حمزة محمد الوادعي', phone: '+967 774 999 333', address: 'مأرب - المجمع الحكومي' },
      { name: 'زياد طارق اليافعي', phone: '+967 738 777 333', address: 'عدن - المنصورة، ريمي' },
      { name: 'أحمد فضل العريقي', phone: '+967 779 123 789', address: 'صنعاء - الأصبحي' },
    ];

    // 5. Generate 28 Realistic Yemeni Shipments across the last 14 days
    const shipmentTemplates = [
      { senderIdx: 0, recIdx: 1, weight: 1.5, amount: 60.00, carrierCost: 36.00, pType: 'cash', status: 'final_dispatched', dayOffset: 13 },
      { senderIdx: 1, recIdx: 0, weight: 3.2, amount: 60.00, carrierCost: 35.00, pType: 'bank', status: 'final_dispatched', dayOffset: 12 },
      { senderIdx: 2, recIdx: 2, weight: 0.8, amount: 35.00, carrierCost: 20.00, pType: 'cash', status: 'final_dispatched', dayOffset: 12 },
      { senderIdx: 3, recIdx: 3, weight: 6.4, amount: 95.00, carrierCost: 55.00, pType: 'credit', status: 'final_dispatched', dayOffset: 11 },
      { senderIdx: 4, recIdx: 4, weight: 2.1, amount: 60.00, carrierCost: 36.00, pType: 'cash', status: 'final_dispatched', dayOffset: 10 },
      { senderIdx: 5, recIdx: 5, weight: 8.0, amount: 95.00, carrierCost: 58.00, pType: 'bank', status: 'final_dispatched', dayOffset: 9 },
      { senderIdx: 6, recIdx: 1, weight: 1.2, amount: 60.00, carrierCost: 34.00, pType: 'cash', status: 'final_dispatched', dayOffset: 8 },
      { senderIdx: 7, recIdx: 0, weight: 4.5, amount: 60.00, carrierCost: 35.00, pType: 'cash', status: 'final_dispatched', dayOffset: 8 },
      { senderIdx: 8, recIdx: 6, weight: 12.0, amount: 111.00, carrierCost: 65.00, pType: 'credit', status: 'final_dispatched', dayOffset: 7 },
      { senderIdx: 9, recIdx: 7, weight: 0.5, amount: 35.00, carrierCost: 20.00, pType: 'bank', status: 'final_dispatched', dayOffset: 7 },
      { senderIdx: 0, recIdx: 2, weight: 2.8, amount: 60.00, carrierCost: 35.00, pType: 'cash', status: 'final_dispatched', dayOffset: 6 },
      { senderIdx: 1, recIdx: 4, weight: 7.5, amount: 95.00, carrierCost: 55.00, pType: 'bank', status: 'final_dispatched', dayOffset: 6 },
      { senderIdx: 2, recIdx: 3, weight: 15.0, amount: 135.00, carrierCost: 78.00, pType: 'cash', status: 'final_dispatched', dayOffset: 5 },
      { senderIdx: 3, recIdx: 5, weight: 1.0, amount: 35.00, carrierCost: 20.00, pType: 'credit', status: 'final_dispatched', dayOffset: 5 },
      { senderIdx: 4, recIdx: 1, weight: 3.5, amount: 60.00, carrierCost: 36.00, pType: 'cash', status: 'final_dispatched', dayOffset: 4 },
      { senderIdx: 5, recIdx: 0, weight: 5.2, amount: 95.00, carrierCost: 56.00, pType: 'cash', status: 'final_dispatched', dayOffset: 4 },
      { senderIdx: 6, recIdx: 2, weight: 1.8, amount: 60.00, carrierCost: 35.00, pType: 'bank', status: 'final_dispatched', dayOffset: 3 },
      { senderIdx: 7, recIdx: 6, weight: 9.0, amount: 95.00, carrierCost: 57.00, pType: 'cash', status: 'final_dispatched', dayOffset: 3 },
      { senderIdx: 8, recIdx: 7, weight: 18.0, amount: 159.00, carrierCost: 92.00, pType: 'credit', status: 'final_dispatched', dayOffset: 2 },
      { senderIdx: 9, recIdx: 3, weight: 2.5, amount: 60.00, carrierCost: 35.00, pType: 'bank', status: 'final_dispatched', dayOffset: 2 },
      { senderIdx: 0, recIdx: 4, weight: 0.9, amount: 35.00, carrierCost: 20.00, pType: 'cash', status: 'final_dispatched', dayOffset: 1 },
      { senderIdx: 1, recIdx: 5, weight: 4.0, amount: 60.00, carrierCost: 35.00, pType: 'cash', status: 'final_dispatched', dayOffset: 1 },
      { senderIdx: 2, recIdx: 1, weight: 11.0, amount: 103.00, carrierCost: 60.00, pType: 'bank', status: 'final_dispatched', dayOffset: 0 },
      { senderIdx: 3, recIdx: 0, weight: 6.0, amount: 95.00, carrierCost: 56.00, pType: 'cash', status: 'final_dispatched', dayOffset: 0 },
      
      // Pending in warehouse (initial)
      { senderIdx: 4, recIdx: 2, weight: 2.2, amount: 60.00, carrierCost: 0, pType: 'cash', status: 'initial', dayOffset: 1 },
      { senderIdx: 5, recIdx: 3, weight: 5.5, amount: 95.00, carrierCost: 0, pType: 'bank', status: 'initial', dayOffset: 0 },
      { senderIdx: 6, recIdx: 4, weight: 1.1, amount: 60.00, carrierCost: 0, pType: 'credit', status: 'initial', dayOffset: 0 },
      { senderIdx: 7, recIdx: 5, weight: 3.8, amount: 60.00, carrierCost: 0, pType: 'cash', status: 'initial', dayOffset: 0 },

      // Cancelled orders
      { senderIdx: 8, recIdx: 0, weight: 1.0, amount: 35.00, carrierCost: 0, pType: 'cash', status: 'cancelled', dayOffset: 4 },
      { senderIdx: 9, recIdx: 1, weight: 4.0, amount: 60.00, carrierCost: 0, pType: 'bank', status: 'cancelled', dayOffset: 2 },
    ];

    let orderCountSeq = 1001;
    const now = new Date();

    for (const item of shipmentTemplates) {
      const sender = allCustomers[item.senderIdx % allCustomers.length]!;
      const receiver = receiversList[item.recIdx % receiversList.length]!;
      const zone = allZones[item.recIdx % allZones.length]!;
      const carrier = allCarriers[item.senderIdx % allCarriers.length]!;

      const orderNumber = `YE-2026-${orderCountSeq++}`;
      
      // Compute specific historical date
      const createdAt = new Date(now);
      createdAt.setDate(now.getDate() - item.dayOffset);
      createdAt.setHours(9 + (orderCountSeq % 8), 15 + (orderCountSeq % 40));

      // 1. Insert Initial Order
      const [order] = await db.insert(initialOrders).values({
        orderNumber,
        customerId: sender.id,
        senderName: sender.fullName,
        senderPhone: sender.phone,
        receiverName: receiver.name,
        receiverPhone: receiver.phone,
        receiverAddress: receiver.address,
        zoneId: zone.id,
        actualWeight: item.weight.toString(),
        volumetricWeight: (item.weight * 1.1).toFixed(3),
        chargeableWeight: item.weight.toString(),
        totalSalesAmount: item.amount.toFixed(2),
        paymentType: item.pType as any,
        status: 'initial',
        notes: `شحنة مجدولة عبر فرع ${zone.nameAr}`,
        createdAt,
      }).returning();

      // 2. Process Initial Order Accounting (Debits Cash/Bank/AR, Credits Sales)
      const initialEntry = await AccountingEngine.processInitialOrderAccounting({
        orderId: order!.id,
        orderNumber,
        customerId: sender.id,
        senderName: sender.fullName,
        paymentType: item.pType as any,
        amount: item.amount,
      });

      // Update journal entry date to match order creation date
      await db.update(journalEntries)
        .set({ entryDate: createdAt })
        .where(eq(journalEntries.id, initialEntry.journalEntryId));

      // 3. Handle Dispatched status
      if (item.status === 'final_dispatched') {
        const waybillNumber = `WAY-${carrier.carrierCode}-${Math.floor(Math.random() * 899999 + 100000)}`;
        const grossProfit = Math.round((item.amount - item.carrierCost) * 100) / 100;
        const dispatchedAt = new Date(createdAt);
        dispatchedAt.setHours(dispatchedAt.getHours() + 2);

        await db.insert(finalShipments).values({
          initialOrderId: order!.id,
          carrierId: carrier.id,
          supplierWaybillNumber: waybillNumber,
          carrierCost: item.carrierCost.toFixed(2),
          grossProfit: grossProfit.toFixed(2),
          dispatchedAt,
          notes: `تم الترحيل بنجاح للناقل ${carrier.name}`,
        });

        await db.update(initialOrders)
          .set({ status: 'final_dispatched' })
          .where(eq(initialOrders.id, order!.id));

        const dispatchEntry = await AccountingEngine.processFinalDispatchAccounting({
          initialOrderId: order!.id,
          orderNumber,
          carrierId: carrier.id,
          supplierWaybillNumber: waybillNumber,
          carrierCost: item.carrierCost,
        });

        await db.update(journalEntries)
          .set({ entryDate: dispatchedAt })
          .where(eq(journalEntries.id, dispatchEntry.journalEntryId));

      } else if (item.status === 'cancelled') {
        // Cancel order via reversal entry
        await AccountingEngine.reversalEntry({
          orderId: order!.id,
          orderNumber,
          originalJournalEntryId: initialEntry.journalEntryId,
        });

        await db.update(initialOrders)
          .set({ status: 'cancelled' })
          .where(eq(initialOrders.id, order!.id));
      }
    }

    // 6. Execute Some Settlement Vouchers (سندات قبض وصرف واقعية لإظهار حركة التسويات)
    const activeCustomer = allCustomers[3]!; // أصيل مروان الصنوي
    const activeCarrier = allCarriers[0]!; // الرويشان

    try {
      // سند قبض من أصيل الصنوي 120.00 ر.س (تحويل بنكي)
      await AccountingEngine.processCustomerReceiptVoucher({
        customerId: activeCustomer.id,
        amount: 120.00,
        paymentMethod: 'bank',
        notes: 'سداد دفعة نقدية عبر بنك القطيبي - فرع تعز',
      });

      // سند صرف لشركة الرويشان 180.00 ر.س (كاش)
      await AccountingEngine.processCarrierPaymentVoucher({
        carrierId: activeCarrier.id,
        amount: 180.00,
        paymentMethod: 'cash',
        notes: 'سداد مستحقات رحلات خط صنعاء - عدن نقداً من الصندوق',
      });
    } catch (vErr) {
      logger.warn({ vErr }, 'Settlement vouchers notice');
    }

    logger.info('Yemeni Mock Data Seeding completed successfully!');
    return {
      success: true,
      message: 'تم استزراع البيانات اليمنية الواقعية وتوليد القيود المحاسبية بنجاح',
      zonesCount: allZones.length,
      carriersCount: allCarriers.length,
      customersCount: allCustomers.length,
      ordersCount: shipmentTemplates.length,
    };
  }
}
