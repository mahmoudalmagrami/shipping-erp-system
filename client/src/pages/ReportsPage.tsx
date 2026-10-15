import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  getTrialBalance, 
  getIncomeStatement, 
  getBalanceSheet 
} from '../api/endpoints';
import { 
  FileSpreadsheet, 
  Printer, 
  Scale, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  PieChart,
  DollarSign
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trial-balance' | 'income-statement' | 'balance-sheet'>('trial-balance');

  const { data: tbResponse, isLoading: tbLoading, refetch: refetchTb } = useQuery({
    queryKey: ['trialBalance'],
    queryFn: () => getTrialBalance(),
    enabled: activeTab === 'trial-balance',
  });

  const { data: isResponse, isLoading: isIncomeLoading, refetch: refetchIs } = useQuery({
    queryKey: ['incomeStatement'],
    queryFn: () => getIncomeStatement(),
    enabled: activeTab === 'income-statement',
  });

  const { data: bsResponse, isLoading: bsLoading, refetch: refetchBs } = useQuery({
    queryKey: ['balanceSheet'],
    queryFn: () => getBalanceSheet(),
    enabled: activeTab === 'balance-sheet',
  });

  const handlePrint = () => {
    window.print();
  };

  const tbData = tbResponse?.data;
  const isData = isResponse?.data;
  const bsData = bsResponse?.data;

  const formatMoney = (val: number | string | undefined) => {
    const num = Number(val || 0);
    return new Intl.NumberFormat('ar-YE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num) + ' ر.ي';
  };

  return (
    <div className="space-y-6">
      {/* Header - Hidden on Print */}
      <div className="print:hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">التقارير المالية والقوائم الختامية</h1>
            <p className="text-xs text-slate-500">ميزان المراجعة، قائمة الدخل، والميزانية العمومية المدققة آلياً</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (activeTab === 'trial-balance') refetchTb();
              if (activeTab === 'income-statement') refetchIs();
              if (activeTab === 'balance-sheet') refetchBs();
            }}
            className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            title="تحديث البيانات"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation - Hidden on Print */}
      <div className="print:hidden flex border-b border-slate-200 bg-white rounded-xl px-3 pt-2">
        <button
          onClick={() => setActiveTab('trial-balance')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'trial-balance'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>ميزان المراجعة</span>
        </button>
        <button
          onClick={() => setActiveTab('income-statement')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'income-statement'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>قائمة الدخل (الأرباح والخسائر)</span>
        </button>
        <button
          onClick={() => setActiveTab('balance-sheet')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'balance-sheet'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>الميزانية العمومية</span>
        </button>
      </div>

      {/* Print-Only Header */}
      <div className="hidden print:block text-center border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">نظام الشحن والخدمات اللوجستية</h1>
        <h2 className="text-lg font-semibold text-slate-700 mt-1">
          {activeTab === 'trial-balance' && 'ميزان المراجعة بالأرصدة'}
          {activeTab === 'income-statement' && 'قائمة الدخل الشاملة (الأرباح والخسائر)'}
          {activeTab === 'balance-sheet' && 'الميزانية العمومية'}
        </h2>
        <div className="text-xs text-slate-500 mt-2">
          تاريخ الاستخراج: {new Date().toLocaleDateString('ar-EG')} - {new Date().toLocaleTimeString('ar-EG')}
        </div>
      </div>

      {/* 1. Trial Balance Tab */}
      {activeTab === 'trial-balance' && (
        <div className="space-y-6">
          {tbLoading ? (
            <div className="p-16 text-center text-slate-500 flex flex-col items-center gap-3 bg-white rounded-2xl border border-slate-200">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
              <span>جاري إعداد ميزان المراجعة...</span>
            </div>
          ) : tbData ? (
            <>
              {/* Summary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 block mb-1">إجمالي الحركات المدينة</span>
                  <span className="text-xl font-bold text-slate-900">{formatMoney(tbData.totalDebit)}</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 block mb-1">إجمالي الحركات الدائنة</span>
                  <span className="text-xl font-bold text-slate-900">{formatMoney(tbData.totalCredit)}</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block mb-1">حالة التوازن المحاسبي</span>
                    <span className={`text-sm font-bold ${tbData.isBalanced ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tbData.isBalanced ? 'متوازن ومطابق 100%' : 'يوجد فرق في التوازن!'}
                    </span>
                  </div>
                  {tbData.isBalanced ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-rose-500" />
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-slate-50 text-slate-500 text-xs font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">رقم الحساب</th>
                        <th className="py-3 px-4">اسم الحساب</th>
                        <th className="py-3 px-4">النوع</th>
                        <th className="py-3 px-4 text-left">الرصيد المدين</th>
                        <th className="py-3 px-4 text-left">الرصيد الدائن</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tbData.items?.map((item: any) => (
                        <tr key={item.accountCode} className="hover:bg-slate-50/60">
                          <td className="py-3 px-4 font-mono text-xs font-bold text-slate-700">{item.accountCode}</td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {item.accountNameAr}
                            {item.accountNameEn && <span className="block text-[11px] text-slate-400 font-normal">{item.accountNameEn}</span>}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                              {item.accountType}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-slate-900 text-left">
                            {item.debit > 0 ? formatMoney(item.debit) : '—'}
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-slate-900 text-left">
                            {item.credit > 0 ? formatMoney(item.credit) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-200 text-slate-900">
                      <tr>
                        <td colSpan={3} className="py-4 px-4 text-right">الإجمالي الكلي لميزان المراجعة</td>
                        <td className="py-4 px-4 font-mono text-emerald-700 text-left">{formatMoney(tbData.totalDebit)}</td>
                        <td className="py-4 px-4 font-mono text-emerald-700 text-left">{formatMoney(tbData.totalCredit)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* 2. Income Statement Tab */}
      {activeTab === 'income-statement' && (
        <div className="space-y-6">
          {isIncomeLoading ? (
            <div className="p-16 text-center text-slate-500 flex flex-col items-center gap-3 bg-white rounded-2xl border border-slate-200">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
              <span>جاري إعداد قائمة الدخل والأرباح والخسائر...</span>
            </div>
          ) : isData ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500">إجمالي الإيرادات</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-xl font-bold text-emerald-600">{formatMoney(isData.totalRevenues)}</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500">إجمالي المصروفات والتكاليف</span>
                    <TrendingDown className="w-4 h-4 text-rose-600" />
                  </div>
                  <span className="text-xl font-bold text-rose-600">{formatMoney(isData.totalExpenses)}</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500">صافي الدخل (الربح / الخسارة)</span>
                    <DollarSign className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className={`text-xl font-bold ${isData.netIncome >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {formatMoney(isData.netIncome)}
                  </span>
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Revenues */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="bg-emerald-50/70 p-4 border-b border-emerald-100 flex items-center justify-between">
                    <h3 className="font-bold text-emerald-900 text-sm">الإيرادات التشغيلية</h3>
                    <span className="font-mono font-bold text-emerald-700 text-sm">{formatMoney(isData.totalRevenues)}</span>
                  </div>
                  <div className="p-4 divide-y divide-slate-100">
                    {isData.revenues?.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center">لا توجد إيرادات مسجلة</p>
                    ) : (
                      isData.revenues?.map((item: any) => (
                        <div key={item.accountCode} className="py-3 flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-slate-800 text-sm block">{item.accountName}</span>
                            <span className="font-mono text-xs text-slate-400">{item.accountCode}</span>
                          </div>
                          <span className="font-mono font-bold text-emerald-600 text-sm">{formatMoney(item.amount)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Expenses */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="bg-rose-50/70 p-4 border-b border-rose-100 flex items-center justify-between">
                    <h3 className="font-bold text-rose-900 text-sm">المصروفات وتكلفة الشحن</h3>
                    <span className="font-mono font-bold text-rose-700 text-sm">{formatMoney(isData.totalExpenses)}</span>
                  </div>
                  <div className="p-4 divide-y divide-slate-100">
                    {isData.expenses?.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center">لا توجد مصروفات مسجلة</p>
                    ) : (
                      isData.expenses?.map((item: any) => (
                        <div key={item.accountCode} className="py-3 flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-slate-800 text-sm block">{item.accountName}</span>
                            <span className="font-mono text-xs text-slate-400">{item.accountCode}</span>
                          </div>
                          <span className="font-mono font-bold text-rose-600 text-sm">{formatMoney(item.amount)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* 3. Balance Sheet Tab */}
      {activeTab === 'balance-sheet' && (
        <div className="space-y-6">
          {bsLoading ? (
            <div className="p-16 text-center text-slate-500 flex flex-col items-center gap-3 bg-white rounded-2xl border border-slate-200">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
              <span>جاري إعداد الميزانية العمومية...</span>
            </div>
          ) : bsData ? (
            <>
              {/* Balance Verification Banner */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                bsData.isBalanced 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-center gap-3">
                  {bsData.isBalanced ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm">
                      معادلة الميزانية: الأصول ({formatMoney(bsData.totalAssets)}) = الخصوم ({formatMoney(bsData.totalLiabilities)}) + حقوق الملكية ({formatMoney(bsData.totalEquity)})
                    </h4>
                    <p className="text-xs opacity-80 mt-0.5">
                      {bsData.isBalanced ? 'الميزانية العمومية متوازنة تماماً وفق المعايير المحاسبية المعتمدة.' : 'تنبيه: يوجد فارق غير مسوى بين إجمالي الأصول وإجمالي الخصوم وحقوق الملكية.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Assets */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="bg-blue-50/70 p-4 border-b border-blue-100 flex items-center justify-between">
                    <h3 className="font-bold text-blue-900 text-sm">الأصول (Assets)</h3>
                    <span className="font-mono font-bold text-blue-700 text-sm">{formatMoney(bsData.totalAssets)}</span>
                  </div>
                  <div className="p-4 divide-y divide-slate-100">
                    {bsData.assets?.map((item: any) => (
                      <div key={item.accountCode} className="py-2.5 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-800 text-xs block">{item.accountName}</span>
                          <span className="font-mono text-[10px] text-slate-400">{item.accountCode}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-800 text-xs">{formatMoney(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Liabilities */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="bg-amber-50/70 p-4 border-b border-amber-100 flex items-center justify-between">
                    <h3 className="font-bold text-amber-900 text-sm">الخصوم (Liabilities)</h3>
                    <span className="font-mono font-bold text-amber-700 text-sm">{formatMoney(bsData.totalLiabilities)}</span>
                  </div>
                  <div className="p-4 divide-y divide-slate-100">
                    {bsData.liabilities?.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center">لا توجد خصوم مسجلة</p>
                    ) : (
                      bsData.liabilities?.map((item: any) => (
                        <div key={item.accountCode} className="py-2.5 flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-slate-800 text-xs block">{item.accountName}</span>
                            <span className="font-mono text-[10px] text-slate-400">{item.accountCode}</span>
                          </div>
                          <span className="font-mono font-bold text-slate-800 text-xs">{formatMoney(item.amount)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Equity */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="bg-purple-50/70 p-4 border-b border-purple-100 flex items-center justify-between">
                    <h3 className="font-bold text-purple-900 text-sm">حقوق الملكية (Equity)</h3>
                    <span className="font-mono font-bold text-purple-700 text-sm">{formatMoney(bsData.totalEquity)}</span>
                  </div>
                  <div className="p-4 divide-y divide-slate-100">
                    {bsData.equity?.map((item: any) => (
                      <div key={item.accountCode} className="py-2.5 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-800 text-xs block">{item.accountName}</span>
                          <span className="font-mono text-[10px] text-slate-400">{item.accountCode}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-800 text-xs">{formatMoney(item.amount)}</span>
                      </div>
                    ))}
                    <div className="py-2.5 flex items-center justify-between bg-purple-50/40 px-2 rounded-lg mt-1">
                      <div>
                        <span className="font-bold text-purple-900 text-xs block">أرباح / (خسائر) الفترة الحالية</span>
                        <span className="text-[10px] text-purple-600">من قائمة الدخل</span>
                      </div>
                      <span className="font-mono font-bold text-purple-800 text-xs">{formatMoney(bsData.netIncome)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};
