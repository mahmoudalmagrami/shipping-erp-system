import React from 'react';
import { Package, Clock, CheckCircle2, Ban } from 'lucide-react';

interface Props {
  counts: {
    initial: number;
    finalDispatched: number;
    cancelled: number;
    total: number;
  };
}

export const OrderStatusDonut: React.FC<Props> = ({ counts }) => {
  const total = counts.total || 0;
  const initial = counts.initial || 0;
  const dispatched = counts.finalDispatched || 0;
  const cancelled = counts.cancelled || 0;

  const initialPct = total > 0 ? (initial / total) * 100 : 0;
  const dispatchedPct = total > 0 ? (dispatched / total) * 100 : 0;
  const cancelledPct = total > 0 ? (cancelled / total) * 100 : 0;

  // SVG Circumference calculation for stroke-dasharray (Radius = 40, Circumference = 2 * PI * 40 = 251.32)
  const C = 2 * Math.PI * 40;
  const dispatchedDash = (dispatchedPct / 100) * C;
  const initialDash = (initialPct / 100) * C;
  const cancelledDash = (cancelledPct / 100) * C;

  const dispatchedOffset = 0;
  const initialOffset = -dispatchedDash;
  const cancelledOffset = -(dispatchedDash + initialDash);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <Package className="w-5 h-5" />
          </span>
          <h2 className="text-lg font-bold text-slate-800">تدفق الشحنات وحالتها</h2>
        </div>
        <p className="text-xs text-slate-500 mb-6">مخطط مسار العمليات التشغيلية للشحنات في المستودع</p>
      </div>

      {/* Donut graphic */}
      <div className="relative flex justify-center items-center my-2">
        <svg className="w-48 h-48 -rotate-90 transform" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            className="stroke-slate-100"
            strokeWidth="14"
            fill="transparent"
          />

          {total === 0 ? (
            <circle
              cx="50"
              cy="50"
              r="40"
              className="stroke-slate-200"
              strokeWidth="14"
              fill="transparent"
            />
          ) : (
            <>
              {/* Dispatched Segment (Green) */}
              {dispatched > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-emerald-500 transition-all duration-700"
                  strokeWidth="14"
                  strokeDasharray={`${dispatchedDash} ${C}`}
                  strokeDashoffset={dispatchedOffset}
                  fill="transparent"
                />
              )}

              {/* Initial Pending Segment (Amber/Yellow) */}
              {initial > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-amber-400 transition-all duration-700"
                  strokeWidth="14"
                  strokeDasharray={`${initialDash} ${C}`}
                  strokeDashoffset={initialOffset}
                  fill="transparent"
                />
              )}

              {/* Cancelled Segment (Rose/Red) */}
              {cancelled > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-rose-500 transition-all duration-700"
                  strokeWidth="14"
                  strokeDasharray={`${cancelledDash} ${C}`}
                  strokeDashoffset={cancelledOffset}
                  fill="transparent"
                />
              )}
            </>
          )}
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-3xl font-extrabold text-slate-800 font-mono">{total}</span>
          <span className="text-xs text-slate-500 font-medium">إجمالي الشحنات</span>
        </div>
      </div>

      {/* Legend & Status Breakdown Cards */}
      <div className="grid grid-cols-1 gap-2.5 mt-6">
        <div className="flex items-center justify-between p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100/60">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-900">مرحلة نهائياً للناقل</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 font-mono">{dispatched}</span>
            <span className="text-[11px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">
              {dispatchedPct.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between p-2.5 bg-amber-50/60 rounded-xl border border-amber-100/60">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold text-amber-900">بانتظار الترحيل للمورد</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-800 font-mono">{initial}</span>
            <span className="text-[11px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full font-bold">
              {initialPct.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between p-2.5 bg-rose-50/60 rounded-xl border border-rose-100/60">
          <div className="flex items-center gap-2">
            <Ban className="w-4 h-4 text-rose-600" />
            <span className="text-xs font-semibold text-rose-900">شحنات ملغاة</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-rose-800 font-mono">{cancelled}</span>
            <span className="text-[11px] bg-rose-200 text-rose-800 px-1.5 py-0.5 rounded-full font-bold">
              {cancelledPct.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
