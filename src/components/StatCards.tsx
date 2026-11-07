import React from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Receipt, 
  Building2,
  TrendingUp 
} from 'lucide-react';
import { SECTransaction } from '../types';
import { formatPeso, getRecordBalance, getRecordTotalExpenses } from '../utils/formatters';

interface StatCardsProps {
  records: SECTransaction[];
  onOpenCorporationsModal: (filter: 'all' | 'active') => void;
}

export const StatCards: React.FC<StatCardsProps> = ({ records, onOpenCorporationsModal }) => {
  const totalRecords = records.length;
  
  const completedRecords = records.filter(
    r => (r.status || '').trim().toLowerCase() === 'completed'
  ).length;
  
  const inProgressRecords = totalRecords - completedRecords;

  const totalUncollectedBalance = records.reduce((sum, r) => sum + getRecordBalance(r), 0);

  const totalExpenses = records.reduce((sum, r) => sum + getRecordTotalExpenses(r), 0);

  const totalFees = records.reduce((sum, r) => sum + (Number(r.totalFee) || 0), 0);
  const totalPaid = records.reduce((sum, r) => sum + (Number(r.amountPaid) || 0), 0);
  const netRealizedProfit = totalFees - totalExpenses;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      
      {/* 1. Total Records */}
      <div className="p-4 rounded-xl bg-slate-900/90 dark:bg-slate-900/90 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-1">
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            Total Records
          </span>
          <button
            type="button"
            onClick={() => onOpenCorporationsModal('all')}
            className="text-[11px] text-blue-400 hover:text-blue-300 inline-flex items-center gap-0.5 hover:underline"
            title="View all corporations directory"
          >
            <Building2 className="w-3 h-3" /> View
          </button>
        </div>
        <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
          {totalRecords}
        </div>
        <div className="text-[11px] text-slate-400 mt-1 truncate">
          All SEC compliance filings
        </div>
      </div>

      {/* 2. In Progress / Pending */}
      <div className="p-4 rounded-xl bg-slate-900/90 dark:bg-slate-900/90 border border-slate-800 flex flex-col justify-between hover:border-amber-500/30 transition-colors">
        <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-1">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            In Progress
          </span>
          <button
            type="button"
            onClick={() => onOpenCorporationsModal('active')}
            className="text-[11px] text-amber-400 hover:text-amber-300 inline-flex items-center gap-0.5 hover:underline"
            title="View active corporate filings"
          >
            <Building2 className="w-3 h-3" /> View
          </button>
        </div>
        <div className="text-2xl font-bold font-mono tabular-nums text-amber-400 mt-1">
          {inProgressRecords}
        </div>
        <div className="text-[11px] text-amber-400/80 mt-1 truncate">
          Pending examiner review
        </div>
      </div>

      {/* 3. Completed */}
      <div className="p-4 rounded-xl bg-slate-900/90 dark:bg-slate-900/90 border border-slate-800 flex flex-col justify-between hover:border-emerald-500/30 transition-colors">
        <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-1">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Completed
          </span>
        </div>
        <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
          {completedRecords}
        </div>
        <div className="text-[11px] text-emerald-400/80 mt-1 truncate">
          Released & acknowledged
        </div>
      </div>

      {/* 4. Total Uncollected Balance */}
      <div className="p-4 rounded-xl bg-slate-900/90 dark:bg-slate-900/90 border border-slate-800 flex flex-col justify-between hover:border-rose-500/30 transition-colors">
        <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-1">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            Uncollected
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-rose-400 mt-1 truncate">
          {formatPeso(totalUncollectedBalance)}
        </div>
        <div className="text-[11px] text-rose-400/80 mt-1 truncate">
          Pending client receivables
        </div>
      </div>

      {/* 5. Total Expenses */}
      <div className="p-4 rounded-xl bg-slate-900/90 dark:bg-slate-900/90 border border-slate-800 flex flex-col justify-between hover:border-orange-500/30 transition-colors">
        <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-1">
          <span className="flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-orange-400" />
            Total Expenses
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-orange-400 mt-1 truncate">
          {formatPeso(totalExpenses)}
        </div>
        <div className="text-[11px] text-orange-400/80 mt-1 truncate">
          SEC fees, notarials, liaison
        </div>
      </div>

      {/* 6. Net Profit / Margin */}
      <div className="p-4 rounded-xl bg-slate-900/90 dark:bg-slate-900/90 border border-slate-800 flex flex-col justify-between hover:border-blue-500/30 transition-colors">
        <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-1">
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            Net Earnings
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-cyan-400 mt-1 truncate">
          {formatPeso(netRealizedProfit)}
        </div>
        <div className="text-[11px] text-cyan-400/80 mt-1 truncate">
          Fee revenue less costs
        </div>
      </div>

    </div>
  );
};
