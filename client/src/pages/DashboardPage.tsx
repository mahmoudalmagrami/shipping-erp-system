import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getFinancialSummary, getOrders, getDashboardAnalytics } from '../api/endpoints';
import { KPICards } from '../components/KPICards';
import { RevenueTrendChart } from '../components/dashboard/RevenueTrendChart';
import { OrderStatusDonut } from '../components/dashboard/OrderStatusDonut';
import { LiquidityDistributionWidget } from '../components/dashboard/LiquidityDistributionWidget';
import { WorkingCapitalWidget } from '../components/dashboard/WorkingCapitalWidget';
import { CarrierVolumeChart } from '../components/dashboard/CarrierVolumeChart';
import { RefreshCw, Package, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [trendDays, setTrendDays] = useState(14);

  const { 
    data: summary, 
    refetch: refetchSummary, 
    isFetching: isFetchingSummary 
  } = useQuery({
    queryKey: ['financialSummary'],
    queryFn: getFinancialSummary
  });

  const { 
    data: analytics, 
    refetch: refetchAnalytics, 
    isFetching: isFetchingAnalytics 
  } = useQuery({
    queryKey: ['dashboardAnalytics', trendDays],
    queryFn: () => getDashboardAnalytics({ days: trendDays })
  });

  const { 
    data: recentOrders, 
    refetch: refetchOrders, 
    isFetching: isFetchingOrders 
  } = useQuery({
    queryKey: ['recentOrders'],
    queryFn: () => getOrders({ limit: 6 })
  });

  const isRefreshing = isFetchingSummary || isFetchingAnalytics || isFetchingOrders;

  const handleRefresh = () => {
    refetchSummary();
    refetchAnalytics();
    refetchOrders();
  };

  const renderStatus = (status?: string) => {
    const s = status || 'initial';
    if (s === 'initial') {
      return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">طلب أولي معلق</span>;
    }
    if (s === 'final_dispatched' || s === 'dispatched') {
      return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">مرحل نهائي</span>;
    }
    return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">ملغي</span>;
  };

  const orderList = Array.isArray(recentOrders?.data) ? recentOrders.data : [];
  const analyticsData = analytics?.data;

  return (
    <div className="space-y-8 pb-10">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('nav.dashboard')}</h1>
          <p className="text-sm text-slate-500 mt-1">
            لوحة المؤشرات التنفيذية للرقابة اللحظية على الأداء المالي، السيولة، وتدفق الشحنات
          </p>
        </div>
        <button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-all shadow-sm text-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'جاري التحديث...' : 'تحديث المؤشرات'}</span>
        </button>
      </div>

      {/* ================= CORE FINANCIAL KPIS ================= */}
      <KPICards data={summary?.data} />

      {/* ================= PRIMARY CHARTS ROW ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Revenue & Profit Efficiency (2 Cols) */}
        <div className="lg:col-span-2">
          <RevenueTrendChart
            data={analyticsData?.dailyTrend || []}
            days={trendDays}
            onDaysChange={setTrendDays}
          />
        </div>

        {/* Operational Status Funnel (1 Col) */}
        <div className="lg:col-span-1">
          <OrderStatusDonut
            counts={analyticsData?.orderStatusCounts || {
              initial: summary?.data?.counts?.pendingOrders || 0,
              finalDispatched: summary?.data?.counts?.dispatchedOrders || 0,
              cancelled: 0,
              total: summary?.data?.counts?.totalOrders || 0
            }}
          />
        </div>
      </div>

      {/* ================= SECONDARY CHARTS & METRICS ROW ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {/* Liquidity Distribution */}
        <LiquidityDistributionWidget
          liquidity={analyticsData?.liquidityDistribution || {
            cashBox: summary?.data?.kpi?.mainCash || 0,
            cashPct: 50,
            bankExchange: summary?.data?.kpi?.bank || 0,
            bankPct: 50,
            total: summary?.data?.kpi?.totalLiquid || 0
          }}
        />

        {/* Working Capital & Receivables / Payables */}
        <WorkingCapitalWidget
          debtRatio={analyticsData?.debtRatio || {
            receivables: summary?.data?.kpi?.ar || 0,
            payables: summary?.data?.kpi?.ap || 0,
            netBalance: (summary?.data?.kpi?.ar || 0) - (summary?.data?.kpi?.ap || 0),
            coveragePct: 100
          }}
        />

        {/* Carrier Share */}
        <CarrierVolumeChart
          carriers={analyticsData?.carrierShare || []}
        />
      </div>

      {/* ================= RECENT SHIPMENTS TABLE ================= */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-800">{t('orders.title')} (أحدث الشحنات المسجلة)</h2>
          </div>
          <Link
            to="/orders"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
          >
            <span>عرض كل الطلبات</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right text-slate-600">
            <thead className="text-xs text-slate-500 uppercase bg-slate-100/70">
              <tr>
                <th className="px-6 py-3 font-semibold">{t('orders.colOrder')}</th>
                <th className="px-6 py-3 font-semibold">{t('orders.colSender')}</th>
                <th className="px-6 py-3 font-semibold">{t('orders.colReceiver')}</th>
                <th className="px-6 py-3 font-semibold">الناقل / الوجهة</th>
                <th className="px-6 py-3 font-semibold">{t('orders.colAmount')}</th>
                <th className="px-6 py-3 font-semibold">{t('orders.colStatus')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orderList.slice(0, 6).map((order: any) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">{order.orderNumber}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{order.senderName}</td>
                  <td className="px-6 py-4 text-slate-600">{order.receiverName}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {order.carrierName ? (
                      <span className="font-semibold text-slate-800">{order.carrierName}</span>
                    ) : (
                      <span className="text-slate-400">بانتظار الترحيل</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold font-mono text-slate-900">
                    {Number(order.amount || order.totalSalesAmount || 0).toFixed(2)} ر.س
                  </td>
                  <td className="px-6 py-4">
                    {renderStatus(order.status)}
                  </td>
                </tr>
              ))}
              {orderList.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                    لا توجد شحنات مسجلة حالياً
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
