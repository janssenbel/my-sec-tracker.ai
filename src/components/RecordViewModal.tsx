import React from 'react';
import { 
  X, 
  Printer, 
  Edit3, 
  Check, 
  Calendar, 
  Building2, 
  FileText, 
  Hash, 
  Receipt,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { SECTransaction } from '../types';
import { 
  formatPeso, 
  formatDate, 
  getRecordBalance, 
  getRecordTotalExpenses, 
  getRecordNetProfit 
} from '../utils/formatters';

interface RecordViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: SECTransaction | null;
  onEdit: (record: SECTransaction) => void;
  onQuickSettle: (id: string) => void;
}

export const RecordViewModal: React.FC<RecordViewModalProps> = ({
  isOpen,
  onClose,
  record,
  onEdit,
  onQuickSettle
}) => {
  if (!isOpen || !record) return null;

  const balance = getRecordBalance(record);
  const totalExpenses = getRecordTotalExpenses(record);
  const netProfit = getRecordNetProfit(record);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 overflow-hidden my-6">
        
        {/* Top Controls Bar (Hidden during print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">
              Transaction Details & Summary Slip
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors"
              title="Print transaction summary receipt"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span>Print Slip</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(record);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-950/70 border border-blue-800 rounded-lg hover:bg-blue-900/60 transition-colors"
              title="Edit Record"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Printable Content Area */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[82vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0">
          
          {/* Printable Formal Header */}
          <div className="border-b border-slate-800 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block">
                  Securities and Exchange Commission · Compliance Tracking
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                  {record.corporationName}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700 font-mono">
                  {record.status}
                </span>
                {balance === 0 ? (
                  <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Fully Paid
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded text-xs font-semibold bg-rose-950 text-rose-400 border border-rose-800 font-mono">
                    Balance Due
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/60 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Filing Type</span>
                <span className="font-semibold text-white">{record.filingType}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Tracking / eFAST Ref</span>
                <span className="font-mono text-blue-300 font-semibold">{record.trackingNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Date Filed</span>
                <span className="font-mono text-slate-200">{formatDate(record.dateFiled)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Target Release Date</span>
                <span className="font-mono text-amber-300">{formatDate(record.targetDate)}</span>
              </div>
            </div>

            {record.dateCompleted && (
              <div className="mt-3 text-xs flex items-center gap-1.5 text-emerald-400 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>Officially Completed on {formatDate(record.dateCompleted)}</span>
              </div>
            )}
          </div>

          {/* Financial Summary Ledger */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-blue-400" />
              Client Billing & Collection Ledger
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Total Agreed Fee</span>
                <span className="text-lg font-bold font-mono tabular-nums text-white">
                  {formatPeso(record.totalFee)}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Amount Collected</span>
                <span className="text-lg font-bold font-mono tabular-nums text-cyan-400">
                  {formatPeso(record.amountPaid)}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">Uncollected Balance</span>
                  <span className={`text-lg font-bold font-mono tabular-nums ${
                    balance > 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {formatPeso(balance)}
                  </span>
                </div>
                {balance > 0 && (
                  <button
                    type="button"
                    onClick={() => onQuickSettle(record.id)}
                    className="no-print px-2.5 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800 rounded-lg hover:bg-emerald-900/60 transition-colors inline-flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Settle
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Itemized Expenses Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-orange-400" />
                Itemized Liaison & Processing Expenses
              </h3>
              <span className="text-xs font-mono text-orange-400 font-semibold">
                Total Expenses: {formatPeso(totalExpenses)}
              </span>
            </div>

            {(!record.expenses || record.expenses.length === 0) ? (
              <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800/80 text-center text-xs text-slate-500">
                No itemized expenses recorded for this transaction.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/50">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                      <th className="py-2.5 px-4">#</th>
                      <th className="py-2.5 px-4">Expense Description</th>
                      <th className="py-2.5 px-4 text-right">Disbursement Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {record.expenses.map((exp, idx) => (
                      <tr key={exp.id || idx} className="hover:bg-slate-900/30">
                        <td className="py-2.5 px-4 font-mono text-slate-500 w-10">{idx + 1}</td>
                        <td className="py-2.5 px-4 font-medium text-slate-200">{exp.description}</td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums text-orange-400 font-medium">
                          {formatPeso(exp.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-900 font-semibold text-slate-200 border-t border-slate-800">
                      <td colSpan={2} className="py-2.5 px-4 text-right">Total Disbursements:</td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-orange-400 font-bold">
                        {formatPeso(totalExpenses)}
                      </td>
                    </tr>
                    <tr className="bg-slate-950 font-bold text-white border-t border-slate-800">
                      <td colSpan={2} className="py-2.5 px-4 text-right text-emerald-400">
                        Net Professional Margin:
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-emerald-400 text-sm">
                        {formatPeso(netProfit)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Notes & Remarks */}
          {record.notes && (
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Compliance Notes & Remarks
              </span>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {record.notes}
              </p>
            </div>
          )}

          {/* Print Signature Slip Lines (Visible on Slip & Print) */}
          <div className="pt-6 border-t border-slate-800 grid grid-cols-2 gap-8 text-xs text-slate-400">
            <div className="space-y-10">
              <span className="block text-[11px] font-medium">Prepared by / Liaison Officer:</span>
              <div className="border-t border-slate-700 pt-1">
                <span className="text-[10px] block">Authorized Signature over Printed Name</span>
                <span className="text-[10px] font-mono text-slate-500">Date: _______________</span>
              </div>
            </div>
            <div className="space-y-10">
              <span className="block text-[11px] font-medium">Received by Corporation Representative:</span>
              <div className="border-t border-slate-700 pt-1">
                <span className="text-[10px] block">Client Signature & Company Stamp</span>
                <span className="text-[10px] font-mono text-slate-500">Date: _______________</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/70">
          <span className="text-[11px] text-slate-400 font-mono">
            ID: {record.id} · Updated: {formatDate(record.updatedAt.slice(0, 10))}
          </span>
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
