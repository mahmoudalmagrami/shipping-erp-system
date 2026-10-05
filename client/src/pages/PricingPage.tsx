import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getZones, calculateRate } from '../api/endpoints';

export const PricingPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: zones } = useQuery({ queryKey: ['zones'], queryFn: getZones });

  const [calcForm, setCalcForm] = useState({ zoneId: '', weight: '', l: '', w: '', h: '' });
  const [calcResult, setCalcResult] = useState<number | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calcForm.zoneId || !calcForm.weight) return;
    try {
      const res = await calculateRate({
        zoneId: calcForm.zoneId,
        actualWeight: Number(calcForm.weight),
        length: calcForm.l ? Number(calcForm.l) : undefined,
        width: calcForm.w ? Number(calcForm.w) : undefined,
        height: calcForm.h ? Number(calcForm.h) : undefined,
      });
      if (res.success && res.data) setCalcResult(res.data.estCost);
    } catch (e) {}
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4">{t('pricing.calcTitle')}</h2>
        <form onSubmit={handleCalculate} className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm mb-1">{t('booking.zone')}</label>
            <select required className="p-2 border rounded" value={calcForm.zoneId} onChange={e => setCalcForm({...calcForm, zoneId: e.target.value})}>
              <option value="">{t('common.select', 'Select')}</option>
              {zones?.data?.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">{t('booking.weight')}</label>
            <input required type="number" step="0.1" className="p-2 border rounded w-24" value={calcForm.weight} onChange={e => setCalcForm({...calcForm, weight: e.target.value})} />
          </div>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{t('pricing.calcBtn')}</button>
          
          {calcResult !== null && (
            <div className="ml-auto rtl:mr-auto rtl:ml-0 bg-green-50 text-green-800 px-6 py-2 rounded border border-green-200 font-bold text-lg">
              {t('pricing.result')}: {calcResult}
            </div>
          )}
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {zones?.data?.map(zone => (
          <div key={zone.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b font-bold text-lg">{zone.name}</div>
            <table className="w-full text-sm text-left rtl:text-right">
              <thead className="text-xs bg-gray-100 uppercase">
                <tr>
                  <th className="px-4 py-2">{t('pricing.tierName')}</th>
                  <th className="px-4 py-2">{t('pricing.weightRange')}</th>
                  <th className="px-4 py-2">{t('pricing.basePrice')}</th>
                  <th className="px-4 py-2">{t('pricing.extraKgPrice')}</th>
                </tr>
              </thead>
              <tbody>
                {zone.tiers.map(tier => (
                  <tr key={tier.id} className="border-b">
                    <td className="px-4 py-3">{tier.name}</td>
                    <td className="px-4 py-3">{tier.minWeight} - {tier.maxWeight === 999999 ? '∞' : tier.maxWeight} kg</td>
                    <td className="px-4 py-3">{tier.basePrice}</td>
                    <td className="px-4 py-3">{tier.extraKgPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};
