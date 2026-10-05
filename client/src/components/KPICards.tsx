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
    new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP' }).format(val);

  const kpis = data?.kpi || { mainCash: 0, bank: 0, totalLiquid: 0, ar: 0, ap: 0, totalSales: 0, totalCost: 0, grossProfit: 0, margin: 0 };

  const cards = [
    { label: t('kpi.mainCash'), value: kpis.mainCash, color: 'text-green-600' },
    { label: t('kpi.bank'), value: kpis.bank, color: 'text-blue-600' },
    { label: t('kpi.totalLiquid'), value: kpis.totalLiquid, color: 'text-indigo-600' },
    { label: t('kpi.ar'), value: kpis.ar, color: 'text-emerald-600' },
    { label: t('kpi.ap'), value: kpis.ap, color: 'text-red-600' },
  ];

  if (role !== 'cashier') {
    cards.push(
      { label: t('kpi.totalSales'), value: kpis.totalSales, color: 'text-gray-900' },
      { label: t('kpi.totalCost'), value: kpis.totalCost, color: 'text-orange-600' },
      { label: t('kpi.grossProfit'), value: kpis.grossProfit, color: kpis.grossProfit >= 0 ? 'text-green-600' : 'text-red-600' }
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
            <p className="text-xs text-gray-400 mt-1">{t('kpi.margin')}: {kpis.margin}%</p>
          )}
        </div>
      ))}
    </div>
  );
};
