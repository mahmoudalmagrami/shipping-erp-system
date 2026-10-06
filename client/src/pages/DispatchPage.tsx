import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getPendingDispatch, getCarriers, dispatchOrder, createCarrier } from '../api/endpoints';
import { Order } from '../types';
import { Plus, X, Building2, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export const DispatchPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: pendingOrders } = useQuery({ queryKey: ['pendingOrders'], queryFn: getPendingDispatch });
  const { data: carriers } = useQuery({ queryKey: ['carriers'], queryFn: getCarriers });

  const [form, setForm] = useState({
    carrierId: '',
    supplierWaybillNumber: '',
    carrierCost: '',
    notes: ''
  });

  // New Carrier Modal state
  const [newCarrierModalOpen, setNewCarrierModalOpen] = useState(false);
  const [carrierForm, setCarrierForm] = useState({
    name: '',
    nameEn: '',
    phone: '',
    carrierCode: ''
  });
  const [creatingCarrier, setCreatingCarrier] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setLoading(true);
    try {
      const res = await dispatchOrder({
        initialOrderId: selectedOrder.id,
        carrierId: form.carrierId,
        supplierWaybillNumber: form.supplierWaybillNumber,
        carrierCost: Number(form.carrierCost),
        notes: form.notes
      });
      if (res.success) {
        toast.success(t('dispatch.success') || 'تم الترحيل بنجاح');
        setSelectedOrder(null);
        setForm({ carrierId: '', supplierWaybillNumber: '', carrierCost: '', notes: '' });
        queryClient.invalidateQueries({ queryKey: ['pendingOrders'] });
        queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
      } else {
        toast.error(res.message || t('common.error'));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCarrier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carrierForm.name) {
      toast.error('اسم الناقل إلزامي');
      return;
    }
    setCreatingCarrier(true);
    try {
      const res = await createCarrier(carrierForm);
      if (res.success && res.data) {
        toast.success('تم إضافة شركة الشحن بنجاح');
        setNewCarrierModalOpen(false);
        setForm(prev => ({ ...prev, carrierId: String(res.data?.id || '') }));
        setCarrierForm({ name: '', nameEn: '', phone: '', carrierCode: '' });
        queryClient.invalidateQueries({ queryKey: ['carriers'] });
      } else {
        toast.error(res.message || 'فشل إضافة الناقل');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل إضافة الناقل');
    } finally {
      setCreatingCarrier(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('dispatch.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">ترحيل الطرود الجاهزة بالمستودع إلى شركات الشحن والناقل النهائي</p>
        </div>
        <button
          onClick={() => setNewCarrierModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-lg text-sm font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 text-blue-600" />
          <span>إضافة شركة شحن جديدة</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Pending Orders Table */}
        <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-800">{t('dispatch.pending')}</h2>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full">
              {pendingOrders?.data?.length || 0} شحنة بانتظار الترحيل
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3">{t('orders.colOrder')}</th>
                  <th className="px-4 py-3">{t('orders.colReceiver')}</th>
                  <th className="px-4 py-3">{t('orders.colZone')}</th>
                  <th className="px-4 py-3">المبيعات</th>
                  <th className="px-4 py-3 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {pendingOrders?.data?.map(order => (
                  <tr key={order.id} className={`border-b hover:bg-slate-50 transition-colors ${selectedOrder?.id === order.id ? 'bg-blue-50/70 border-blue-200' : ''}`}>
                    <td className="px-4 py-3 font-bold font-mono text-blue-600">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-slate-900 font-medium">{order.receiverName}</td>
                    <td className="px-4 py-3 text-slate-600">{order.zoneName || order.zoneId}</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{order.amount} ر.س</td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                          selectedOrder?.id === order.id
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`}
                      >
                        {selectedOrder?.id === order.id ? 'محدد حالياً' : 'اختيار للترحيل'}
                      </button>
                    </td>
                  </tr>
                ))}
                {!pendingOrders?.data?.length && (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">لا توجد طلبات معلقة بالمستودع</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dispatch Form Panel */}
        <div className="w-full lg:w-1/3">
          {selectedOrder ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6 space-y-4">
              <div className="flex items-center gap-2 border-b pb-3">
                <Send className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  ترحيل: {selectedOrder.orderNumber}
                </h3>
              </div>
              
              <div className="p-3.5 bg-slate-50 rounded-lg text-xs space-y-2 border">
                <div className="flex justify-between">
                  <span className="text-slate-500">سعر البيع المقبوض:</span>
                  <span className="font-bold font-mono text-sm text-slate-900">{selectedOrder.amount} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">الوزن الفعلي:</span>
                  <span className="font-bold font-mono">{selectedOrder.actualWeight} كجم</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">الوجهة:</span>
                  <span className="font-bold">{selectedOrder.zoneName || `منطقة ${selectedOrder.zoneId}`}</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-700">{t('dispatch.carrier')}</label>
                    <button
                      type="button"
                      onClick={() => setNewCarrierModalOpen(true)}
                      className="text-[11px] text-blue-600 hover:underline font-semibold"
                    >
                      + شركة جديدة
                    </button>
                  </div>
                  <select required className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border bg-white text-sm focus:ring-2 focus:ring-blue-500"
                    value={form.carrierId} onChange={e => setForm({...form, carrierId: e.target.value})}>
                    <option value="">{t('common.select')}</option>
                    {carriers?.data?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t('dispatch.waybill')}</label>
                  <input required type="text" placeholder="مثال: DHL-123456789" className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-sm font-mono focus:ring-2 focus:ring-blue-500"
                    value={form.supplierWaybillNumber} onChange={e => setForm({...form, supplierWaybillNumber: e.target.value})} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t('dispatch.cost')} (ر.س)</label>
                  <input required type="number" step="0.01" min="0.01" placeholder="0.00" className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-sm font-mono focus:ring-2 focus:ring-blue-500"
                    value={form.carrierCost} onChange={e => setForm({...form, carrierCost: e.target.value})} />
                </div>
                
                {form.carrierCost && Number(form.carrierCost) > 0 && (
                  <div className="p-3 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-200 text-xs flex justify-between items-center">
                    <span>هامش الربح المحقق:</span>
                    <span className="font-bold font-mono text-sm text-emerald-700">
                      +{(Number(selectedOrder.amount) - Number(form.carrierCost)).toFixed(2)} ر.س
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t('dispatch.notes')}</label>
                  <textarea className="w-full rounded-lg border-gray-300 shadow-sm p-2 border text-sm focus:ring-2 focus:ring-blue-500" rows={2}
                    value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors">
                    {loading ? t('common.loading') : t('dispatch.submit')}
                  </button>
                  <button type="button" onClick={() => setSelectedOrder(null)} className="px-4 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-500">
              <Send className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-medium text-sm">حدد شحنة من الجدول للبدء بالترحيل</p>
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL: ADD NEW CARRIER ================= */}
      {newCarrierModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-100">
            <div className="px-6 py-4 bg-slate-50 border-b flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>إضافة شركة شحن / ناقل معتمد</span>
              </div>
              <button onClick={() => setNewCarrierModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCarrier} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">اسم شركة الشحن (بالعربي)</label>
                <input
                  required
                  type="text"
                  placeholder="مثال: شركة أجنحة النقل السريع"
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                  value={carrierForm.name}
                  onChange={e => setCarrierForm({ ...carrierForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">الاسم بالإنجليزية (اختياري)</label>
                <input
                  type="text"
                  placeholder="e.g. Express Wings Logistics"
                  className="w-full border rounded-lg p-2.5 text-sm font-sans focus:ring-2 focus:ring-blue-500"
                  value={carrierForm.nameEn}
                  onChange={e => setCarrierForm({ ...carrierForm, nameEn: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">رقم الهاتف / التواصل</label>
                <input
                  type="text"
                  placeholder="+966 ..."
                  className="w-full border rounded-lg p-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500"
                  value={carrierForm.phone}
                  onChange={e => setCarrierForm({ ...carrierForm, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">رمز الناقل (اختياري)</label>
                <input
                  type="text"
                  placeholder="CAR-WINGS"
                  className="w-full border rounded-lg p-2.5 text-sm font-mono uppercase focus:ring-2 focus:ring-blue-500"
                  value={carrierForm.carrierCode}
                  onChange={e => setCarrierForm({ ...carrierForm, carrierCode: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setNewCarrierModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={creatingCarrier}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                >
                  {creatingCarrier ? 'جاري الحفظ...' : 'حفظ الناقل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
