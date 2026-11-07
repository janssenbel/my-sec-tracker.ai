import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2, 
  Check, 
  Calendar, 
  Receipt,
  FileCheck2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { SECTransaction, TransactionStatus } from '../types';
import { 
  formatPeso, 
  formatDate, 
  getRecordBalance, 
  getRecordTotalExpenses, 
  getRecordNetProfit 
} from '../utils/formatters';

interface TransactionTableProps {
  records: SECTransaction[];
  onViewRecord: (record: SECTransaction) => void;
  onEditRecord: (record: SECTransaction) => void;
  onDeleteRecord: (id: string) => void;
  onQuickSettle: (id: string) => void;
  preselectedFilter?: string;
  onClearPreselectedFilter?: () => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  records,
  onViewRecord,
  onEditRecord,
  onDeleteRecord,
  onQuickSettle,
  preselectedFilter,
  onClearPreselectedFilter
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');

  // Filter records based on tab, search query, and preselectedFilter (e.g. corporation name from corporations modal)
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      // 1. Corporation filter from modal if active
      if (preselectedFilter && (r.corporationName || '').toLowerCase() !== preselectedFilter.toLowerCase()) {
        return false;
      }

      // 2. Tab filter
      if (activeTab === 'active') {
        const isActive = r.status === 'In Progress' || r.status === 'Pending' || r.status === 'Under Review' || r.status === 'For Release';
        if (!isActive) return false;
      } else if (activeTab === 'completed') {
        if (r.status !== 'Completed') return false;
      }

      // 3. Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = r.corporationName.toLowerCase().includes(q);
        const matchesType = r.filingType.toLowerCase().includes(q);
        const matchesTracking = r.trackingNumber.toLowerCase().includes(q);
        const matchesNotes = (r.notes || '').toLowerCase().includes(q);
        if (!matchesName && !matchesType && !matchesTracking && !matchesNotes) {
          return false;
        }
      }

      return true;
    });
  }, [records, activeTab, searchQuery, preselectedFilter]);

  // Tab counts
  const allCount = records.length;
  const activeCount = records.filter(
    r => r.status === 'In Progress' || r.status === 'Pending' || r.status === 'Under Review' || r.status === 'For Release'
  ).length;
  const completedCount = records.filter(r => r.status === 'Completed').length;

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
            <Check className="w-3 h-3" /> Completed
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-amber-950/80 text-amber-400 border border-amber-800/60">
            In Progress
          </span>
        );
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-blue-950/80 text-blue-400 border border-blue-800/60">
            Under Review
          </span>
        );
      case 'For Release':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-purple-950/80 text-purple-400 border border-purple-800/60">
            For Release
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl bg-slate-900/90 dark:bg-slate-900/90 border border-slate-800 overflow-hidden shadow-sm">
      
      {/* Header Bar with Search & Filter Tabs */}
      <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-lg border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Filings ({allCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
              activeTab === 'active'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            In Progress ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
              activeTab === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Preselected Corporation Notice */}
        {preselectedFilter && (
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-950/60 border border-blue-800/80 rounded-lg text-xs text-blue-300">
            <span>Filtered by: <strong>{preselectedFilter}</strong></span>
            {onClearPreselectedFilter && (
              <button
                type="button"
                onClick={onClearPreselectedFilter}
                className="text-blue-400 hover:text-white underline text-[11px] ml-1"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search corporation, filing, or tracking..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ×
            </button>
          )}
        </div>

      </div>

      {/* Desktop / Tablet Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Corporation / Entity</th>
              <th className="py-3 px-4">Filing Type & Tracking</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Target Date</th>
              <th className="py-3 px-4 text-right">Fee / Balance</th>
              <th className="py-3 px-4 text-right">Expenses</th>
              <th className="py-3 px-4 text-right">Net Profit</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileCheck2 className="w-8 h-8 text-slate-600" />
                    <p className="text-sm font-medium">No SEC filings match the filter criteria.</p>
                    <p className="text-xs text-slate-400">Try adjusting your search query or add a new transaction.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRecords.map((r) => {
                const balance = getRecordBalance(r);
                const totalExpenses = getRecordTotalExpenses(r);
                const netProfit = getRecordNetProfit(r);

                return (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors group">
                    
                    {/* Corporation Name */}
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div className="flex flex-col">
                        <span>{r.corporationName}</span>
                        {r.notes && (
                          <span className="text-[11px] font-normal text-slate-400 line-clamp-1 mt-0.5">
                            {r.notes}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Filing Type & Tracking Number */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-slate-200">{r.filingType}</span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {r.trackingNumber}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(r.status)}
                    </td>

                    {/* Target Date */}
                    <td className="py-3.5 px-4 font-mono tabular-nums text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(r.targetDate)}</span>
                      </div>
                    </td>

                    {/* Fee & Balance */}
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                      <div className="text-white font-medium">{formatPeso(r.totalFee)}</div>
                      {balance > 0 ? (
                        <div className="text-[11px] text-rose-400 font-semibold">
                          Bal: {formatPeso(balance)}
                        </div>
                      ) : (
                        <div className="text-[11px] text-emerald-400">
                          Paid in Full
                        </div>
                      )}
                    </td>

                    {/* Expenses */}
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                      <div className="text-orange-400 font-medium">
                        {formatPeso(totalExpenses)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {r.expenses?.length || 0} item{(r.expenses?.length || 0) === 1 ? '' : 's'}
                      </div>
                    </td>

                    {/* Net Profit */}
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold">
                      <span className={netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {formatPeso(netProfit)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center justify-center gap-1.5">
                        
                        {/* Quick Settle Balance Button */}
                        {balance > 0 && (
                          <button
                            type="button"
                            onClick={() => onQuickSettle(r.id)}
                            className="p-1.5 rounded-md text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/60 border border-emerald-900/60 transition-colors"
                            title="Quick Settle Remaining Balance"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => onViewRecord(r)}
                          className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                          title="View Record & Print Slip"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Record */}
                        <button
                          type="button"
                          onClick={() => onEditRecord(r)}
                          className="p-1.5 rounded-md text-blue-400 hover:text-blue-300 hover:bg-blue-950/60 transition-colors"
                          title="Edit Transaction"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Record */}
                        <button
                          type="button"
                          onClick={() => onDeleteRecord(r.id)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile / Tablet Responsive Cards */}
      <div className="lg:hidden divide-y divide-slate-800">
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <FileCheck2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm">No SEC filings match the filter.</p>
          </div>
        ) : (
          filteredRecords.map((r) => {
            const balance = getRecordBalance(r);
            const totalExpenses = getRecordTotalExpenses(r);
            const netProfit = getRecordNetProfit(r);

            return (
              <div key={r.id} className="p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{r.corporationName}</h3>
                    <p className="text-xs text-slate-300 font-medium">{r.filingType}</p>
                    <p className="text-[11px] font-mono text-slate-400">{r.trackingNumber}</p>
                  </div>
                  <div>{getStatusBadge(r.status)}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-1 border-y border-slate-800/60">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Fee</span>
                    <span className="font-mono tabular-nums text-white font-medium">{formatPeso(r.totalFee)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Balance</span>
                    <span className={`font-mono tabular-nums font-semibold ${balance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {balance > 0 ? formatPeso(balance) : 'Paid in Full'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Expenses ({r.expenses?.length || 0})</span>
                    <span className="font-mono tabular-nums text-orange-400 font-medium">{formatPeso(totalExpenses)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Net Margin</span>
                    <span className={`font-mono tabular-nums font-semibold ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatPeso(netProfit)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Target: {formatDate(r.targetDate)}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {balance > 0 && (
                      <button
                        type="button"
                        onClick={() => onQuickSettle(r.id)}
                        className="px-2 py-1 rounded text-xs text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 font-medium inline-flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Settle
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onViewRecord(r)}
                      className="p-1.5 rounded text-slate-300 hover:text-white bg-slate-800"
                      title="View"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditRecord(r)}
                      className="p-1.5 rounded text-blue-400 hover:text-blue-300 bg-slate-800"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteRecord(r.id)}
                      className="p-1.5 rounded text-rose-400 hover:text-rose-300 bg-slate-800"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
