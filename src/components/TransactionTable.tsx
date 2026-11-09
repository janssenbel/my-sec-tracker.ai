import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Eye, 
  Edit3, 
  Trash2, 
  Check, 
  Calendar, 
  FileCheck2
} from 'lucide-react';
import { SECTransaction, STANDARD_STATUSES } from '../types';
import { 
  formatPeso, 
  formatDate, 
  getRecordBalance, 
  getRecordTotalPaid,
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
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Filter records based on tab, specific status filter, search query, and preselectedFilter
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      // 1. Corporation filter from modal if active
      if (preselectedFilter && (r.corporationName || '').toLowerCase() !== preselectedFilter.toLowerCase()) {
        return false;
      }

      const statusVal = (r.status || '').trim();
      const isCompleted = statusVal.toLowerCase() === 'completed';

      // 2. Tab filter
      if (activeTab === 'active' && isCompleted) {
        return false;
      } else if (activeTab === 'completed' && !isCompleted) {
        return false;
      }

      // 3. Specific Current Status dropdown filter
      if (statusFilter !== 'All') {
        if (statusFilter === 'Others') {
          const isStandard = STANDARD_STATUSES.some(
            s => s.toLowerCase() === statusVal.toLowerCase() ||
                 s.replace(/\s*\/\s*/g, '/').toLowerCase() === statusVal.replace(/\s*\/\s*/g, '/').toLowerCase()
          );
          if (isStandard) return false;
        } else {
          const normFilter = statusFilter.replace(/\s*\/\s*/g, '/').toLowerCase();
          const normRecord = statusVal.replace(/\s*\/\s*/g, '/').toLowerCase();
          if (normFilter !== normRecord) return false;
        }
      }

      // 4. Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const isPaid = r.isFullyPaid || getRecordBalance(r) === 0;
        const paidStatusStr = isPaid ? 'fully paid paid settled' : 'unpaid balance balance due';
        const expenseSearchStr = Array.isArray(r.expenses)
          ? r.expenses.map(e => e.description).join(' ').toLowerCase()
          : '';

        const matchesName = (r.corporationName || '').toLowerCase().includes(q);
        const matchesType = (r.filingType || '').toLowerCase().includes(q);
        const matchesStatus = statusVal.toLowerCase().includes(q);
        const matchesNotes = (r.notes || '').toLowerCase().includes(q);
        const matchesPaid = paidStatusStr.includes(q);
        const matchesExpenses = expenseSearchStr.includes(q);

        if (!matchesName && !matchesType && !matchesStatus && !matchesNotes && !matchesPaid && !matchesExpenses) {
          return false;
        }
      }

      return true;
    });
  }, [records, activeTab, statusFilter, searchQuery, preselectedFilter]);

  // Tab counts
  const allCount = records.length;
  const completedCount = records.filter(r => (r.status || '').trim().toLowerCase() === 'completed').length;
  const activeCount = allCount - completedCount;

  const getStatusBadge = (status: string) => {
    const s = (status || 'Unspecified').trim();
    const lower = s.toLowerCase();

    if (lower === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
          <Check className="w-3 h-3" /> {s}
        </span>
      );
    }
    if (lower === 'for preparation of documents') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-blue-950/80 text-blue-400 border border-blue-800/60">
          {s}
        </span>
      );
    }
    if (lower === 'for signing of documents') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-indigo-950/80 text-indigo-400 border border-indigo-800/60">
          {s}
        </span>
      );
    }
    if (lower === 'for review') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-amber-950/80 text-amber-400 border border-amber-800/60">
          {s}
        </span>
      );
    }
    if (lower === 'for payment') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-orange-950/80 text-orange-400 border border-orange-800/60">
          {s}
        </span>
      );
    }
    if (lower.includes('approved') && lower.includes('hard copies')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
          {s}
        </span>
      );
    }
    if (lower.includes('submitted') || lower.includes('awaiting certificate')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-purple-950/80 text-purple-400 border border-purple-800/60">
          {s}
        </span>
      );
    }
    if (lower === 'for compliance of client') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-rose-950/80 text-rose-400 border border-rose-800/60">
          {s}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
        {s}
      </span>
    );
  };

  return (
    <div className="rounded-xl bg-slate-900/90 dark:bg-slate-900/90 border border-slate-800 overflow-hidden shadow-sm">
      
      {/* Header Bar with Search, Status Dropdown & Filter Tabs */}
      <div className="p-4 border-b border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-lg border border-slate-800 text-xs overflow-x-auto">
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

        {/* Right Side: Current Status Dropdown + Search Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          
          {/* Current Status Filter Select */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            title="Filter by Current Status"
          >
            <option value="All">All Statuses</option>
            <option value="For Preparation of Documents">For Preparation of Documents</option>
            <option value="For Signing of Documents">For Signing of Documents</option>
            <option value="For Review">For Review</option>
            <option value="For Payment">For Payment</option>
            <option value="Approved / For Submission of Hard Copies">Approved / For Submission of Hard Copies</option>
            <option value="Submitted / Awaiting Certificate">Submitted / Awaiting Certificate</option>
            <option value="Completed">Completed</option>
            <option value="For Compliance of Client">For Compliance of Client</option>
            <option value="Others">Others</option>
          </select>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search corporation, status, expenses..."
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

      </div>

      {/* Desktop / Tablet Table View */}
      <div className="hidden lg:block overflow-x-auto px-4 py-3 bg-slate-950/40">
        <table className="w-full text-left border-separate border-spacing-y-3 text-xs">
          <thead>
            <tr className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="pb-2 px-4">Corporation Name</th>
              <th className="pb-2 px-4">Type of Transaction</th>
              <th className="pb-2 px-4">Dates (Accepted &amp; DP &rarr; Started &rarr; Completed)</th>
              <th className="pb-2 px-4 text-right">Fee / Balance</th>
              <th className="pb-2 px-4 text-right">Expenses</th>
              <th className="pb-2 px-4 text-right">Net Profit</th>
              <th className="pb-2 px-4 text-center">Current Status</th>
              <th className="pb-2 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-slate-200">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500 bg-slate-900/80 rounded-xl border border-slate-800">
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
                const totalPaid = getRecordTotalPaid(r);
                const totalExpenses = getRecordTotalExpenses(r);
                const netProfit = getRecordNetProfit(r);

                return (
                  <tr key={r.id} className="bg-slate-900 hover:bg-slate-800/80 transition-colors group shadow-xs">
                    
                    {/* Corporation Name */}
                    <td className="py-4 px-4 font-semibold text-white rounded-l-xl border-y border-l border-slate-800">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm">{r.corporationName}</span>
                        {r.notes && (
                          <span className="text-[11px] font-normal text-slate-400 line-clamp-1">
                            {r.notes}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Type of Transaction */}
                    <td className="py-4 px-4 border-y border-slate-800">
                      <span className="font-medium text-slate-200">{r.filingType}</span>
                    </td>

                    {/* Chronological Dates: Accepted & DP, Started, Completed */}
                    <td className="py-4 px-4 font-mono tabular-nums text-[11px] text-slate-300 space-y-1 border-y border-slate-800">
                      <div>
                        <span className="text-slate-400 font-sans font-medium">Accepted &amp; DP: </span>
                        <span className="text-white">{formatDate(r.dateAccepted)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-sans font-medium">Started: </span>
                        <span>{formatDate(r.dateStarted)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-sans font-medium">Completed: </span>
                        <span className={r.dateCompleted ? 'text-emerald-400' : ''}>{formatDate(r.dateCompleted)}</span>
                      </div>
                    </td>

                    {/* Fee, Paid & Balance */}
                    <td className="py-4 px-4 text-right font-mono tabular-nums space-y-0.5 border-y border-slate-800">
                      <div className="text-white font-medium">{formatPeso(r.totalFee)}</div>
                      <div className="text-[11px] text-cyan-400">
                        Paid: {formatPeso(totalPaid)}
                      </div>
                      {balance > 0 ? (
                        <div className="text-[11px] text-rose-400 font-semibold">
                          Bal: {formatPeso(balance)}
                        </div>
                      ) : (
                        <div className="text-[11px] text-emerald-400 font-semibold">
                          ✔ PAID
                        </div>
                      )}
                    </td>

                    {/* Expenses */}
                    <td className="py-4 px-4 text-right font-mono tabular-nums border-y border-slate-800">
                      <div className="text-orange-400 font-medium">
                        {formatPeso(totalExpenses)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {r.expenses?.length || 0} item{(r.expenses?.length || 0) === 1 ? '' : 's'}
                      </div>
                    </td>

                    {/* Net Profit */}
                    <td className="py-4 px-4 text-right font-mono tabular-nums font-semibold border-y border-slate-800">
                      <span className={netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {formatPeso(netProfit)}
                      </span>
                    </td>

                    {/* Current Status Badge */}
                    <td className="py-4 px-4 text-center border-y border-slate-800">
                      {getStatusBadge(r.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-center rounded-r-xl border-y border-r border-slate-800">
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

      {/* Mobile / Tablet Responsive Spaced Corporation Cards */}
      <div className="lg:hidden p-3 sm:p-4 space-y-4 bg-slate-950/50">
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-slate-900 rounded-xl border border-slate-800">
            <FileCheck2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm">No SEC filings match the filter.</p>
          </div>
        ) : (
          filteredRecords.map((r) => {
            const balance = getRecordBalance(r);
            const totalPaid = getRecordTotalPaid(r);
            const totalExpenses = getRecordTotalExpenses(r);
            const netProfit = getRecordNetProfit(r);

            return (
              <div key={r.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <h3 className="text-sm sm:text-base font-bold text-white leading-snug">{r.corporationName}</h3>
                    <p className="text-xs text-blue-300 font-medium">{r.filingType}</p>
                  </div>
                  <div className="shrink-0">{getStatusBadge(r.status)}</div>
                </div>

                {/* Dates Row on Mobile */}
                <div className="grid grid-cols-3 gap-2 text-[11px] bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Accepted &amp; DP</span>
                    <span className="font-mono text-slate-200">{formatDate(r.dateAccepted)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Started</span>
                    <span className="font-mono text-slate-200">{formatDate(r.dateStarted)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Completed</span>
                    <span className={`font-mono ${r.dateCompleted ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {formatDate(r.dateCompleted)}
                    </span>
                  </div>
                </div>

                {/* Financials Grid on Mobile */}
                <div className="grid grid-cols-2 gap-2.5 text-xs py-2 border-y border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Assistance Fee / Paid</span>
                    <span className="font-mono tabular-nums text-white font-semibold">{formatPeso(r.totalFee)}</span>
                    <span className="text-[10px] font-mono text-cyan-400 block">Paid: {formatPeso(totalPaid)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Balance</span>
                    <span className={`font-mono tabular-nums font-semibold ${balance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {balance > 0 ? formatPeso(balance) : '✔ Paid in Full'}
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
                    <span>Accepted: {formatDate(r.dateAccepted)}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {balance > 0 && (
                      <button
                        type="button"
                        onClick={() => onQuickSettle(r.id)}
                        className="px-2.5 py-1.5 rounded-lg text-xs text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 font-medium inline-flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Settle
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onViewRecord(r)}
                      className="p-2 rounded-lg text-slate-300 hover:text-white bg-slate-800"
                      title="View"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditRecord(r)}
                      className="p-2 rounded-lg text-blue-400 hover:text-blue-300 bg-slate-800"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteRecord(r.id)}
                      className="p-2 rounded-lg text-rose-400 hover:text-rose-300 bg-slate-800"
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
