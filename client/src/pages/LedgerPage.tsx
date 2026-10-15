import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  getFinancialSummary, 
  getCustomers, 
  getCarriers, 
  createReceiptVoucher, 
  createPaymentVoucher 
} from '../api/endpoints';
import { PlusCircle, MinusCircle, Download, X, Wallet, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const LedgerPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: summary } = useQuery({ 
    queryKey: ['financialSummary'], 
    queryFn: getFinancialSummary 
  });
  const { data: customers } = useQuery({ 
    queryKey: ['customers'], 
    queryFn: getCustomers 
  });
  const { data: carriers } = useQuery({ 
    queryKey: ['carriers'], 
    queryFn: getCarriers 
  });

  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  // Forms
  const [receiptForm, setReceiptForm] = useState({
    customerId: '',
    amount: '',
    paymentMethod: 'cash',
    notes: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    carrierId: '',
    amount: '',
    paymentMethod: 'cash',
    notes: ''
  });

  const accountMap = React.useMemo(() => {
    const map = new Map<string, string>();
    if (summary?.data?.accounts) {
      summary.data.accounts.forEach((a: any) => {
        map.set(a.accountCode, a.accountNameAr || a.accountNameEn || a.accountCode);
      });
    }
    return map;
  }, [summary]);

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'asset': return 'أصول (Assets)';
      case 'liability': return 'خصوم / التزامات (Liabilities)';
      case 'revenue': return 'إيرادات (Revenue)';
      case 'expense': return 'مصروفات وتكلفة (Expenses)';
      default: return type;
    }
  };

  // Submit Receipt Voucher (سند قبض من عميل)
  const handleReceiptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptForm.customerId || !receiptForm.amount) {
      toast.error('يرجى اختيار العميل وتحديد المبلغ');
      return;
    }
    setLoadingAction(true);
    try {
      const res = await createReceiptVoucher({
        customerId: Number(receiptForm.customerId),
        amount: Number(receiptForm.amount),
        paymentMethod: receiptForm.paymentMethod,
        notes: receiptForm.notes
      });
      if (res.success) {
        toast.success(res.message || 'تم تسجيل سند القبض بنجاح');
        setReceiptModalOpen(false);
        setReceiptForm({ customerId: '', amount: '', paymentMethod: 'cash', notes: '' });
        queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
        queryClient.invalidateQueries({ queryKey: ['customers'] });
      } else {
        toast.error(res.message || 'حدث خطأ أثناء حفظ سند القبض');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل في حفظ سند القبض');
    } finally {
      setLoadingAction(false);
    }
  };

  // Submit Payment Voucher (سند صرف لناقل)
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.carrierId || !paymentForm.amount) {
      toast.error('يرجى اختيار الناقل وتحديد المبلغ');
      return;
    }
    setLoadingAction(true);
    try {
      const res = await createPaymentVoucher({
        carrierId: Number(paymentForm.carrierId),
        amount: Number(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        notes: paymentForm.notes
      });
      if (res.success) {
        toast.success(res.message || 'تم تسجيل سند الصرف بنجاح');
        setPaymentModalOpen(false);
        setPaymentForm({ carrierId: '', amount: '', paymentMethod: 'cash', notes: '' });
        queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
        queryClient.invalidateQueries({ queryKey: ['carriers'] });
      } else {
        toast.error(res.message || 'حدث خطأ أثناء حفظ سند الصرف');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل في حفظ سند الصرف');
    } finally {
      setLoadingAction(false);
    }
  };

  // Export Ledger Journals to CSV
  const handleExportJournalsCSV = () => {
    const journals = summary?.data?.recentJournals || [];
    if (!journals.length) {
      toast.error('لا توجد قيود لتصديرها');
      return;
    }
    const headers = ['رقم القيد', 'التاريخ', 'البيان', 'رمز الحساب', 'اسم الحساب', 'مدين (+)', 'دائن (-)'];
    const rows: any[] = [];
    journals.forEach((j: any) => {
      j.lines?.forEach((l: any) => {
        rows.push([
          j.entryNumber,
          j.entryDate ? new Date(j.entryDate).toLocaleDateString('ar-SA') : '',
          j.description,
          l.accountCode,
          accountMap.get(l.accountCode) || l.memo || l.accountCode,
          Number(l.debitAmount || 0).toFixed(2),
          Number(l.creditAmount || 0).toFixed(2)
        ]);
      });
    });

    const sanitizeCSVField = (val: unknown): string => {
      let str = String(val ?? '');
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    const csvContent = '\uFEFF' + [
      headers.map(sanitizeCSVField).join(','),
      ...rows.map((r: any[]) => r.map(sanitizeCSVField).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `general_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('تم تصدير دفتر الأستاذ بنجاح');
  };

  const selectedCustomer = customers?.data?.find((c: any) => String(c.id) === String(receiptForm.customerId));
  const selectedCarrier = carriers?.data?.find((c: any) => String(c.id) === String(paymentForm.carrierId));

  return (
    <div className="space-y-8">
      {/* Header with Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('ledger.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">سجل القيود المحاسبية الآلية، سندات القبض والصرف، وشجرة الحسابات</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setReceiptModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>سند قبض من عميل</span>
          </button>
          <button
            onClick={() => setPaymentModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
          >
            <MinusCircle className="w-4 h-4" />
            <span>سند صرف لناقل</span>
          </button>
          <button
            onClick={handleExportJournalsCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>تصدير القيود (CSV)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ================= CHART OF ACCOUNTS ================= */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b font-semibold bg-gray-50 flex justify-between items-center">
            <span>{t('ledger.accounts')}</span>
            <span className="text-xs text-gray-500">دليل الحسابات المالي</span>
          </div>
          <table className="w-full text-sm text-left rtl:text-right">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th className="px-4 py-3">رمز الحساب</th>
                <th className="px-4 py-3">اسم الحساب</th>
                <th className="px-4 py-3">النوع</th>
                <th className="px-4 py-3 text-right">الرصيد اللحظي</th>
              </tr>
            </thead>
            <tbody>
              {summary?.data?.accounts?.map((acc: any) => (
                <tr key={acc.accountCode} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono font-bold text-blue-600">{acc.accountCode}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{acc.accountNameAr || acc.accountNameEn}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{getAccountTypeLabel(acc.accountType)}</td>
                  <td className={`px-4 py-3 text-right font-bold font-mono ${Number(acc.currentBalance) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {Number(acc.currentBalance || 0).toFixed(2)} ر.س
                  </td>
                </tr>
              ))}
              {!summary?.data?.accounts?.length && (
                <tr><td colSpan={4} className="px-6 py-6 text-center text-gray-400">لا توجد حسابات مسجلة</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ================= RECENT JOURNALS ================= */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b font-semibold bg-gray-50 flex justify-between items-center">
            <span>{t('ledger.recentJournals')}</span>
            <span className="text-xs text-gray-500">حركات اليومية العامة</span>
          </div>
          <div className="p-4 space-y-4 max-h-[700px] overflow-y-auto">
            {summary?.data?.recentJournals?.map((j: any) => (
              <div key={j.id} className="border rounded-lg p-4 bg-gray-50 hover:border-blue-200 transition-colors">
                <div className="flex flex-wrap justify-between items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                  <span className="font-semibold text-sm text-gray-800">{j.description}</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-xs font-semibold">{j.entryNumber}</span>
                    <span className="text-xs text-gray-500 font-mono">
                      {j.entryDate ? new Date(j.entryDate).toLocaleDateString('ar-SA') : '-'}
                    </span>
                  </div>
                </div>
                <div className="text-xs bg-white rounded border overflow-hidden">
                  {j.lines?.map((l: any) => (
                    <div key={l.id} className="flex justify-between items-center p-2.5 border-b last:border-0 hover:bg-slate-50">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-xs">{l.accountCode}</span>
                        <span className="text-gray-700 font-medium">{accountMap.get(l.accountCode) || l.memo || l.accountCode}</span>
                      </div>
                      <div className="flex gap-4 font-mono font-semibold">
                        {Number(l.debitAmount) > 0 ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            مدين: +{Number(l.debitAmount).toFixed(2)}
                          </span>
                        ) : null}
                        {Number(l.creditAmount) > 0 ? (
                          <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                            دائن: -{Number(l.creditAmount).toFixed(2)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {!summary?.data?.recentJournals?.length && (
              <div className="text-center py-8 text-gray-400">لا توجد قيود مسجلة بعد</div>
            )}
          </div>
        </div>
      </div>

      {/* ================= MODAL: RECEIPT VOUCHER (سند قبض) ================= */}
      {receiptModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-100">
            <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex justify-between items-center">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <Wallet className="w-5 h-5 text-emerald-600" />
                <span>سند قبض من عميل (تحصيل ذمة مدينة)</span>
              </div>
              <button onClick={() => setReceiptModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReceiptSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">اختر العميل</label>
                <select
                  required
                  className="w-full border rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                  value={receiptForm.customerId}
                  onChange={e => setReceiptForm({ ...receiptForm, customerId: e.target.value })}
                >
                  <option value="">-- اختر العميل --</option>
                  {customers?.data?.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} (الرصيد المستحق: {Number(c.currentBalance || 0).toFixed(2)} ر.س)
                    </option>
                  ))}
                </select>
              </div>

              {selectedCustomer && (
                <div className="p-3 bg-slate-50 border rounded-lg text-xs flex justify-between">
                  <span className="text-slate-600">الرصيد المطلوب سداده:</span>
                  <span className="font-bold font-mono text-emerald-700">
                    {Number(selectedCustomer.currentBalance || 0).toFixed(2)} ر.س
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">المبلغ المقبوض (ر.س)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className="w-full border rounded-lg p-2.5 text-sm font-mono focus:ring-2 focus:ring-emerald-500"
                  value={receiptForm.amount}
                  onChange={e => setReceiptForm({ ...receiptForm, amount: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">طريقة الإيداع</label>
                <div className="flex gap-4">
                  <label className="flex items-center text-sm gap-2">
                    <input
                      type="radio"
                      value="cash"
                      checked={receiptForm.paymentMethod === 'cash'}
                      onChange={e => setReceiptForm({ ...receiptForm, paymentMethod: e.target.value })}
                    />
                    <span>الصندوق الرئيسي (1010)</span>
                  </label>
                  <label className="flex items-center text-sm gap-2">
                    <input
                      type="radio"
                      value="bank"
                      checked={receiptForm.paymentMethod === 'bank'}
                      onChange={e => setReceiptForm({ ...receiptForm, paymentMethod: e.target.value })}
                    />
                    <span>حساب الصراف / البنك (1020)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ملاحظات السند</label>
                <textarea
                  className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500"
                  rows={2}
                  placeholder="رقم الحوالة، اسم المودع، تفاصيل الدفعة..."
                  value={receiptForm.notes}
                  onChange={e => setReceiptForm({ ...receiptForm, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setReceiptModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                >
                  {loadingAction ? 'جاري الحفظ...' : 'تأكيد وترحيل سند القبض'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: PAYMENT VOUCHER (سند صرف) ================= */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-100">
            <div className="px-6 py-4 bg-rose-50 border-b border-rose-100 flex justify-between items-center">
              <div className="flex items-center gap-2 text-rose-900 font-bold">
                <Building2 className="w-5 h-5 text-rose-600" />
                <span>سند صرف لناقل (سداد ذمة دائنة)</span>
              </div>
              <button onClick={() => setPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">اختر شركة الشحن / الناقل</label>
                <select
                  required
                  className="w-full border rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-rose-500"
                  value={paymentForm.carrierId}
                  onChange={e => setPaymentForm({ ...paymentForm, carrierId: e.target.value })}
                >
                  <option value="">-- اختر الناقل --</option>
                  {carriers?.data?.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (المستحق له: {Number(c.currentBalance || 0).toFixed(2)} ر.س)
                    </option>
                  ))}
                </select>
              </div>

              {selectedCarrier && (
                <div className="p-3 bg-slate-50 border rounded-lg text-xs flex justify-between">
                  <span className="text-slate-600">إجمالي مستحقات الناقل الحالية:</span>
                  <span className="font-bold font-mono text-rose-700">
                    {Number(selectedCarrier.currentBalance || 0).toFixed(2)} ر.س
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">المبلغ المصروف (ر.س)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className="w-full border rounded-lg p-2.5 text-sm font-mono focus:ring-2 focus:ring-rose-500"
                  value={paymentForm.amount}
                  onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">طريقة السداد</label>
                <div className="flex gap-4">
                  <label className="flex items-center text-sm gap-2">
                    <input
                      type="radio"
                      value="cash"
                      checked={paymentForm.paymentMethod === 'cash'}
                      onChange={e => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    />
                    <span>الصندوق الرئيسي (1010)</span>
                  </label>
                  <label className="flex items-center text-sm gap-2">
                    <input
                      type="radio"
                      value="bank"
                      checked={paymentForm.paymentMethod === 'bank'}
                      onChange={e => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    />
                    <span>حساب الصراف / البنك (1020)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ملاحظات السند</label>
                <textarea
                  className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-rose-500"
                  rows={2}
                  placeholder="رقم شيك، تسوية فاتورة رقم..."
                  value={paymentForm.notes}
                  onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                >
                  {loadingAction ? 'جاري الحفظ...' : 'تأكيد وترحيل سند الصرف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
