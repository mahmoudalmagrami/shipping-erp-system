import React from 'react';
import { Scale, Users, Building2, ShieldCheck, AlertTriangle } from 'lucide-react';

interface Props {
  debtRatio: {
    receivables: number;
    payables: number;
    netBalance: number;
    coveragePct: number;
  };
}

export const WorkingCapitalWidget: React.FC<Props> = ({ debtRatio }) => {
  const receivables = Number(debtRatio?.receivables || 0);
  const payables = Number(debtRatio?.payables || 0);
  const net = Number(debtRatio?.netBalance || (receivables - payables));
  const coverage = Number(debtRatio?.coveragePct || 100);

  const maxVal = Math.max(receivables, payables, 100);
  const recPct = Math.min((receivables / maxVal) * 100, 100);
  const payPct = Math.min((payables / maxVal) * 100, 100);

  const isHealthy = net >= 0;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Scale className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-800">ميزان الذمم ورأس المال العامل</h2>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${
            isHealthy ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
          }`}>
            {isHealthy ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            <span>{isHealthy ? 'تغطية ائتمانية آمنة' : 'مستحقات تفوق الذمم'}</span>
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-4">مقارنة ديون العملاء المطلوب تحصيلها مع التزامات شركات الشحن</p>
      </div>

      {/* Comparative Visual Bars */}
      <div className="space-y-3.5 my-2">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="flex items-center gap-1 text-slate-700 font-bold">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>ذمم العملاء المدينة (1100)</span>
            </span>
            <span className="font-bold font-mono text-blue-700">
              {receivables.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س
            </span>
          </div>
          <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              style={{ width: `${recPct}%` }}
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
            />
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="flex items-center gap-1 text-slate-700 font-bold">
              <Building2 className="w-3.5 h-3.5 text-rose-600" />
              <span>مستحقات شركات الشحن (2100)</span>
            </span>
            <span className="font-bold font-mono text-rose-700">
              {payables.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س
            </span>
          </div>
          <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              style={{ width: `${payPct}%` }}
              className="bg-rose-500 h-full rounded-full transition-all duration-500"
            />
          </div>
        </div>
      </div>

      {/* Net Summary Footer */}
      <div className="p-3.5 bg-gradient-to-l from-slate-50 to-white rounded-xl border border-slate-100 flex justify-between items-center mt-2">
        <div>
          <div className="text-[11px] text-slate-500">صافي الموقف الائتماني:</div>
          <div className={`text-base font-extrabold font-mono mt-0.5 ${isHealthy ? 'text-emerald-700' : 'text-rose-700'}`}>
            {net > 0 ? `+${net.toLocaleString('ar-SA', { minimumFractionDigits: 2 })}` : `${net.toLocaleString('ar-SA', { minimumFractionDigits: 2 })}`} ر.س
          </div>
        </div>
        <div className="text-left">
          <div className="text-[10px] text-slate-400">نسبة التغطية</div>
          <div className="text-sm font-bold font-mono text-purple-700">
            {coverage.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
};
