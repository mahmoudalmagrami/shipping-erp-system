import React from 'react';
import { useTranslation } from 'react-i18next';
import { FinancialSummary } from '../types';
import { useAuthStore } from '../store/authStore';

interface Props {
  data?: FinancialSummary;
}

export const KPICards: React.FC<Props> = ({ data }) => {
  const { t, i18n } = useTranslation();
  const role = useAuthStore(s => s.user?.role);
  
  const formatMoney = (val: number = 0) => 
    new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', { 
      style: 'currency', 
      currency: 'SAR',
      minimumFractionDigits: 2 
    }).format(Number(val) || 0);

  const raw = (data as any)?.kpi || {};
  const cashBox = Number(raw.cashBox ?? raw.mainCash ?? 0);
  const bank = Number(raw.bankExchange ?? raw.bank ?? 0);
  const totalLiquid = Number(raw.liquidTotal ?? raw.totalLiquid ?? (cashBox + bank));
  const ar = Number(raw.accountsReceivable ?? raw.ar ?? 0);
  const ap = Number(raw.accountsPayableCarriers ?? raw.ap ?? 0);
  const totalSales = Number(raw.totalSales ?? 0);
  const totalCost = Number(raw.totalCost ?? 0);
  const grossProfit = Number(raw.grossProfit ?? (totalSales - totalCost));
  const margin = Number(raw.profitMarginPct ?? raw.margin ?? 0);

  const cards = [
    { label: t('kpi.mainCash'), value: cashBox, color: 'text-emerald-600' },
    { label: t('kpi.bank'), value: bank, color: 'text-blue-600' },
    { label: t('kpi.totalLiquid'), value: totalLiquid, color: 'text-indigo-600' },
    { label: t('kpi.ar'), value: ar, color: 'text-amber-600' },
    { label: t('kpi.ap'), value: ap, color: 'text-red-600' },
  ];

  if (role !== 'cashier') {
    cards.push(
      { label: t('kpi.totalSales'), value: totalSales, color: 'text-slate-900' },
      { label: t('kpi.totalCost'), value: totalCost, color: 'text-orange-600' },
      { label: t('kpi.grossProfit'), value: grossProfit, color: grossProfit >= 0 ? 'text-emerald-600' : 'text-red-600' }
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {cards.map((c, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-2">{c.label}</h3>
          <p className={`text-2xl font-bold ${c.color} transition-all duration-500`}>
            {formatMoney(c.value)}
          </p>
          {c.label === t('kpi.grossProfit') && (
            <p className="text-xs text-gray-400 mt-1">{t('kpi.margin')}: {margin}%</p>
          )}
        </div>
      ))}
    </div>
  );
};
