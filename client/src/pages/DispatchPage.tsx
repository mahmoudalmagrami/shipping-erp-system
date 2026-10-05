import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getPendingDispatch, getCarriers, dispatchOrder } from '../api/endpoints';
import { Order } from '../types';
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
        toast.success(t('dispatch.success'));
        setSelectedOrder(null);
        setForm({ carrierId: '', supplierWaybillNumber: '', carrierCost: '', notes: '' });
        queryClient.invalidateQueries({ queryKey: ['pendingOrders'] });
      } else {
        toast.error(res.message || t('common.error'));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold">{t('dispatch.pending')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">{t('orders.colOrder')}</th>
                <th className="px-4 py-3">{t('orders.colReceiver')}</th>
                <th className="px-4 py-3">{t('orders.colZone')}</th>
                <th className="px-4 py-3">{t('orders.colAmount')}</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {pendingOrders?.data?.map(order => (
                <tr key={order.id} className={`border-b hover:bg-gray-50 ${selectedOrder?.id === order.id ? 'bg-blue-50' : ''}`}>
                  <td className="px-4 py-3">{order.orderNumber}</td>
                  <td className="px-4 py-3">{order.receiverName}</td>
                  <td className="px-4 py-3">{order.zoneId}</td>
                  <td className="px-4 py-3">{order.amount}</td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded bg-blue-100"
                    >
                      {t('dispatch.select')}
                    </button>
                  </td>
                </tr>
              ))}
              {!pendingOrders?.data?.length && (
                <tr><td colSpan={5} className="px-4 py-8 text-center">{t('common.loading')} / لا يوجد</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="w-full lg:w-1/3">
        {selectedOrder ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
            <h2 className="text-lg font-semibold mb-4">{t('dispatch.title')} - {selectedOrder.orderNumber}</h2>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm space-y-1">
              <p><span className="font-medium">{t('orders.colAmount')}:</span> {selectedOrder.amount}</p>
              <p><span className="font-medium">{t('booking.weight')}:</span> {selectedOrder.actualWeight}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('dispatch.carrier')}</label>
                <select required className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={form.carrierId} onChange={e => setForm({...form, carrierId: e.target.value})}>
                  <option value="">{t('common.select')}</option>
                  {carriers?.data?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('dispatch.waybill')}</label>
                <input required type="text" className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={form.supplierWaybillNumber} onChange={e => setForm({...form, supplierWaybillNumber: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('dispatch.cost')}</label>
                <input required type="number" step="0.01" className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={form.carrierCost} onChange={e => setForm({...form, carrierCost: e.target.value})} />
              </div>
              
              {form.carrierCost && (
                <div className="p-3 bg-blue-50 text-blue-800 rounded border border-blue-100 text-sm">
                  {t('kpi.grossProfit')}: {selectedOrder.amount - Number(form.carrierCost)}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('dispatch.notes')}</label>
                <textarea className="w-full rounded-md border-gray-300 shadow-sm p-2 border" rows={2}
                  value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 disabled:opacity-50">
                  {loading ? t('common.loading') : t('dispatch.submit')}
                </button>
                <button type="button" onClick={() => setSelectedOrder(null)} className="px-4 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-500">
            {t('dispatch.select')}
          </div>
        )}
      </div>
    </div>
  );
};
