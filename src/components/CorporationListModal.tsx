import React, { useMemo } from 'react';
import { X, Building2, ChevronRight } from 'lucide-react';
import { SECTransaction, CorporationSummary } from '../types';
import { formatPeso, getRecordBalance, getRecordTotalPaid, getRecordTotalExpenses } from '../utils/formatters';

interface CorporationListModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: SECTransaction[];
  filterType: 'all' | 'active';
  onSelectCorporation: (corporationName: string) => void;
}

export const CorporationListModal: React.FC<CorporationListModalProps> = ({
  isOpen,
  onClose,
  records,
  filterType,
  onSelectCorporation
}) => {
  const corporationSummaries = useMemo<CorporationSummary[]>(() => {
    const map = new Map<string, SECTransaction[]>();

    records.forEach(r => {
      const name = (r.corporationName || 'Unnamed Corporation').trim();
      const existing = map.get(name) || [];
      existing.push(r);
      map.set(name, existing);
    });

    const summaries: CorporationSummary[] = [];

    map.forEach((corpRecords, name) => {
      const totalFilings = corpRecords.length;
      const completedFilings = corpRecords.filter(
        r => (r.status || '').trim().toLowerCase() === 'completed'
      ).length;
      const activeFilings = totalFilings - completedFilings;

      // Filter by active if filterType === 'active'
      if (filterType === 'active' && activeFilings === 0) {
        return;
      }

      const totalFees = corpRecords.reduce((sum, r) => sum + (Number(r.totalFee) || 0), 0);
      const totalPaid = corpRecords.reduce((sum, r) => sum + getRecordTotalPaid(r), 0);
      const balance = corpRecords.reduce((sum, r) => sum + getRecordBalance(r), 0);
      const totalExpenses = corpRecords.reduce((sum, r) => sum + getRecordTotalExpenses(r), 0);
      const netProfit = totalFees - totalExpenses;

      summaries.push({
        name,
        totalFilings,
        activeFilings,
        completedFilings,
        totalFees,
        totalPaid,
        balance,
        totalExpenses,
        netProfit
      });
    });

    // Sort by name alphabetically
    return summaries.sort((a, b) => a.name.localeCompare(b.name));
  }, [records, filterType]);

  const grandTotals = useMemo(() => {
    return corporationSummaries.reduce(
      (acc, corp) => ({
        filings: acc.filings + corp.totalFilings,
        active: acc.active + corp.activeFilings,
        totalFees: acc.totalFees + corp.totalFees,
        totalPaid: acc.totalPaid + corp.totalPaid,
        balance: acc.balance + corp.balance,
        totalExpenses: acc.totalExpenses + corp.totalExpenses,
        netProfit: acc.netProfit + corp.netProfit
      }),
      { filings: 0, active: 0, totalFees: 0, totalPaid: 0, balance: 0, totalExpenses: 0, netProfit: 0 }
    );
  }, [corporationSummaries]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {filterType === 'active' ? 'Active Corporations Directory' : 'All Tracked Corporations'}
              </h2>
              <p className="text-xs text-slate-400">
                {corporationSummaries.length} corporate entities · Total Collected Fees: <strong className="text-teal-400 font-mono">{formatPeso(grandTotals.totalPaid)}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Table */}
        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto">
          {corporationSummaries.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Building2 className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-medium">No corporations found matching this filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <table className="w-full text-left text-xs border-separate border-spacing-y-2.5">
                <thead>
                  <tr className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="pb-1.5 px-4">Corporation Name</th>
                    <th className="pb-1.5 px-3 text-center">Filings</th>
                    <th className="pb-1.5 px-3 text-center">Active</th>
                    <th className="pb-1.5 px-4 text-right">Total Fees</th>
                    <th className="pb-1.5 px-4 text-right">Collected Fees</th>
                    <th className="pb-1.5 px-4 text-right">Balance Due</th>
                    <th className="pb-1.5 px-4 text-right">Expenses</th>
                    <th className="pb-1.5 px-4 text-right">Net Profit</th>
                    <th className="pb-1.5 px-3 text-center">Filter</th>
                  </tr>
                </thead>
                <tbody className="text-slate-200">
                  {corporationSummaries.map((corp) => (
                    <tr 
                      key={corp.name} 
                      className="bg-slate-900 hover:bg-slate-800/80 transition-colors cursor-pointer group shadow-xs"
                      onClick={() => {
                        onSelectCorporation(corp.name);
                        onClose();
                      }}
                    >
                      <td className="py-3.5 px-4 font-semibold text-white rounded-l-xl border-y border-l border-slate-800">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors shrink-0" />
                          <span className="group-hover:text-blue-300 transition-colors">{corp.name}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center font-mono tabular-nums border-y border-slate-800">
                        {corp.totalFilings}
                      </td>

                      <td className="py-3.5 px-3 text-center font-mono tabular-nums border-y border-slate-800">
                        {corp.activeFilings > 0 ? (
                          <span className="text-amber-400 font-semibold">{corp.activeFilings}</span>
                        ) : (
                          <span className="text-slate-500">0</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono tabular-nums border-y border-slate-800">
                        {formatPeso(corp.totalFees)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-teal-400 font-semibold border-y border-slate-800">
                        {formatPeso(corp.totalPaid)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold border-y border-slate-800">
                        {corp.balance > 0 ? (
                          <span className="text-rose-400">{formatPeso(corp.balance)}</span>
                        ) : (
                          <span className="text-emerald-400">₱0.00</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-orange-400 border-y border-slate-800">
                        {formatPeso(corp.totalExpenses)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold border-y border-slate-800">
                        <span className={corp.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {formatPeso(corp.netProfit)}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center rounded-r-xl border-y border-r border-slate-800">
                        <button
                          type="button"
                          className="px-2.5 py-1 text-[11px] font-medium text-blue-400 bg-blue-950/70 border border-blue-800 rounded-md hover:bg-blue-900 transition-colors inline-flex items-center gap-0.5"
                        >
                          View <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-950 font-bold text-white">
                    <td className="py-3.5 px-4 rounded-l-xl border-y border-l border-slate-700 text-slate-300 uppercase text-[11px] tracking-wider">
                      Grand Total
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono tabular-nums border-y border-slate-700">
                      {grandTotals.filings}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono tabular-nums text-amber-400 border-y border-slate-700">
                      {grandTotals.active}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-blue-400 border-y border-slate-700">
                      {formatPeso(grandTotals.totalFees)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-teal-400 border-y border-slate-700">
                      {formatPeso(grandTotals.totalPaid)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-rose-400 border-y border-slate-700">
                      {formatPeso(grandTotals.balance)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-orange-400 border-y border-slate-700">
                      {formatPeso(grandTotals.totalExpenses)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-emerald-400 border-y border-slate-700">
                      {formatPeso(grandTotals.netProfit)}
                    </td>
                    <td className="py-3.5 px-3 rounded-r-xl border-y border-r border-slate-700"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-800 bg-slate-950/70">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
