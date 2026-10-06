import React from 'react';
import { Wallet, Landmark, Coins } from 'lucide-react';

interface Props {
  liquidity: {
    cashBox: number;
    cashPct: number;
    bankExchange: number;
    bankPct: number;
    total: number;
  };
}

export const LiquidityDistributionWidget: React.FC<Props> = ({ liquidity }) => {
  const cash = Number(liquidity?.cashBox || 0);
  const bank = Number(liquidity?.bankExchange || 0);
  const total = Number(liquidity?.total || (cash + bank));
  const cashPct = total > 0 ? (cash / total) * 100 : 0;
  const bankPct = total > 0 ? (bank / total) * 100 : 0;

  // Semi-circle meter parameters (Radius = 55, arc length = PI * 55 = 172.78)
  const arcLength = Math.PI * 55;
  const cashDash = (cashPct / 100) * arcLength;
  const bankDash = (bankPct / 100) * arcLength;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Coins className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-800">توزيع السيولة النقدية والمصرفية</h2>
          </div>
          <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-bold">
            جاهزية الصناديق
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-4">موقف النقدية الفعلي بين الصندوق الرئيسي والحسابات البنكية</p>
      </div>

      {/* Visual Semi-Circle Meter */}
      <div className="relative flex flex-col items-center justify-center my-2">
        <svg className="w-44 h-24 overflow-visible" viewBox="0 0 140 75">
          {/* Background Arc */}
          <path
            d="M 15,70 A 55,55 0 0,1 125,70"
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Cash Arc (Emerald) */}
          {cashPct > 0 && (
            <path
              d="M 15,70 A 55,55 0 0,1 125,70"
              fill="none"
              stroke="#10b981"
              strokeWidth="14"
              strokeDasharray={`${cashDash} ${arcLength}`}
              strokeDashoffset={0}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          )}

          {/* Bank Arc (Blue) */}
          {bankPct > 0 && (
            <path
              d="M 15,70 A 55,55 0 0,1 125,70"
              fill="none"
              stroke="#2563eb"
              strokeWidth="14"
              strokeDasharray={`${bankDash} ${arcLength}`}
              strokeDashoffset={-cashDash}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          )}
        </svg>

        {/* Center Total in Arc */}
        <div className="absolute bottom-0 flex flex-col items-center pointer-events-none text-center">
          <span className="text-xl font-extrabold text-slate-900 font-mono">
            {total.toLocaleString('ar-SA', { minimumFractionDigits: 0 })} ر.س
          </span>
          <span className="text-[10px] text-slate-400 font-medium">إجمالي السيولة الجاهزة</span>
        </div>
      </div>

      {/* Account Balance Cards */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/60">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800">الصندوق (1010)</span>
            </div>
            <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
              {cashPct.toFixed(1)}%
            </span>
          </div>
          <div className="text-sm font-black font-mono text-emerald-700">
            {cash.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">نقدية الخزينة المركزية</div>
        </div>

        <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/60">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-800">البنك (1020)</span>
            </div>
            <span className="text-[10px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded font-bold">
              {bankPct.toFixed(1)}%
            </span>
          </div>
          <div className="text-sm font-black font-mono text-blue-700">
            {bank.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">الحسابات والشبكات</div>
        </div>
      </div>
    </div>
  );
};
