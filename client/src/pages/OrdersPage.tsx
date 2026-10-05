import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getOrders } from '../api/endpoints';

export const OrdersPage: React.FC = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', search, status],
    queryFn: () => getOrders({ search, status: status || undefined })
  });

  const statuses = [
    { value: '', label: 'الكل' },
    { value: 'initial', label: 'طلب أولي معلق' },
    { value: 'final_dispatched', label: 'مرحل نهائي' },
    { value: 'cancelled', label: 'ملغي' },
  ];

  const renderStatus = (s?: string) => {
    if (s === 'initial') {
      return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">طلب أولي</span>;
    }
    if (s === 'final_dispatched' || s === 'dispatched') {
      return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">مرحل نهائي</span>;
    }
    return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">ملغي</span>;
  };

  const renderPayment = (p?: string) => {
    if (p === 'cash') return '💵 نقداً';
    if (p === 'bank') return '🏦 بنك / صراف';
    if (p === 'credit') return '📝 آجل';
    return p || '-';
  };

  const orderList = Array.isArray(orders?.data) ? orders.data : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('orders.title')}</h1>
          <p className="text-sm text-gray-500">استعراض كافة الشحنات والبحث برقم الطلب، البوليصة، أو الأسماء</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <input 
            type="text" 
            placeholder="بحث برقم الطلب، البوليصة، المرسل..." 
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none flex-1 sm:w-64 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {statuses.map(s => (
              <button
                key={s.value}
                onClick={() => setStatus(s.value)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${status === s.value ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">رقم الطلب</th>
              <th className="px-6 py-3">المرسل</th>
              <th className="px-6 py-3">المستلم</th>
              <th className="px-6 py-3">الوجهة</th>
              <th className="px-6 py-3">الوزن</th>
              <th className="px-6 py-3">قيمة المبيعات</th>
              <th className="px-6 py-3">الدفع</th>
              <th className="px-6 py-3">الحالة</th>
              <th className="px-6 py-3">بوليصة المورد</th>
              <th className="px-6 py-3">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={10} className="px-6 py-8 text-center text-gray-500">جاري تحميل البيانات...</td></tr>
            ) : orderList.length ? (
              orderList.map((order: any) => (
                <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-blue-600">{order.orderNumber}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{order.senderName}</td>
                  <td className="px-6 py-4 text-gray-600">{order.receiverName}</td>
                  <td className="px-6 py-4 text-gray-600">{order.zoneName || `منطقة ${order.zoneId}`}</td>
                  <td className="px-6 py-4">{Number(order.chargeableWeight || order.actualWeight || 0).toFixed(2)} كجم</td>
                  <td className="px-6 py-4 font-bold text-slate-800">
                    {Number(order.amount || order.totalSalesAmount || 0).toFixed(2)} ر.س
                  </td>
                  <td className="px-6 py-4">{renderPayment(order.paymentType)}</td>
                  <td className="px-6 py-4">{renderStatus(order.status)}</td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-600">
                    {order.waybillNumber || order.supplierWaybillNumber || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-SA') : '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="px-6 py-8 text-center text-gray-400">لا توجد طلبات مطابقة</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
