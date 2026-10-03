import { db } from '../../config/database.js';

/**
 * AccountingEngine: المحرك المالي المحاسبي للقيد المزدوج والرقابة المالية الصارمة
 */
export class AccountingEngine {
  /**
   * إنشاء قيد محاسبي مزدوج متوازن مع التحقق الصارم من توازن المدين والدائن
   * @param {Object} param0
   */
  static postBalancedJournalEntry({ referenceType, referenceId, description, lines }) {
    // 1. حساب إجمالي المدين والدائن والتحقق من التساوي
    const totalDebit = lines.reduce((acc, l) => acc + (Number(l.debit) || 0), 0);
    const totalCredit = lines.reduce((acc, l) => acc + (Number(l.credit) || 0), 0);

    const diff = Math.abs(Math.round((totalDebit - totalCredit) * 100) / 100);
    if (diff !== 0) {
      throw new Error(`خطأ محاسبي: القيد غير متوازن! إجمالي المدين (${totalDebit}) لا يساوي الدائن (${totalCredit})`);
    }

    if (totalDebit <= 0) {
      throw new Error('قيمة القيد المحاسبي يجب أن تكون أكبر من الصفر');
    }

    // 2. توليد رقم تسلسلي فريد للقيد
    const lastEntry = db.prepare('SELECT id, entry_number FROM journal_entries ORDER BY id DESC LIMIT 1').get();
    let nextSeq = 1;
    if (lastEntry && lastEntry.entry_number) {
      const parts = lastEntry.entry_number.split('-');
      const parsed = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(parsed)) {
        nextSeq = parsed + 1;
      }
    }
    const entryNumber = `JRN-2026-${String(nextSeq).padStart(5, '0')}`;

    // 3. إدراج رأس القيد
    const insertHeader = db.prepare(`
      INSERT INTO journal_entries (entry_number, reference_type, reference_id, total_debit, total_credit, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const headerRes = insertHeader.run(
      entryNumber,
      referenceType,
      String(referenceId),
      totalDebit,
      totalCredit,
      description
    );
    const journalEntryId = Number(headerRes.lastInsertRowid);

    // 4. إدراج أطراف القيد وتحديث أرصدة الحسابات
    const insertLine = db.prepare(`
      INSERT INTO journal_lines (journal_entry_id, account_code, debit_amount, credit_amount, memo)
      VALUES (?, ?, ?, ?, ?)
    `);

    const updateAccountBalance = db.prepare(`
      UPDATE chart_of_accounts
      SET current_balance = current_balance + ?
      WHERE account_code = ?
    `);

    for (const line of lines) {
      const debit = Number(line.debit) || 0;
      const credit = Number(line.credit) || 0;

      insertLine.run(journalEntryId, line.accountCode, debit, credit, line.memo || description);

      // التحقق الصارم من وجود الحساب في دليل الحسابات
      const account = db.prepare('SELECT account_type FROM chart_of_accounts WHERE account_code = ?').get(line.accountCode);
      if (!account) {
        throw new Error(`خطأ محاسبي حرج: الحساب المحاسبي رقم [${line.accountCode}] غير موجود في دليل الحسابات`);
      }

      // الطبيعة المحاسبية: الأصول والمصروفات طبيعتها مدينة (+)
      // الخصوم والإيرادات وحقوق الملكية طبيعتها دائنة (+)
      let netChange = 0;
      if (account.account_type === 'asset' || account.account_type === 'expense') {
        netChange = debit - credit;
      } else {
        netChange = credit - debit;
      }
      updateAccountBalance.run(netChange, line.accountCode);
    }

    return {
      journalEntryId,
      entryNumber,
      totalDebit,
      totalCredit
    };
  }

  /**
   * الأثر المالي 1: عند إنشاء وحفظ الطلب الأولي
   * يؤثر على الصندوق أو الصراف/البنك أو العميل + المبيعات
   */
  static processInitialOrderAccounting({ orderId, orderNumber, customerId, senderName, paymentType, amount }) {
    const amt = Number(amount);
    let debitAccount = '1010'; // الافتراضي: الصندوق الرئيسي
    let debitMemo = `سداد نقدي في الصندوق عن الطلب ${orderNumber}`;

    if (paymentType === 'bank') {
      debitAccount = '1020'; // حساب الصراف / البنك
      debitMemo = `حوالة / إيداع صراف عن الطلب ${orderNumber}`;
    } else if (paymentType === 'credit') {
      debitAccount = '1100'; // ذمم العملاء
      debitMemo = `قيد مديونية على العميل (${senderName}) عن الطلب ${orderNumber}`;
    }

    // إعداد أطراف القيد المزدوج
    const lines = [
      {
        accountCode: debitAccount,
        debit: amt,
        credit: 0,
        memo: debitMemo
      },
      {
        accountCode: '4100', // إيرادات مبيعات خدمات الشحن
        debit: 0,
        credit: amt,
        memo: `إيراد مبيعات شحنة طرد برقم ${orderNumber}`
      }
    ];

    const description = `إثبات مبيعات الطلب الأولي ${orderNumber} - العميل: ${senderName} (${paymentType === 'cash' ? 'نقداً بالصندوق' : paymentType === 'bank' ? 'صراف/بنك' : 'آجل على الحساب'})`;

    const journal = this.postBalancedJournalEntry({
      referenceType: 'initial_order',
      referenceId: orderNumber,
      description,
      lines
    });

    // تسجيل حركة الصندوق أو الصراف تفصيلياً
    if (paymentType === 'cash' || paymentType === 'bank') {
      const currentVault = db.prepare('SELECT current_balance FROM chart_of_accounts WHERE account_code = ?').get(debitAccount);
      db.prepare(`
        INSERT INTO cash_movements (account_code, order_id, movement_type, amount, balance_after, notes)
        VALUES (?, ?, 'inflow', ?, ?, ?)
      `).run(
        debitAccount,
        orderId,
        amt,
        Number(currentVault.current_balance),
        `قبض مبيعات شحنة رقم ${orderNumber}`
      );
    }

    // إذا كان آجل وتم تحديد العميل، تحديث كشف حساب العميل
    if (paymentType === 'credit' && customerId) {
      db.prepare(`
        UPDATE customers
        SET current_balance = current_balance + ?
        WHERE id = ?
      `).run(amt, customerId);
    }

    return journal;
  }

  /**
   * الأثر المالي 2: عند ترحيل الشحنة إلى طلب نهائي وإدخال بوليصة المورد
   * يؤثر على تكلفة المبيعات (مدين) + حساب المورد/الناقل (دائن)
   */
  static processFinalDispatchAccounting({ initialOrderId, orderNumber, carrierId, supplierWaybillNumber, carrierCost }) {
    const cost = Number(carrierCost);
    const carrier = db.prepare('SELECT id, carrier_code, name, current_balance FROM carrier_suppliers WHERE id = ?').get(carrierId);
    if (!carrier) {
      throw new Error('المورد / الناقل المحدد غير موجود');
    }

    const lines = [
      {
        accountCode: '5100', // تكلفة خدمات الشحن (مصروف / COGS)
        debit: cost,
        credit: 0,
        memo: `تكلفة شحن الطلب ${orderNumber} المسلم إلى ${carrier.name} ببوليصة ${supplierWaybillNumber}`
      },
      {
        accountCode: '2100', // ذمم الموردين وشركات الشحن (دائن)
        debit: 0,
        credit: cost,
        memo: `استحقاق مالي للناقل ${carrier.name} عن بوليصة رقم [${supplierWaybillNumber}]`
      }
    ];

    const description = `ترحيل نهائي للطلب ${orderNumber} وتسليمه للمورد ${carrier.name} برقم بوليصة [${supplierWaybillNumber}]`;

    const journal = this.postBalancedJournalEntry({
      referenceType: 'final_shipment',
      referenceId: supplierWaybillNumber,
      description,
      lines
    });

    // زيادة رصيد استحقاق المورد في حسابه الخاص
    db.prepare(`
      UPDATE carrier_suppliers
      SET current_balance = current_balance + ?
      WHERE id = ?
    `).run(cost, carrierId);

    return journal;
  }
}
