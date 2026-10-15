import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getCustomers, getZones, createOrder, calculateRate } from '../api/endpoints';
import { useDebounce } from '../hooks/useDebounce';
import toast from 'react-hot-toast';

export const BookingPage: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [previewPrice, setPreviewPrice] = useState<number | null>(null);

  const { data: customers } = useQuery({ queryKey: ['customers'], queryFn: getCustomers });
  const { data: zones } = useQuery({ queryKey: ['zones'], queryFn: getZones });

  const [form, setForm] = useState({
    customerId: '',
    senderName: '',
    senderPhone: '',
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    zoneId: '',
    actualWeight: '',
    length: '',
    width: '',
    height: '',
    paymentType: 'cash',
    notes: ''
  });

  const debouncedActualWeight = useDebounce(form.actualWeight, 350);
  const debouncedLength = useDebounce(form.length, 350);
  const debouncedWidth = useDebounce(form.width, 350);
  const debouncedHeight = useDebounce(form.height, 350);

  useEffect(() => {
    if (form.zoneId && debouncedActualWeight) {
      calculateRate({
        zoneId: Number(form.zoneId),
        actualWeight: Number(debouncedActualWeight),
        lengthCm: debouncedLength ? Number(debouncedLength) : undefined,
        widthCm: debouncedWidth ? Number(debouncedWidth) : undefined,
        heightCm: debouncedHeight ? Number(debouncedHeight) : undefined,
      }).then(res => {
        if (res.success && res.data) setPreviewPrice(res.data.totalSalesPrice ?? res.data.estCost);
      }).catch(() => setPreviewPrice(null));
    } else {
      setPreviewPrice(null);
    }
  }, [form.zoneId, debouncedActualWeight, debouncedLength, debouncedWidth, debouncedHeight]);

  const handleCustomerChange = (customerId: string) => {
    const selected = customers?.data?.find((c: any) => String(c.id) === customerId);
    setForm(prev => ({
      ...prev,
      customerId,
      senderName: selected ? selected.fullName : prev.senderName,
      senderPhone: selected ? (selected.phone || '') : prev.senderPhone,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...form,
        zoneId: Number(form.zoneId),
        actualWeight: Number(form.actualWeight),
        lengthCm: form.length ? Number(form.length) : undefined,
        widthCm: form.width ? Number(form.width) : undefined,
        heightCm: form.height ? Number(form.height) : undefined,
        customerId: form.customerId ? Number(form.customerId) : undefined
      };
      const res = await createOrder(data);
      if (res.success) {
        toast.success(t('booking.success') + ': ' + res.data.orderNumber);
        setForm({
          customerId: '', senderName: '', senderPhone: '', receiverName: '', receiverPhone: '',
          receiverAddress: '', zoneId: '', actualWeight: '', length: '', width: '', height: '',
          paymentType: 'cash', notes: ''
        });
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
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('booking.title')}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('booking.customer')}</label>
            <select 
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              value={form.customerId}
              onChange={e => handleCustomerChange(e.target.value)}
            >
              <option value="">{t('booking.manualCustomer')}</option>
              {customers?.data?.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('booking.senderName')}</label>
            <input required type="text" className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
              value={form.senderName} onChange={e => setForm({...form, senderName: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('booking.senderPhone')}</label>
            <input required type="text" className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
              value={form.senderPhone} onChange={e => setForm({...form, senderPhone: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('booking.receiverName')}</label>
            <input required type="text" className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
              value={form.receiverName} onChange={e => setForm({...form, receiverName: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('booking.receiverPhone')}</label>
            <input required type="text" className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
              value={form.receiverPhone} onChange={e => setForm({...form, receiverPhone: e.target.value})} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('booking.receiverAddress')}</label>
            <input required type="text" className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
              value={form.receiverAddress} onChange={e => setForm({...form, receiverAddress: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('booking.zone')}</label>
            <select required className="w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white focus:ring-2 focus:ring-blue-500"
              value={form.zoneId} onChange={e => setForm({...form, zoneId: e.target.value})}>
              <option value="">{t('common.select')}</option>
              {zones?.data?.map(z => (
                <option key={z.id} value={z.id}>
                  {z.nameAr || z.name || z.zoneCode} {z.countriesList ? `(${z.countriesList})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('booking.weight')}</label>
            <input required type="number" step="0.1" min="0" className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
              value={form.actualWeight} onChange={e => setForm({...form, actualWeight: e.target.value})} />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('booking.length')}</label>
              <input type="number" className="w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                value={form.length} onChange={e => setForm({...form, length: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('booking.width')}</label>
              <input type="number" className="w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                value={form.width} onChange={e => setForm({...form, width: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('booking.height')}</label>
              <input type="number" className="w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                value={form.height} onChange={e => setForm({...form, height: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('booking.paymentType')}</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input type="radio" value="cash" checked={form.paymentType === 'cash'} onChange={e => setForm({...form, paymentType: e.target.value})} className="mr-2 rtl:ml-2" />
                {t('booking.paymentCash')}
              </label>
              <label className="flex items-center">
                <input type="radio" value="bank" checked={form.paymentType === 'bank'} onChange={e => setForm({...form, paymentType: e.target.value})} className="mr-2 rtl:ml-2" />
                {t('booking.paymentBank')}
              </label>
              <label className="flex items-center">
                <input type="radio" value="credit" disabled={!form.customerId} checked={form.paymentType === 'credit'} onChange={e => setForm({...form, paymentType: e.target.value})} className="mr-2 rtl:ml-2" />
                {t('booking.paymentCredit')}
              </label>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('booking.notes')}</label>
            <textarea className="w-full rounded-md border-gray-300 shadow-sm p-2 border" rows={3}
              value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
          </div>
        </div>

        {(previewPrice !== null || (Number(form.length) > 0 && Number(form.width) > 0 && Number(form.height) > 0)) && (
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 space-y-2">
            <div className="flex justify-between items-center border-b border-blue-100 pb-2">
              <span className="font-semibold text-blue-900">{t('booking.preview')}</span>
              {previewPrice !== null && (
                <span className="text-xl font-bold text-blue-700">{previewPrice} ر.س</span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-blue-800 pt-1">
              <div>الوزن الفعلي: <span className="font-bold">{form.actualWeight || 0} كغ</span></div>
              {Number(form.length) > 0 && Number(form.width) > 0 && Number(form.height) > 0 && (
                <div>
                  الوزن الحجمي: <span className="font-bold">
                    {(Number(form.length) * Number(form.width) * Number(form.height) / 5000).toFixed(2)} كغ
                  </span>
                </div>
              )}
              <div>
                الوزن المحاسب: <span className="font-bold text-blue-950">
                  {Math.max(
                    Number(form.actualWeight) || 0,
                    (Number(form.length) > 0 && Number(form.width) > 0 && Number(form.height) > 0)
                      ? Number((Number(form.length) * Number(form.width) * Number(form.height) / 5000).toFixed(2))
                      : 0
                  )} كغ
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
            {loading ? t('common.loading') : t('booking.submit')}
          </button>
        </div>
      </form>
    </div>
  );
};
