import React, { useState } from 'react';
import { DailyTrendPoint } from '../../types';
import { BarChart3 } from 'lucide-react';

interface Props {
  data: DailyTrendPoint[];
  days: number;
  onDaysChange: (days: number) => void;
}

export const RevenueTrendChart: React.FC<Props> = ({ data, days, onDaysChange }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const safeData = Array.isArray(data) && data.length > 0 ? data : [];

  // Summary Metrics
  const totalSales = safeData.reduce((acc, d) => acc + Number(d.sales || 0), 0);
  const totalCost = safeData.reduce((acc, d) => acc + Number(d.cost || 0), 0);
  const totalProfit = Math.round((totalSales - totalCost) * 100) / 100;
  const marginPct = totalSales > 0 ? Math.round((totalProfit / totalSales) * 1000) / 10 : 0;

  // SVG Chart Geometry
  const svgWidth = 800;
  const svgHeight = 230;
  const marginLeft = 20;
  const marginRight = 55;
  const marginTop = 20;
  const marginBottom = 35;

  const chartWidth = svgWidth - marginLeft - marginRight;
  const chartHeight = svgHeight - marginTop - marginBottom;

  const rawMax = Math.max(
    ...safeData.map(d => Math.max(Number(d.sales || 0), Number(d.cost || 0), Number(d.profit || 0))),
    50
  );

  // Round up to nice number for grid lines
  const maxVal = Math.ceil(rawMax / 50) * 50 || 100;

  // Grid steps (3 steps: 0, half, max)
  const gridSteps = [
    { val: maxVal, y: marginTop },
    { val: Math.round(maxVal / 2), y: marginTop + chartHeight / 2 },
    { val: 0, y: marginTop + chartHeight }
  ];

  const N = safeData.length;
  const slotWidth = N > 0 ? chartWidth / N : chartWidth;
  const barWidth = Math.max(Math.min(slotWidth * 0.32, 12), 4);

  // Calculate profit line path points
  const points = safeData.map((d, i) => {
    const cx = marginLeft + i * slotWidth + slotWidth / 2;
    const pVal = Math.max(Number(d.profit || 0), 0);
    const py = marginTop + chartHeight - (pVal / maxVal) * chartHeight;
    return { cx, py, ...d };
  });

  const pathD = points.length > 0
    ? points.reduce((acc, pt, idx) => {
        return idx === 0 ? `M ${pt.cx} ${pt.py}` : `${acc} L ${pt.cx} ${pt.py}`;
      }, '')
    : '';

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-full">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-800">كفاءة الإيرادات والأرباح</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">مقارنة المبيعات (حـ/ 4100) بتكاليف الشحن (حـ/ 5100) وصافي الربح</p>
        </div>

        {/* Days Filter Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {[
            { label: '7 أيام', val: 7 },
            { label: '14 يوم', val: 14 },
            { label: '30 يوم', val: 30 }
          ].map(tab => (
            <button
              key={tab.val}
              onClick={() => onDaysChange(tab.val)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                days === tab.val 
                  ? 'bg-white text-blue-600 shadow-sm font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================= SUMMARY STATS PILLS ================= */}
      <div className="grid grid-cols-3 gap-3 mb-5 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 text-center">
        <div>
          <div className="text-xs text-slate-500 mb-0.5">إجمالي المبيعات</div>
          <div className="text-sm font-bold text-blue-700 font-mono">
            {totalSales.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-0.5">تكلفة الموردين</div>
          <div className="text-sm font-bold text-amber-700 font-mono">
            {totalCost.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-0.5">صافي الهامش الربحي</div>
          <div className="text-sm font-bold text-emerald-700 font-mono flex items-center justify-center gap-1">
            <span>{totalProfit.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س</span>
            <span className="text-[11px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-sans">
              ({marginPct}%)
            </span>
          </div>
        </div>
      </div>

      {/* ================= PURE SVG CHART ================= */}
      <div className="relative w-full">
        {/* Floating Tooltip positioned dynamically */}
        {hoveredIdx !== null && safeData[hoveredIdx] && points[hoveredIdx] && (
          <div
            className="absolute z-20 -top-12 bg-slate-900/95 backdrop-blur-sm text-white text-xs px-3.5 py-2.5 rounded-xl shadow-xl pointer-events-none transition-all border border-slate-700 min-w-[180px] -translate-x-1/2"
            style={{
              left: `${Math.min(Math.max((points[hoveredIdx].cx / svgWidth) * 100, 15), 85)}%`,
            }}
          >
            <div className="font-bold border-b border-slate-700 pb-1 text-slate-300 flex justify-between items-center mb-1">
              <span>{safeData[hoveredIdx].displayDate}</span>
              <span className="text-[10px] text-slate-400">({safeData[hoveredIdx].orderCount} شحنات)</span>
            </div>
            <div className="flex justify-between text-blue-300 text-[11px]">
              <span>المبيعات:</span>
              <span className="font-mono font-bold">{safeData[hoveredIdx].sales.toFixed(2)} ر.س</span>
            </div>
            <div className="flex justify-between text-amber-300 text-[11px]">
              <span>تكلفة الناقل:</span>
              <span className="font-mono font-bold">{safeData[hoveredIdx].cost.toFixed(2)} ر.س</span>
            </div>
            <div className="flex justify-between text-emerald-300 font-bold text-[11px] pt-0.5 border-t border-slate-800">
              <span>صافي الربح:</span>
              <span className="font-mono">{safeData[hoveredIdx].profit.toFixed(2)} ر.س</span>
            </div>
          </div>
        )}

        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          className="w-full h-auto max-h-[260px] overflow-visible"
        >
          {/* Horizontal Grid lines and Y-axis labels */}
          {gridSteps.map(step => (
            <g key={step.val}>
              <line
                x1={marginLeft}
                y1={step.y}
                x2={svgWidth - marginRight}
                y2={step.y}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray={step.val === 0 ? undefined : "4 4"}
              />
              <text
                x={svgWidth - marginRight + 8}
                y={step.y + 4}
                fontSize="10"
                fill="#94a3b8"
                fontFamily="sans-serif"
                direction="ltr"
              >
                {step.val}
              </text>
            </g>
          ))}

          {/* Bar pairs for each day */}
          {safeData.map((d, i) => {
            const cx = marginLeft + i * slotWidth + slotWidth / 2;
            const isHovered = hoveredIdx === i;

            // Sales bar
            const sHeight = Math.max((Number(d.sales || 0) / maxVal) * chartHeight, Number(d.sales) > 0 ? 3 : 0);
            const sY = marginTop + chartHeight - sHeight;
            const sX = cx - barWidth - 1;

            // Cost bar
            const cHeight = Math.max((Number(d.cost || 0) / maxVal) * chartHeight, Number(d.cost) > 0 ? 3 : 0);
            const cY = marginTop + chartHeight - cHeight;
            const cX = cx + 1;

            return (
              <g key={d.date} className="cursor-pointer">
                {/* Sales Bar (Blue) */}
                {sHeight > 0 && (
                  <rect
                    x={sX}
                    y={sY}
                    width={barWidth}
                    height={sHeight}
                    fill={isHovered ? "#2563eb" : "#3b82f6"}
                    rx="3"
                    className="transition-colors duration-200"
                  />
                )}

                {/* Cost Bar (Amber) */}
                {cHeight > 0 && (
                  <rect
                    x={cX}
                    y={cY}
                    width={barWidth}
                    height={cHeight}
                    fill={isHovered ? "#d97706" : "#f59e0b"}
                    rx="3"
                    className="transition-colors duration-200"
                  />
                )}

                {/* X-axis date text with collision prevention */}
                {(days <= 7 || (days === 14 ? i % 2 === 0 : i % 5 === 0) || i === safeData.length - 1 || isHovered) && (
                  <text
                    x={cx}
                    y={marginTop + chartHeight + 18}
                    fontSize="10"
                    fill={isHovered ? "#1e293b" : "#94a3b8"}
                    fontWeight={isHovered ? "bold" : "normal"}
                    textAnchor="middle"
                  >
                    {d.displayDate.split(' ')[0]}
                  </text>
                )}

                {/* Invisible hover trigger area covering the whole vertical column */}
                <rect
                  x={marginLeft + i * slotWidth}
                  y={marginTop}
                  width={slotWidth}
                  height={chartHeight + 25}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              </g>
            );
          })}

          {/* Profit Trend Line (Emerald Green) */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-sm pointer-events-none"
            />
          )}

          {/* Profit Nodes (Dots) */}
          {points.map((pt, i) => (
            <circle
              key={pt.date}
              cx={pt.cx}
              cy={pt.py}
              r={hoveredIdx === i ? 5 : 3}
              fill="#10b981"
              stroke="#ffffff"
              strokeWidth="1.5"
              className="pointer-events-none transition-all duration-200"
            />
          ))}
        </svg>

        {/* Legend */}
        <div className="flex justify-center items-center gap-6 mt-3 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-500 inline-block" />
            <span>المبيعات (إيراد)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500 inline-block" />
            <span>تكلفة الناقلين</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded bg-emerald-500 inline-block" />
            <span>صافي الربح</span>
          </div>
        </div>
      </div>
    </div>
  );
};
