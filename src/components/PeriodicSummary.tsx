import React, { useState, useMemo } from 'react';
import { Calendar, DollarSign, ArrowUpRight, TrendingDown, Layers, ChevronDown } from 'lucide-react';
import { SECTransaction, SummaryPeriodType } from '../types';
import { 
  formatPeso, 
  getRecordBalance, 
  getRecordTotalPaid,
  getRecordTotalExpenses, 
  getWeekKey, 
  getMonthKey, 
  getYearKey 
} from '../utils/formatters';

interface PeriodicSummaryProps {
  records: SECTransaction[];
}

export const PeriodicSummary: React.FC<PeriodicSummaryProps> = ({ records }) => {
  const [periodType, setPeriodType] = useState<SummaryPeriodType>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');

  // Extract all unique period options for current periodType based on Date Accepted & Downpayment
  const periodOptions = useMemo(() => {
    if (periodType === 'all') return ['All Transactions'];
    const set = new Set<string>();
    records.forEach(r => {
      const date = r.dateAccepted || (typeof r.createdAt === 'string' ? r.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10));
      if (periodType === 'weekly') {
        set.add(getWeekKey(date));
      } else if (periodType === 'monthly') {
        set.add(getMonthKey(date));
      } else {
        set.add(getYearKey(date));
      }
    });

    return Array.from(set);
  }, [records, periodType]);

  // Keep selectedPeriod synced or default to the first one
  const currentPeriod = useMemo(() => {
    if (periodType === 'all') return 'All Transactions';
    if (periodOptions.length === 0) return 'None';
    if (periodOptions.includes(selectedPeriod)) return selectedPeriod;
    return periodOptions[0];
  }, [periodType, periodOptions, selectedPeriod]);

  // Filter records matching current period
  const periodRecords = useMemo(() => {
    if (periodType === 'all') return records;
    if (!currentPeriod || currentPeriod === 'None') return [];
    return records.filter(r => {
      const date = r.dateAccepted || (typeof r.createdAt === 'string' ? r.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10));
      if (periodType === 'weekly') return getWeekKey(date) === currentPeriod;
      if (periodType === 'monthly') return getMonthKey(date) === currentPeriod;
      return getYearKey(date) === currentPeriod;
    });
  }, [records, periodType, currentPeriod]);

  // Metrics for period
  const metrics = useMemo(() => {
    const totalFees = periodRecords.reduce((sum, r) => sum + (Number(r.totalFee) || 0), 0);
    const totalPaid = periodRecords.reduce((sum, r) => sum + getRecordTotalPaid(r), 0);
    const totalExpenses = periodRecords.reduce((sum, r) => sum + getRecordTotalExpenses(r), 0);
    const totalBalance = periodRecords.reduce((sum, r) => sum + getRecordBalance(r), 0);
    const netProfit = totalFees - totalExpenses;

    return {
      count: periodRecords.length,
      totalFees,
      totalPaid,
      totalExpenses,
      totalBalance,
      netProfit
    };
  }, [periodRecords]);

  return (
    <div className="rounded-xl bg-slate-900/90 dark:bg-slate-900/90 border border-slate-800 p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-white">
              Periodic Summary (Date Accepted &amp; Downpayment)
            </h2>
            <p className="text-xs text-slate-400">
              View totals by all-time summary, year, month, or week
            </p>
          </div>
        </div>

        {/* Controls: Type selector + Period dropdown */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          
          {/* Period Type Segmented Control */}
          <div className="inline-flex rounded-lg bg-slate-950/70 p-1 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setPeriodType('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                periodType === 'all' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All-Time
            </button>
            <button
              type="button"
              onClick={() => setPeriodType('yearly')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                periodType === 'yearly' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Yearly
            </button>
            <button
              type="button"
              onClick={() => setPeriodType('monthly')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                periodType === 'monthly' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setPeriodType('weekly')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                periodType === 'weekly' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Weekly
            </button>
          </div>

          {/* Period Dropdown (when not All-Time) */}
          {periodType !== 'all' && (
            <div className="relative">
              <select
                value={currentPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="appearance-none bg-slate-950/80 border border-slate-800 text-slate-200 text-xs rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer"
              >
                {periodOptions.map(p => (
                  <option key={p} value={p} className="bg-slate-900 text-white">
                    {p}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">
        
        {/* Filings in Period */}
        <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/80">
          <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Layers className="w-3 h-3 text-slate-400" />
            Filings in Period
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-white mt-1">
            {metrics.count}
          </div>
        </div>

        {/* Gross Revenue / Filing Fees */}
        <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/80">
          <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-blue-400" />
            Gross Fees
          </div>
          <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-blue-400 mt-1 truncate">
            {formatPeso(metrics.totalFees)}
          </div>
        </div>

        {/* Period Expenses */}
        <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/80">
          <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <TrendingDown className="w-3 h-3 text-orange-400" />
            Period Expenses
          </div>
          <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-orange-400 mt-1 truncate">
            {formatPeso(metrics.totalExpenses)}
          </div>
        </div>

        {/* Net Profit */}
        <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/80">
          <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-emerald-400" />
            Net Margin
          </div>
          <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-emerald-400 mt-1 truncate">
            {formatPeso(metrics.netProfit)}
          </div>
        </div>

        {/* Total Collected Fees */}
        <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/80">
          <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-teal-400" />
            Total Collected Fees
          </div>
          <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-teal-400 mt-1 truncate">
            {formatPeso(metrics.totalPaid)}
          </div>
        </div>

        {/* Period Uncollected */}
        <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/80">
          <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <TrendingDown className="w-3 h-3 text-rose-400" />
            Uncollected
          </div>
          <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-rose-400 mt-1 truncate">
            {formatPeso(metrics.totalBalance)}
          </div>
        </div>

      </div>
    </div>
  );
};
