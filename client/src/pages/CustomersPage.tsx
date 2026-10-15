import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  getCustomers, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer, 
  getCustomerStatement 
} from '../api/endpoints';
import { Customer } from '../types';
import { Modal } from '../components/Modal';
import { useDebounce } from '../hooks/useDebounce';
import { 
  Users, 
  UserPlus, 
  Search, 
  FileText, 
  Edit3, 
  Trash2, 
  Printer, 
  Phone, 
  MapPin, 
  AlertCircle,
  RefreshCw 
} from 'lucide-react';
import toast from 'react-hot-toast';

export const CustomersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const debouncedSearch = useDebounce(search, 350);

  // Queries
  const { data: customersResponse, isLoading, isError, refetch } = useQuery({
    queryKey: ['customers', debouncedSearch, page],
    queryFn: () => getCustomers({ search: debouncedSearch || undefined, page, pageSize }),
  });

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [statementCustomerId, setStatementCustomerId] = useState<number | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  // Statement query
  const { data: statementData, isLoading: isStatementLoading } = useQuery({
    queryKey: ['customerStatement', statementCustomerId],
    queryFn: () => getCustomerStatement(statementCustomerId!),
    enabled: !!statementCustomerId,
  });

  // Form states
  const [formData, setFormData] = useState({ fullName: '', phone: '', address: '' });
  const [submitting, setSubmitting] = useState(false);

  const openAdd = () => {
    setFormData({ fullName: '', phone: '', address: '' });
    setIsAddOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({ fullName: c.fullName, phone: c.phone || '', address: c.address || '' });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await createCustomer(formData);
      if (res.success) {
        toast.success('تمت إضافة العميل بنجاح');
        setIsAddOpen(false);
        refetch();
      } else {
        toast.error(res.message || 'حدث خطأ أثناء الإضافة');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'خطأ في حفظ بيانات العميل');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    setSubmitting(true);
    try {
      const res = await updateCustomer(editingCustomer.id, formData);
      if (res.success) {
        toast.success('تم تحديث بيانات العميل بنجاح');
        setEditingCustomer(null);
        refetch();
      } else {
        toast.error(res.message || 'حدث خطأ أثناء التعديل');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'خطأ في تحديث بيانات العميل');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCustomer) return;
    setSubmitting(true);
    try {
      const res = await deleteCustomer(deletingCustomer.id);
      if (res.success) {
        toast.success('تم حذف العميل بنجاح');
        setDeletingCustomer(null);
        refetch();
      } else {
        toast.error(res.message || 'تعذر حذف العميل');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'لا يمكن حذف عميل لديه حركات مالية مسجلة');
    } finally {
      setSubmitting(false);
    }
  };

  const customersList = customersResponse?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">إدارة العملاء والذمم المدينة</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">سجل العملاء، متابعة الأرصدة المستحقة (حـ/ 1100)، واستخراج كشوف الحساب</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="بحث باسم العميل، الهاتف، الرمز..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rtl:pr-9 rtl:pl-4 ltr:pl-9 ltr:pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute rtl:right-3 ltr:left-3 top-2.5" />
          </div>

          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm shadow-blue-500/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>عميل جديد</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold">
              <tr>
                <th className="px-5 py-3.5">رمز العميل</th>
                <th className="px-5 py-3.5">الاسم الكامل</th>
                <th className="px-5 py-3.5">رقم الجوال</th>
                <th className="px-5 py-3.5">العنوان</th>
                <th className="px-5 py-3.5">الرصيد المالي الحالي</th>
                <th className="px-5 py-3.5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    جاري تحميل بيانات العملاء...
                  </td>
                </tr>
              ) : customersList.length > 0 ? (
                customersList.map((c: Customer) => {
                  const balance = Number(c.currentBalance || 0);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-600">
                        {c.customerCode || `CUST_${c.id}`}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">{c.fullName}</td>
                      <td className="px-5 py-3.5 font-mono text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.phone}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {c.address ? (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{c.address}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-mono font-bold">
                        <span className={balance > 0 ? 'text-amber-600' : balance < 0 ? 'text-emerald-600' : 'text-slate-500'}>
                          {balance.toFixed(2)} ر.س
                        </span>
                        {balance > 0 && <span className="text-[10px] text-amber-500 mr-1">(مدين)</span>}
                        {balance < 0 && <span className="text-[10px] text-emerald-500 mr-1">(دائن)</span>}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setStatementCustomerId(Number(c.id))}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="كشف الحساب"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEdit(c)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                            title="تعديل البيانات"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingCustomer(c)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="حذف العميل"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    لا يوجد عملاء مطابقون للبحث
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {customersResponse && (customersResponse.totalPages ?? 1) > 1 && (
          <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <span className="text-xs text-slate-500">
              الصفحة {customersResponse.page || page} من {customersResponse.totalPages} (إجمالي {customersResponse.total} عميل)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                السابق
              </button>
              <span className="text-xs font-bold text-slate-700 px-2">{page}</span>
              <button
                disabled={page >= (customersResponse.totalPages || 1)}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {isError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <span>تعذر تحميل قائمة العملاء.</span>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>إعادة المحاولة</span>
          </button>
        </div>
      )}

      {/* Modal: Add Customer */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="إضافة عميل جديد" icon={<UserPlus className="w-5 h-5 text-blue-600" />}>
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">الاسم الكامل *</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="مثال: شركة الأفق للتجارة"
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">رقم الهاتف / الجوال *</label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="مثال: 0501234567"
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">العنوان / المدينة</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="الرياض، حي السلي، مخرج 16"
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'جاري الحفظ...' : 'حفظ العميل'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Customer */}
      <Modal isOpen={!!editingCustomer} onClose={() => setEditingCustomer(null)} title="تعديل بيانات العميل" icon={<Edit3 className="w-5 h-5 text-blue-600" />}>
        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">الاسم الكامل *</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">رقم الهاتف / الجوال *</label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">العنوان / المدينة</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingCustomer(null)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'جاري الحفظ...' : 'تحديث البيانات'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Delete Confirmation */}
      <Modal isOpen={!!deletingCustomer} onClose={() => setDeletingCustomer(null)} title="تأكيد حذف العميل" maxWidth="sm">
        <div className="space-y-4 text-xs text-center">
          <p className="text-slate-600">
            هل أنت متأكد من حذف العميل <strong className="text-slate-900">{deletingCustomer?.fullName}</strong>؟
          </p>
          <p className="text-[11px] text-slate-400">
            ملاحظة: لا يمكن حذف عميل مرتبط بسجلات شحن أو سندات مالية مسبقة.
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeletingCustomer(null)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting}
              className="px-5 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 disabled:opacity-50"
            >
              {submitting ? 'جاري الحذف...' : 'نعم، حذف'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Statement of Account (كشف حساب العميل) */}
      <Modal 
        isOpen={!!statementCustomerId} 
        onClose={() => setStatementCustomerId(null)} 
        title="كشف حساب العميل (Statement of Account)" 
        icon={<FileText className="w-5 h-5 text-blue-600" />}
        maxWidth="2xl"
      >
        {isStatementLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs">جاري جلب كشف الحساب والعمليات...</div>
        ) : statementData?.data ? (
          <div className="space-y-5 text-xs">
            {/* Header info */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-base text-slate-900">{statementData.data.customer?.fullName}</h4>
                <p className="text-slate-500 font-mono mt-0.5">{statementData.data.customer?.customerCode} | {statementData.data.customer?.phone}</p>
              </div>
              <div className="text-left">
                <span className="text-slate-500 block text-[11px]">الرصيد المستحق الحالي</span>
                <span className="text-lg font-bold font-mono text-amber-700">
                  {Number(statementData.data.currentBalance || 0).toFixed(2)} ر.س
                </span>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100">
                <span className="text-[11px] text-amber-800 block">إجمالي الشحنات الآجلة (مدين)</span>
                <span className="font-bold font-mono text-sm text-amber-900">
                  {Number(statementData.data.totalDebits || 0).toFixed(2)} ر.س
                </span>
              </div>
              <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                <span className="text-[11px] text-emerald-800 block">إجمالي سندات القبض المسددة (دائن)</span>
                <span className="font-bold font-mono text-sm text-emerald-900">
                  {Number(statementData.data.totalCredits || 0).toFixed(2)} ر.س
                </span>
              </div>
            </div>

            {/* Ledger items */}
            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-100">
                  <tr>
                    <th className="p-2.5">التاريخ</th>
                    <th className="p-2.5">المرجع</th>
                    <th className="p-2.5">البيان</th>
                    <th className="p-2.5">مدين (+)</th>
                    <th className="p-2.5">دائن (-)</th>
                    <th className="p-2.5">الرصيد التراكمي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {statementData.data.items?.length > 0 ? (
                    statementData.data.items.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2.5 text-slate-500 text-[11px]">
                          {item.date ? new Date(item.date).toLocaleDateString('ar-SA') : '-'}
                        </td>
                        <td className="p-2.5 font-bold text-slate-700">{item.reference}</td>
                        <td className="p-2.5 font-sans text-slate-800">{item.description}</td>
                        <td className="p-2.5 text-amber-700 font-bold">
                          {item.debit > 0 ? item.debit.toFixed(2) : '-'}
                        </td>
                        <td className="p-2.5 text-emerald-700 font-bold">
                          {item.credit > 0 ? item.credit.toFixed(2) : '-'}
                        </td>
                        <td className="p-2.5 font-bold text-slate-900">
                          {item.balance.toFixed(2)} ر.س
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400">
                        لا توجد حركات مالية مسجلة لهذا العميل
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة كشف الحساب</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">تعذر جلب بيانات كشف الحساب</div>
        )}
      </Modal>
    </div>
  );
};
