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

  const renderStatus = (status?: string) => {
    const s = status || 'initial';
    if (s === 'initial') {
      return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">طلب أولي معلق</span>;
    }
    if (s === 'final_dispatched' || s === 'dispatched') {
      return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">مرحل نهائي</span>;
    }
    return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">ملغي</span>;
  };

  const orderList = Array.isArray(recentOrders?.data) ? recentOrders.data : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('nav.dashboard')}</h1>
          <p className="text-sm text-gray-500 mt-1">نظرة عامة على الأداء المالي، السيولة، وحالة الشحنات</p>
        </div>
        <button 
          onClick={handleRefresh} 
          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>تحديث</span>
        </button>
      </div>

      <KPICards data={summary?.data} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
          <span className="text-gray-500 mb-2 font-medium">إجمالي الطلبات</span>
          <span className="text-3xl font-bold text-slate-800">{summary?.data?.counts?.totalOrders || 0}</span>
        </div>
        <div className="bg-yellow-50/70 p-6 rounded-xl shadow-sm border border-yellow-200 flex flex-col justify-center items-center">
          <span className="text-yellow-800 mb-2 font-medium">بانتظار الترحيل للمورد</span>
          <span className="text-3xl font-bold text-yellow-900">{summary?.data?.counts?.pendingOrders || 0}</span>
        </div>
        <div className="bg-green-50/70 p-6 rounded-xl shadow-sm border border-green-200 flex flex-col justify-center items-center">
          <span className="text-green-800 mb-2 font-medium">شحنات مرحلة نهائياً</span>
          <span className="text-3xl font-bold text-green-900">{summary?.data?.counts?.dispatchedOrders || 0}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">{t('orders.title')} (أحدث الشحنات)</h2>
          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
            {orderList.length} شحنة مسجلة
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right text-gray-500">
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
              {orderList.slice(0, 5).map((order: any) => (
                <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-blue-600">{order.orderNumber}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{order.senderName}</td>
                  <td className="px-6 py-4 text-gray-600">{order.receiverName}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {Number(order.amount || order.totalSalesAmount || 0).toFixed(2)} ر.س
                  </td>
                  <td className="px-6 py-4">
                    {renderStatus(order.status)}
                  </td>
                </tr>
              ))}
              {orderList.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">لا توجد طلبات مسجلة حتى الآن</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
