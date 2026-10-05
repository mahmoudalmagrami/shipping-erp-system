import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getFinancialSummary } from '../api/endpoints';

export const LedgerPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: summary } = useQuery({ queryKey: ['financialSummary'], queryFn: getFinancialSummary });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">{t('ledger.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b font-semibold bg-gray-50">{t('ledger.accounts')}</div>
          <table className="w-full text-sm text-left rtl:text-right">
            <thead className="text-xs text-gray-500 uppercase bg-gray-100">
              <tr>
                <th className="px-6 py-3">Account</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {summary?.data?.accounts?.map(acc => (
                <tr key={acc.id} className="border-b">
                  <td className="px-6 py-3 font-medium">{acc.name}</td>
                  <td className="px-6 py-3 text-gray-500">{acc.type}</td>
                  <td className={`px-6 py-3 text-right font-bold ${acc.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{acc.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b font-semibold bg-gray-50">{t('ledger.recentJournals')}</div>
          <div className="p-4 space-y-4">
            {summary?.data?.recentJournals?.map(j => (
              <div key={j.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-sm">{j.description}</span>
                  <span className="text-xs text-gray-500">{new Date(j.date).toLocaleDateString()}</span>
                </div>
                <div className="text-xs bg-white rounded border">
                  {j.lines.map(l => (
                    <div key={l.id} className="flex justify-between p-2 border-b last:border-0">
                      <span>{l.accountId}</span>
                      <div className="flex gap-4">
                        <span className="text-green-600 w-16 text-right">+{l.debit}</span>
                        <span className="text-red-600 w-16 text-right">-{l.credit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
