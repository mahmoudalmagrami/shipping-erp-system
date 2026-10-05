import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getFinancialSummary, getOrders } from '../api/endpoints';
import { KPICards } from '../components/KPICards';
import { RefreshCw } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();

  const { data: summary, refetch: refetchSummary } = useQuery({
    queryKey: ['financialSummary'],
    queryFn: getFinancialSummary
  });

  const { data: recentOrders, refetch: refetchOrders } = useQuery({
    queryKey: ['recentOrders'],
    queryFn: () => getOrders({ limit: 5 })
  });

  const handleRefresh = () => {
    refetchSummary();
    refetchOrders();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('nav.dashboard')}</h1>
        <button onClick={handleRefresh} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <KPICards data={summary?.data} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
          <span className="text-gray-500 mb-2">إجمالي الطلبات</span>
          <span className="text-3xl font-bold">{summary?.data?.counts?.totalOrders || 0}</span>
        </div>
        <div className="bg-yellow-50 p-6 rounded-xl shadow-sm border border-yellow-100 flex flex-col justify-center items-center">
          <span className="text-yellow-700 mb-2">قيد الانتظار</span>
          <span className="text-3xl font-bold text-yellow-800">{summary?.data?.counts?.pendingOrders || 0}</span>
        </div>
        <div className="bg-green-50 p-6 rounded-xl shadow-sm border border-green-100 flex flex-col justify-center items-center">
          <span className="text-green-700 mb-2">تم الترحيل</span>
          <span className="text-3xl font-bold text-green-800">{summary?.data?.counts?.dispatchedOrders || 0}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold">{t('orders.title')} (أحدث 5)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">{t('orders.colOrder')}</th>
                <th className="px-6 py-3">{t('orders.colSender')}</th>
                <th className="px-6 py-3">{t('orders.colReceiver')}</th>
                <th className="px-6 py-3">{t('orders.colAmount')}</th>
                <th className="px-6 py-3">{t('orders.colStatus')}</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders?.data?.map((order) => (
                <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{order.orderNumber}</td>
                  <td className="px-6 py-4">{order.senderName}</td>
                  <td className="px-6 py-4">{order.receiverName}</td>
                  <td className="px-6 py-4">{order.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'initial' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'dispatched' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {t(`orders.status${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`)}
                    </span>
                  </td>
                </tr>
              ))}
              {!recentOrders?.data?.length && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">لا توجد بيانات</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
