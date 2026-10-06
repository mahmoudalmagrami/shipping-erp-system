import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getZones, calculateRate, updatePricingTier } from '../api/endpoints';
import { useAuthStore } from '../store/authStore';
import { Edit3, X, Check, Calculator } from 'lucide-react';
import toast from 'react-hot-toast';

export const PricingPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const role = useAuthStore(s => s.user?.role);
  const isAdmin = role === 'admin';

  const { data: zones } = useQuery({ queryKey: ['zones'], queryFn: getZones });

  const [calcForm, setCalcForm] = useState({ zoneId: '', weight: '', l: '', w: '', h: '' });
  const [calcResult, setCalcResult] = useState<number | null>(null);

  // Editing Tier state
  const [editingTier, setEditingTier] = useState<any | null>(null);
  const [tierForm, setTierForm] = useState({
    baseSellingPrice: '',
    extraKgPrice: '',
    estimatedCost: ''
  });
  const [updating, setUpdating] = useState(false);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calcForm.zoneId || !calcForm.weight) return;
    try {
      const res = await calculateRate({
        zoneId: Number(calcForm.zoneId),
        actualWeight: Number(calcForm.weight),
        lengthCm: calcForm.l ? Number(calcForm.l) : undefined,
        widthCm: calcForm.w ? Number(calcForm.w) : undefined,
        heightCm: calcForm.h ? Number(calcForm.h) : undefined,
      });
      if (res.success && res.data) {
        setCalcResult(res.data.totalSalesPrice ?? res.data.estCost);
      }
    } catch (e: any) {
      toast.error('تعذر حساب السعر');
    }
  };

  const handleOpenEditTier = (tier: any) => {
    setEditingTier(tier);
    setTierForm({
      baseSellingPrice: String(tier.baseSellingPrice ?? tier.basePrice ?? ''),
      extraKgPrice: String(tier.extraKgPrice ?? '0'),
      estimatedCost: String(tier.estimatedCost ?? tier.estCost ?? '0')
    });
  };

  const handleSaveTier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTier) return;
    setUpdating(true);
    try {
      const res = await updatePricingTier(editingTier.id, {
        baseSellingPrice: Number(tierForm.baseSellingPrice),
        extraKgPrice: Number(tierForm.extraKgPrice),
        estimatedCost: Number(tierForm.estimatedCost)
      });
      if (res.success) {
        toast.success(res.message || 'تم تحديث شريحة التسعير بنجاح');
        setEditingTier(null);
        queryClient.invalidateQueries({ queryKey: ['zones'] });
      } else {
        toast.error(res.message || 'فشل تحديث الشريحة');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل تحديث الشريحة');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Rate Calculator */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">{t('pricing.calcTitle')}</h2>
        </div>
        <form onSubmit={handleCalculate} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold mb-1 text-slate-700">{t('booking.zone')}</label>
            <select
              required
              className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 text-sm"
              value={calcForm.zoneId}
              onChange={e => setCalcForm({ ...calcForm, zoneId: e.target.value })}
            >
              <option value="">{t('common.select')}</option>
              {zones?.data?.map(z => (
                <option key={z.id} value={z.id}>
                  {z.nameAr || z.name} {z.countriesList ? `(${z.countriesList})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="w-32">
            <label className="block text-sm font-semibold mb-1 text-slate-700">{t('booking.weight')}</label>
            <input
              required
              type="number"
              step="0.1"
              min="0.1"
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-mono"
              value={calcForm.weight}
              onChange={e => setCalcForm({ ...calcForm, weight: e.target.value })}
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm shadow-sm transition-colors"
          >
            {t('pricing.calcBtn')}
          </button>
          
          {calcResult !== null && (
            <div className="ml-auto rtl:mr-auto rtl:ml-0 bg-emerald-50 text-emerald-800 px-6 py-2.5 rounded-lg border border-emerald-200 font-bold text-base flex items-center gap-2">
              <span>{t('pricing.result')}:</span>
              <span className="font-mono text-xl">{calcResult} ر.س</span>
            </div>
          )}
        </form>
      </div>

      {/* Pricing Matrix per Zone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {zones?.data?.map(zone => (
          <div key={zone.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-slate-900">{zone.nameAr || zone.name}</h3>
                {zone.countriesList && (
                  <p className="text-xs text-slate-500 mt-0.5">{zone.countriesList}</p>
                )}
              </div>
              <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">
                {zone.zoneCode}
              </span>
            </div>
            <table className="w-full text-sm text-right">
              <thead className="text-xs bg-slate-100/70 text-slate-700 uppercase">
                <tr>
                  <th className="px-4 py-3">{t('pricing.tierName')}</th>
                  <th className="px-4 py-3">{t('pricing.weightRange')}</th>
                  <th className="px-4 py-3">{t('pricing.basePrice')}</th>
                  <th className="px-4 py-3">{t('pricing.extraKgPrice')}</th>
                  {isAdmin && <th className="px-4 py-3 text-center">تعديل</th>}
                </tr>
              </thead>
              <tbody>
                {zone.tiers?.map((tier: any) => (
                  <tr key={tier.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{tier.name || tier.tierName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                      {tier.minWeight ?? tier.weightMinKg} - {tier.maxWeight ?? tier.weightMaxKg} كجم
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {Number(tier.basePrice ?? tier.baseSellingPrice).toFixed(2)} ر.س
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                      {Number(tier.extraKgPrice || 0) > 0 ? `${Number(tier.extraKgPrice).toFixed(2)} ر.س/كجم` : '—'}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleOpenEditTier(tier)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="تعديل أسعار الشريحة"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* ================= MODAL: EDIT PRICING TIER ================= */}
      {editingTier && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-100">
            <div className="px-6 py-4 bg-slate-50 border-b flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900">تعديل شريحة التسعير</h3>
                <p className="text-xs text-slate-500 mt-0.5">{editingTier.tierName || editingTier.name}</p>
              </div>
              <button onClick={() => setEditingTier(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTier} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  السعر الأساسي للبيع (ر.س)
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full border rounded-lg p-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500"
                  value={tierForm.baseSellingPrice}
                  onChange={e => setTierForm({ ...tierForm, baseSellingPrice: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  سعر الكيلو الإضافي (ر.س)
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full border rounded-lg p-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500"
                  value={tierForm.extraKgPrice}
                  onChange={e => setTierForm({ ...tierForm, extraKgPrice: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  التكلفة التقديرية للناقل (ر.س)
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full border rounded-lg p-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500"
                  value={tierForm.estimatedCost}
                  onChange={e => setTierForm({ ...tierForm, estimatedCost: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditingTier(null)}
                  className="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{updating ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
