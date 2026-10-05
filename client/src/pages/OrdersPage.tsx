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
    queryFn: () => getOrders({ search, status })
  });

  const statuses = [
    { value: '', label: t('orders.statusAll') },
    { value: 'initial', label: t('orders.statusInitial') },
    { value: 'dispatched', label: t('orders.statusDispatched') },
    { value: 'cancelled', label: t('orders.statusCancelled') },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <h1 className="text-xl font-bold">{t('orders.title')}</h1>
        <div className="flex gap-4 w-full sm:w-auto">
          <input 
            type="text" 
            placeholder={t('orders.search')} 
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none flex-1 sm:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {statuses.map(s => (
              <button
                key={s.value}
                onClick={() => setStatus(s.value)}
                className={`px-4 py-1 text-sm rounded-md transition-colors ${status === s.value ? 'bg-white shadow text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">{t('orders.colOrder')}</th>
              <th className="px-6 py-3">{t('orders.colSender')}</th>
              <th className="px-6 py-3">{t('orders.colReceiver')}</th>
              <th className="px-6 py-3">{t('orders.colZone')}</th>
              <th className="px-6 py-3">{t('orders.colWeight')}</th>
              <th className="px-6 py-3">{t('orders.colAmount')}</th>
              <th className="px-6 py-3">{t('orders.colPayment')}</th>
              <th className="px-6 py-3">{t('orders.colStatus')}</th>
              <th className="px-6 py-3">{t('orders.colWaybill')}</th>
              <th className="px-6 py-3">{t('orders.colDate')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={10} className="px-6 py-8 text-center">{t('common.loading')}</td></tr>
            ) : orders?.data?.length ? (
              orders.data.map((order) => (
                <tr key={order.id} className="bg-white border-b hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 font-medium text-blue-600">{order.orderNumber}</td>
                  <td className="px-6 py-4">{order.senderName}</td>
                  <td className="px-6 py-4">{order.receiverName}</td>
                  <td className="px-6 py-4">{order.zoneId}</td>
                  <td className="px-6 py-4">{order.actualWeight}</td>
                  <td className="px-6 py-4 font-semibold">{order.amount}</td>
                  <td className="px-6 py-4">{t(`booking.payment${order.paymentType.charAt(0).toUpperCase() + order.paymentType.slice(1)}`)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'initial' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'dispatched' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {t(`orders.status${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4">{order.waybillNumber || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={10} className="px-6 py-8 text-center text-gray-500">لا توجد بيانات</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
