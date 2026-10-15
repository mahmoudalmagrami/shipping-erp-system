import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getOrders, cancelOrder } from '../api/endpoints';
import { Order } from '../types';
import { WaybillPrintTemplate } from '../components/WaybillPrintTemplate';
import { useDebounce } from '../hooks/useDebounce';
import { Eye, Printer, Ban, Download, X, Package, CheckCircle2, Clock, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export const OrdersPage: React.FC = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);

  const debouncedSearch = useDebounce(search, 350);

  const { data: orders, isLoading, isError, refetch } = useQuery({
    queryKey: ['orders', debouncedSearch, status, page],
    queryFn: () => getOrders({ search: debouncedSearch || undefined, status: status || undefined, page, pageSize })
  });

  const statuses = [
    { value: '', label: 'الكل' },
    { value: 'initial', label: 'طلب أولي معلق' },
    { value: 'final_dispatched', label: 'مرحل نهائي' },
    { value: 'cancelled', label: 'ملغي' },
  ];

  const renderStatus = (s?: string) => {
    if (s === 'initial') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
          <Clock className="w-3 h-3" />
          <span>طلب أولي معلق</span>
        </span>
      );
    }
    if (s === 'final_dispatched' || s === 'dispatched') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          <CheckCircle2 className="w-3 h-3" />
          <span>مرحل نهائي</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
        <XCircle className="w-3 h-3" />
        <span>ملغي</span>
      </span>
    );
  };

  const renderPayment = (p?: string) => {
    if (p === 'cash') return '💵 نقداً';
    if (p === 'bank') return '🏦 بنك / صراف';
    if (p === 'credit') return '📝 آجل';
    return p || '-';
  };

  const handleCancelOrder = async (order: Order) => {
    const confirm = window.confirm(
      `هل أنت متأكد من رغبتك في إلغاء الطلب [${order.orderNumber}]؟\n\nسيقوم النظام تلقائياً بتنفيذ قيد محاسبي عكسي لإلغاء الإيراد وإرجاع الرصيد.`
    );
    if (!confirm) return;

    try {
      const res = await cancelOrder(order.id);
      if (res.success) {
        toast.success(res.message || 'تم إلغاء الطلب وعكس القيد المحاسبي بنجاح');
        if (selectedOrderForDetails?.id === order.id) {
          setSelectedOrderForDetails(null);
        }
        refetch();
      } else {
        toast.error(res.message || 'فشل في إلغاء الطلب');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل في إلغاء الطلب');
    }
  };

  const orderList = Array.isArray(orders?.data) ? orders.data : [];

  const handleExportCSV = () => {
    if (!orderList.length) {
      toast.error('لا توجد بيانات لتصديرها');
      return;
    }
    const headers = [
      'رقم الطلب', 'المرسل', 'هاتف المرسل', 'المستلم', 'هاتف المستلم',
      'عنوان المستلم', 'الوجهة', 'الوزن الفعلي (كجم)', 'الوزن المفوتر (كجم)',
      'المبلغ (ر.س)', 'طريقة الدفع', 'الحالة', 'الناقل', 'بوليصة المورد', 'التاريخ'
    ];
    const rows = orderList.map((o: any) => [
      o.orderNumber,
      o.senderName,
      o.senderPhone,
      o.receiverName,
      o.receiverPhone,
      o.receiverAddress || '',
      o.zoneName || `منطقة ${o.zoneId}`,
      Number(o.actualWeight || 0).toFixed(2),
      Number(o.chargeableWeight || o.actualWeight || 0).toFixed(2),
      Number(o.amount || o.totalSalesAmount || 0).toFixed(2),
      o.paymentType,
      o.status === 'initial' ? 'أولي معلق' : o.status === 'cancelled' ? 'ملغي' : 'مرحل نهائي',
      o.carrierName || '',
      o.waybillNumber || o.supplierWaybillNumber || '',
      o.createdAt ? new Date(o.createdAt).toLocaleDateString('ar-SA') : ''
    ]);

    const sanitizeCSVField = (val: unknown): string => {
      let str = String(val ?? '');
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    const csvContent = '\uFEFF' + [
      headers.map(sanitizeCSVField).join(','),
      ...rows.map(r => r.map(sanitizeCSVField).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `shipping_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('تم تصدير ملف إكسل (CSV) بنجاح');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t('orders.title')}</h1>
            <p className="text-sm text-gray-500 mt-1">استعراض كافة الشحنات، إدارة الطلبات، الطباعة والإلغاء وتصدير البيانات</p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
            <input 
              type="text" 
              placeholder="بحث برقم الطلب، البوليصة، المرسل..." 
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none flex-1 sm:w-64 text-sm"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {statuses.map(s => (
                <button
                  key={s.value}
                  onClick={() => {
                    setStatus(s.value);
                    setPage(1);
                  }}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${status === s.value ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors"
              title="تصدير الشحنات إلى ملف إكسل"
            >
              <Download className="w-4 h-4" />
              <span>تصدير Excel</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">رقم الطلب</th>
                <th className="px-6 py-3">المرسل</th>
                <th className="px-6 py-3">المستلم</th>
                <th className="px-6 py-3">الوجهة</th>
                <th className="px-6 py-3">الوزن المفوتر</th>
                <th className="px-6 py-3">المبيعات</th>
                <th className="px-6 py-3">الدفع</th>
                <th className="px-6 py-3">الحالة</th>
                <th className="px-6 py-3">بوليصة المورد</th>
                <th className="px-6 py-3">التاريخ</th>
                <th className="px-6 py-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={11} className="px-6 py-8 text-center text-gray-500">جاري تحميل البيانات...</td></tr>
              ) : orderList.length ? (
                orderList.map((order: any) => (
                  <tr key={order.id} className="bg-white border-b hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-blue-600 font-mono">{order.orderNumber}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{order.senderName}</td>
                    <td className="px-6 py-4 text-gray-600">{order.receiverName}</td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{order.zoneName || `منطقة ${order.zoneId}`}</td>
                    <td className="px-6 py-4 font-mono font-semibold">{Number(order.chargeableWeight || order.actualWeight || 0).toFixed(2)} كجم</td>
                    <td className="px-6 py-4 font-bold text-slate-900 font-mono">
                      {Number(order.amount || order.totalSalesAmount || 0).toFixed(2)} ر.س
                    </td>
                    <td className="px-6 py-4">{renderPayment(order.paymentType)}</td>
                    <td className="px-6 py-4">{renderStatus(order.status)}</td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">
                      {order.waybillNumber || order.supplierWaybillNumber || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-mono">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-SA') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedOrderForDetails(order)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="عرض التفاصيل الكاملة"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedOrderForPrint(order)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="طباعة إيصال / بوليصة الشحن"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {order.status === 'initial' && (
                          <button
                            onClick={() => handleCancelOrder(order)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="إلغاء الطلب وعكس القيد المحاسبي"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="px-6 py-8 text-center text-gray-400">لا توجد طلبات مطابقة</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {orders && (orders.totalPages ?? 1) > 1 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <span className="text-xs text-slate-500">
              الصفحة {orders.page || page} من {orders.totalPages} (إجمالي {orders.total ?? orders.count} شحنة)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                السابق
              </button>
              <span className="text-xs font-bold text-slate-700 px-2">{page}</span>
              <button
                disabled={page >= (orders.totalPages || 1)}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {isError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <span>تعذر تحميل قائمة الشحنات، يرجى المحاولة مرة أخرى.</span>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>إعادة المحاولة</span>
          </button>
        </div>
      )}

      {/* ================= MODAL: ORDER DETAILS ================= */}
      {selectedOrderForDetails && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 my-8">
            <div className="px-6 py-4 bg-slate-50 border-b flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-lg text-slate-900">
                  تفاصيل الشحنة #{selectedOrderForDetails.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderForDetails(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Header Status & Price */}
              <div className="flex flex-wrap justify-between items-center p-4 bg-blue-50/60 rounded-xl border border-blue-100">
                <div>
                  <span className="text-xs text-blue-800 block mb-1">حالة الشحنة</span>
                  {renderStatus(selectedOrderForDetails.status)}
                </div>
                <div className="text-left rtl:text-right">
                  <span className="text-xs text-blue-800 block mb-1">المبلغ الإجمالي</span>
                  <span className="text-2xl font-bold font-mono text-blue-950">
                    {Number(selectedOrderForDetails.amount || selectedOrderForDetails.totalSalesAmount || 0).toFixed(2)} ر.س
                  </span>
                  <span className="text-xs text-blue-700 block mt-0.5">
                    طريقة الدفع: {renderPayment(selectedOrderForDetails.paymentType)}
                  </span>
                </div>
              </div>

              {/* Sender & Receiver Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <h4 className="font-bold text-sm text-slate-900 border-b pb-1">بيانات المرسل</h4>
                  <p className="text-sm"><span className="text-slate-500">الاسم:</span> {selectedOrderForDetails.senderName}</p>
                  <p className="text-sm font-mono" dir="ltr"><span className="text-slate-500 font-sans">الهاتف:</span> {selectedOrderForDetails.senderPhone}</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <h4 className="font-bold text-sm text-slate-900 border-b pb-1">بيانات المستلم</h4>
                  <p className="text-sm"><span className="text-slate-500">الاسم:</span> {selectedOrderForDetails.receiverName}</p>
                  <p className="text-sm font-mono" dir="ltr"><span className="text-slate-500 font-sans">الهاتف:</span> {selectedOrderForDetails.receiverPhone}</p>
                  <p className="text-sm text-slate-700"><span className="text-slate-500">العنوان:</span> {selectedOrderForDetails.receiverAddress}</p>
                  <p className="text-sm font-bold text-blue-700"><span className="text-slate-500 font-normal">الوجهة:</span> {selectedOrderForDetails.zoneName || `منطقة ${selectedOrderForDetails.zoneId}`}</p>
                </div>
              </div>

              {/* Weights and Dimensions */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <h4 className="font-bold text-sm text-slate-900 mb-3">تفاصيل الطرد والأوزان</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-slate-50 p-2.5 rounded-lg border">
                    <span className="text-xs text-slate-500 block">الوزن الفعلي</span>
                    <span className="font-bold font-mono text-sm">{Number(selectedOrderForDetails.actualWeight).toFixed(2)} كجم</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border">
                    <span className="text-xs text-slate-500 block">الأبعاد (سم)</span>
                    <span className="font-bold font-mono text-sm">
                      {selectedOrderForDetails.length || selectedOrderForDetails.lengthCm || 0} × {selectedOrderForDetails.width || selectedOrderForDetails.widthCm || 0} × {selectedOrderForDetails.height || selectedOrderForDetails.heightCm || 0}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border">
                    <span className="text-xs text-slate-500 block">الوزن الحجمي</span>
                    <span className="font-bold font-mono text-sm">
                      {Number(selectedOrderForDetails.volumetricWeight || 0).toFixed(2)} كجم
                    </span>
                  </div>
                  <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200">
                    <span className="text-xs text-blue-800 block">الوزن المفوتر</span>
                    <span className="font-bold font-mono text-sm text-blue-950">
                      {Number(selectedOrderForDetails.chargeableWeight || selectedOrderForDetails.actualWeight).toFixed(2)} كجم
                    </span>
                  </div>
                </div>
              </div>

              {/* Dispatch Information (If Dispatched) */}
              {(selectedOrderForDetails.carrierName || selectedOrderForDetails.supplierWaybillNumber) && (
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                  <h4 className="font-bold text-sm text-emerald-950">بيانات الترحيل للناقل النهائي</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <p><span className="text-slate-600">شركة الشحن:</span> <strong>{selectedOrderForDetails.carrierName}</strong></p>
                    <p><span className="text-slate-600">رقم البوليصة:</span> <strong className="font-mono">{selectedOrderForDetails.supplierWaybillNumber || selectedOrderForDetails.waybillNumber}</strong></p>
                    {selectedOrderForDetails.carrierCost !== undefined && (
                      <p><span className="text-slate-600">تكلفة الناقل:</span> <strong className="font-mono">{Number(selectedOrderForDetails.carrierCost).toFixed(2)} ر.س</strong></p>
                    )}
                    {selectedOrderForDetails.grossProfit !== undefined && (
                      <p><span className="text-slate-600">صافي ربح الشحنة:</span> <strong className="font-mono text-emerald-700">+{Number(selectedOrderForDetails.grossProfit).toFixed(2)} ر.س</strong></p>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedOrderForDetails.notes && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <span className="font-bold">ملاحظات: </span>
                  {selectedOrderForDetails.notes}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t flex justify-between items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedOrderForPrint(selectedOrderForDetails);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm shadow-sm transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة البوليصة / الإيصال</span>
                </button>
                {selectedOrderForDetails.status === 'initial' && (
                  <button
                    onClick={() => handleCancelOrder(selectedOrderForDetails)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-semibold rounded-lg text-sm transition-colors"
                  >
                    <Ban className="w-4 h-4" />
                    <span>إلغاء الطلب</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelectedOrderForDetails(null)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-100 font-medium"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PRINT TEMPLATE MODAL ================= */}
      {selectedOrderForPrint && (
        <WaybillPrintTemplate
          order={selectedOrderForPrint}
          onClose={() => setSelectedOrderForPrint(null)}
        />
      )}
    </div>
  );
};
