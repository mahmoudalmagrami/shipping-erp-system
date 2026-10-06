import React, { useState } from 'react';
import { Order } from '../types';
import { Printer, X, Tag, Receipt } from 'lucide-react';

interface Props {
  order: Order;
  onClose: () => void;
}

export const WaybillPrintTemplate: React.FC<Props> = ({ order, onClose }) => {
  const [printMode, setPrintMode] = useState<'thermal' | 'label'>('thermal');

  const handlePrint = () => {
    window.print();
  };

  const paymentText = {
    cash: 'نقداً (Cash)',
    bank: 'حوالة بنكية / صراف (Bank)',
    credit: 'آجل على الحساب (Credit)',
  }[order.paymentType] || order.paymentType;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      {/* Container - on screen */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 my-8">
        {/* Modal Controls (Hidden in print) */}
        <div className="p-4 bg-slate-100 border-b flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPrintMode('thermal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                printMode === 'thermal' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>إيصال حراري (80mm)</span>
            </button>
            <button
              onClick={() => setPrintMode('label')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                printMode === 'label' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>ملصق الطرد (A4 / 4x6)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الآن</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Area */}
        <div className="p-6 flex justify-center bg-slate-50 min-h-[400px]">
          {printMode === 'thermal' ? (
            /* ================= 80mm THERMAL RECEIPT ================= */
            <div
              id="printable-area"
              className="bg-white p-6 shadow-sm border border-slate-200 w-[80mm] max-w-full text-slate-900 font-mono text-xs leading-relaxed"
            >
              {/* Header */}
              <div className="text-center pb-3 border-b-2 border-dashed border-slate-400">
                <h2 className="font-bold text-base font-sans">شركة الشحن واللوجستيات</h2>
                <p className="text-[10px] text-slate-500">إيصال استلام شحنة رسمية</p>
                <div className="mt-2 text-sm font-bold tracking-wider bg-slate-100 py-1 rounded">
                  {order.orderNumber}
                </div>
                {/* Visual Barcode lines */}
                <div className="flex justify-center gap-[2px] h-8 my-2 items-center">
                  {[4,2,6,1,3,5,2,4,1,6,3,2,5,1,4,2,6,1,3,5,2,4].map((w, i) => (
                    <div key={i} className="bg-black h-full" style={{ width: `${w}px` }} />
                  ))}
                </div>
                <p className="text-[10px] text-slate-500">
                  {order.createdAt ? new Date(order.createdAt).toLocaleString('ar-SA') : new Date().toLocaleString('ar-SA')}
                </p>
              </div>

              {/* Sender & Receiver Info */}
              <div className="py-3 border-b border-dashed border-slate-300 space-y-1.5">
                <div>
                  <span className="font-bold">المرسل: </span>
                  <span>{order.senderName}</span>
                </div>
                <div>
                  <span className="font-bold">هاتف المرسل: </span>
                  <span dir="ltr">{order.senderPhone}</span>
                </div>
                <div className="pt-1.5 border-t border-slate-100">
                  <span className="font-bold">المستلم: </span>
                  <span>{order.receiverName}</span>
                </div>
                <div>
                  <span className="font-bold">هاتف المستلم: </span>
                  <span dir="ltr">{order.receiverPhone}</span>
                </div>
                <div>
                  <span className="font-bold">العنوان: </span>
                  <span className="font-sans text-[11px]">{order.receiverAddress}</span>
                </div>
                <div>
                  <span className="font-bold">الوجهة: </span>
                  <span className="font-sans font-bold text-blue-800">{order.zoneName || `منطقة ${order.zoneId}`}</span>
                </div>
              </div>

              {/* Package Details */}
              <div className="py-3 border-b border-dashed border-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>الوزن الفعلي:</span>
                  <span className="font-bold">{Number(order.actualWeight).toFixed(2)} كجم</span>
                </div>
                {(order.length || order.width || order.height) ? (
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span>الأبعاد (سم):</span>
                    <span>{order.length || 0} × {order.width || 0} × {order.height || 0}</span>
                  </div>
                ) : null}
                {order.volumetricWeight ? (
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span>الوزن الحجمي:</span>
                    <span>{Number(order.volumetricWeight).toFixed(2)} كجم</span>
                  </div>
                ) : null}
                {order.chargeableWeight ? (
                  <div className="flex justify-between font-bold">
                    <span>الوزن المفوتر:</span>
                    <span>{Number(order.chargeableWeight).toFixed(2)} كجم</span>
                  </div>
                ) : null}
              </div>

              {/* Financial summary */}
              <div className="py-3 border-b-2 border-dashed border-slate-400 space-y-1">
                <div className="flex justify-between text-sm font-bold">
                  <span>إجمالي المبلغ:</span>
                  <span className="text-base">{Number(order.amount || order.totalSalesAmount || 0).toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>طريقة الدفع:</span>
                  <span>{paymentText}</span>
                </div>
                {order.waybillNumber || order.supplierWaybillNumber ? (
                  <div className="flex justify-between text-[11px] pt-1">
                    <span>بوليصة المورد:</span>
                    <span className="font-bold">{order.waybillNumber || order.supplierWaybillNumber}</span>
                  </div>
                ) : null}
              </div>

              {/* Footer */}
              <div className="text-center pt-3 text-[10px] text-slate-500">
                <p>شكراً لاختياركم خدماتنا</p>
                <p>يرجى الاحتفاظ بهذا الإيصال لتتبع الشحنة</p>
              </div>
            </div>
          ) : (
            /* ================= A4 / 4x6 SHIPPING LABEL ================= */
            <div
              id="printable-area"
              className="bg-white p-6 shadow-sm border-2 border-slate-800 w-[140mm] max-w-full text-slate-900 font-sans"
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-3 mb-3">
                <div>
                  <h2 className="text-xl font-black">بوليصة شحن لوجستية</h2>
                  <p className="text-xs text-slate-500">EXPRESS LOGISTICS WAYBILL</p>
                </div>
                <div className="text-left font-mono">
                  <div className="text-sm font-bold bg-slate-900 text-white px-3 py-1 rounded">
                    {order.orderNumber}
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-SA') : new Date().toLocaleDateString('ar-SA')}
                  </span>
                </div>
              </div>

              {/* Barcode visual */}
              <div className="flex flex-col items-center justify-center my-3 bg-slate-50 p-2 rounded border border-slate-200">
                <div className="flex gap-1 h-12 items-center">
                  {[4,1,5,2,3,6,1,4,2,5,3,1,6,2,4,1,5,3,2,6,1,4,2,5,3].map((w, i) => (
                    <div key={i} className="bg-black h-full" style={{ width: `${w * 1.5}px` }} />
                  ))}
                </div>
                <span className="font-mono text-xs font-bold tracking-widest mt-1">{order.orderNumber}</span>
              </div>

              {/* Destination Box */}
              <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-3 my-3">
                <span className="text-xs font-bold text-blue-900 block">منطقة الوجهة والتسليم:</span>
                <span className="text-lg font-black text-blue-950 block">
                  {order.zoneName || `منطقة ${order.zoneId}`}
                </span>
              </div>

              {/* Sender & Receiver Grid */}
              <div className="grid grid-cols-2 gap-4 border-2 border-slate-300 rounded-lg p-3 my-3 text-xs">
                <div>
                  <span className="font-bold text-slate-500 block mb-1">المرسل (FROM):</span>
                  <p className="font-bold text-sm text-slate-900">{order.senderName}</p>
                  <p className="font-mono mt-1" dir="ltr">{order.senderPhone}</p>
                </div>
                <div className="border-r border-slate-300 pr-3 rtl:border-r-0 rtl:border-l rtl:pl-3">
                  <span className="font-bold text-slate-500 block mb-1">المستلم (TO):</span>
                  <p className="font-bold text-sm text-slate-900">{order.receiverName}</p>
                  <p className="font-mono mt-1" dir="ltr">{order.receiverPhone}</p>
                  <p className="text-slate-700 mt-1 font-semibold">{order.receiverAddress}</p>
                </div>
              </div>

              {/* Dimensions & Weight Grid */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs border border-slate-300 rounded-lg p-2.5 my-3 bg-slate-50">
                <div>
                  <span className="text-slate-500 block">الوزن الفعلي</span>
                  <span className="font-bold text-sm font-mono">{Number(order.actualWeight).toFixed(2)} كجم</span>
                </div>
                <div>
                  <span className="text-slate-500 block">الوزن المفوتر</span>
                  <span className="font-bold text-sm font-mono">
                    {Number(order.chargeableWeight || order.actualWeight).toFixed(2)} كجم
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">طريقة الدفع</span>
                  <span className="font-bold text-xs">{paymentText}</span>
                </div>
              </div>

              {/* Dispatched Info if available */}
              {(order.carrierName || order.supplierWaybillNumber) && (
                <div className="border border-emerald-300 bg-emerald-50 rounded-lg p-2.5 text-xs flex justify-between items-center text-emerald-950 font-semibold">
                  <span>الناقل المعتمد: {order.carrierName || 'ناقل دولي'}</span>
                  <span className="font-mono">بوليصة التتبع: {order.supplierWaybillNumber || order.waybillNumber}</span>
                </div>
              )}

              {/* Footer Notice */}
              <div className="text-[10px] text-slate-400 text-center mt-3 pt-2 border-t border-slate-200">
                نظام إدارة الشحن والمحاسبة الذاتية v2.1 • تم التحقق والإصدار إلكترونياً
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
