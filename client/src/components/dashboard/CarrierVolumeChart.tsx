import React from 'react';
import { CarrierShareItem } from '../../types';
import { Truck } from 'lucide-react';

interface Props {
  carriers: CarrierShareItem[];
}

export const CarrierVolumeChart: React.FC<Props> = ({ carriers }) => {
  const safeCarriers = Array.isArray(carriers) ? carriers : [];
  const maxShipments = Math.max(...safeCarriers.map(c => c.shipmentsCount), 1);
  const totalShipments = safeCarriers.reduce((sum, c) => sum + c.shipmentsCount, 0);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <Truck className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-800">توزيع الشحنات على شركات الشحن</h2>
          </div>
          <span className="text-xs bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full font-bold">
            {totalShipments} طرد مرحل
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-4">حجم الطرود والتكلفة المحققة لكل شركة شحن ومورد لوجستي</p>
      </div>

      {safeCarriers.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-sm">
          لم يتم ترحيل شحنات لشركات الشحن بعد
        </div>
      ) : (
        /* Scrollable list with fixed max-height to ensure uniform grid row height */
        <div className="max-h-[300px] overflow-y-auto pr-1 space-y-2.5 divide-y divide-slate-100">
          {safeCarriers.map((carrier) => {
            const widthPct = Math.max((carrier.shipmentsCount / maxShipments) * 100, 4);

            return (
              <div key={carrier.carrierId} className="pt-2.5 first:pt-0">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1.5 truncate max-w-[65%]">
                    <span className="font-bold text-xs text-slate-800 truncate">{carrier.carrierName}</span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">({carrier.carrierCode})</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-slate-800 font-mono">
                      {carrier.shipmentsCount} طرد
                    </span>
                    <span className="text-[10px] font-bold text-orange-700 font-mono bg-orange-100 px-1.5 py-0.5 rounded">
                      {carrier.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-1.5">
                  <div
                    style={{ width: `${widthPct}%` }}
                    className="bg-orange-500 h-full rounded-full transition-all duration-500"
                  />
                </div>

                {/* Financial stats footer */}
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>المستحق: <strong className="text-slate-700">{carrier.totalCost.toFixed(2)} ر.س</strong></span>
                  <span>الربح: <strong className="text-emerald-600">+{carrier.grossProfit.toFixed(2)} ر.س</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
