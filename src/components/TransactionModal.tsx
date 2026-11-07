import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Calculator, 
  Calendar, 
  Building2, 
  FileText, 
  Hash, 
  Receipt,
  CheckCircle2
} from 'lucide-react';
import { 
  SECTransaction, 
  TransactionStatus, 
  SEC_FILING_TYPES, 
  STANDARD_EXPENSE_PRESETS,
  ExpenseItem 
} from '../types';
import { formatPeso } from '../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: SECTransaction) => void;
  initialRecord?: SECTransaction | null;
  existingCorporations: string[];
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialRecord,
  existingCorporations
}) => {
  const [corporationName, setCorporationName] = useState('');
  const [filingType, setFilingType] = useState<string>(SEC_FILING_TYPES[0]);
  const [customFilingType, setCustomFilingType] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [status, setStatus] = useState<TransactionStatus>('Pending');
  const [dateFiled, setDateFiled] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [dateCompleted, setDateCompleted] = useState('');
  const [totalFee, setTotalFee] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [isFullyPaid, setIsFullyPaid] = useState<boolean>(false);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Pre-fill form when editing or resetting
  useEffect(() => {
    if (initialRecord) {
      setCorporationName(initialRecord.corporationName);
      if (SEC_FILING_TYPES.includes(initialRecord.filingType as any)) {
        setFilingType(initialRecord.filingType);
        setCustomFilingType('');
      } else {
        setFilingType('Other Corporate Compliance Filing');
        setCustomFilingType(initialRecord.filingType);
      }
      setTrackingNumber(initialRecord.trackingNumber);
      setStatus(initialRecord.status);
      setDateFiled(initialRecord.dateFiled);
      setTargetDate(initialRecord.targetDate);
      setDateCompleted(initialRecord.dateCompleted || '');
      setTotalFee(initialRecord.totalFee);
      setAmountPaid(initialRecord.amountPaid);
      setIsFullyPaid(initialRecord.isFullyPaid);
      setExpenses(initialRecord.expenses ? [...initialRecord.expenses] : []);
      setNotes(initialRecord.notes || '');
      setErrorMessage('');
    } else {
      // New record defaults
      const today = new Date().toISOString().slice(0, 10);
      const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
      setCorporationName('');
      setFilingType(SEC_FILING_TYPES[0]);
      setCustomFilingType('');
      setTrackingNumber(`SEC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`);
      setStatus('In Progress');
      setDateFiled(today);
      setTargetDate(nextWeek);
      setDateCompleted('');
      setTotalFee(15000);
      setAmountPaid(5000);
      setIsFullyPaid(false);
      setExpenses([
        { id: `exp-${Date.now()}-1`, description: 'SEC Basic Filing Fee', amount: 3000 },
        { id: `exp-${Date.now()}-2`, description: 'Notarial & Acknowledgment Fee', amount: 800 }
      ]);
      setNotes('');
      setErrorMessage('');
    }
  }, [initialRecord, isOpen]);

  // If fully paid checkbox changes
  const handleToggleFullyPaid = (checked: boolean) => {
    setIsFullyPaid(checked);
    if (checked) {
      setAmountPaid(totalFee);
    }
  };

  const handleTotalFeeChange = (val: number) => {
    setTotalFee(val);
    if (isFullyPaid) {
      setAmountPaid(val);
    }
  };

  const handleAmountPaidChange = (val: number) => {
    setAmountPaid(val);
    if (val >= totalFee && totalFee > 0) {
      setIsFullyPaid(true);
    } else {
      setIsFullyPaid(false);
    }
  };

  // Expenses management
  const handleAddExpense = (presetDesc = '') => {
    setExpenses(prev => [
      ...prev,
      {
        id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        description: presetDesc || '',
        amount: 0
      }
    ]);
  };

  const handleUpdateExpense = (id: string, field: 'description' | 'amount', value: string | number) => {
    setExpenses(prev =>
      prev.map(item => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleRemoveExpense = (id: string) => {
    setExpenses(prev => prev.filter(item => item.id !== id));
  };

  // Calculations
  const calculatedBalance = Math.max(0, (totalFee || 0) - (amountPaid || 0));
  const totalExpensesSum = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const calculatedNetProfit = (totalFee || 0) - totalExpensesSum;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!corporationName.trim()) {
      setErrorMessage('Corporation name is required.');
      return;
    }
    if (!trackingNumber.trim()) {
      setErrorMessage('Tracking / Reference number is required.');
      return;
    }

    const finalFilingType = 
      filingType === 'Other Corporate Compliance Filing' && customFilingType.trim()
        ? customFilingType.trim()
        : filingType;

    const recordToSave: SECTransaction = {
      id: initialRecord?.id || `sec-${Date.now()}`,
      corporationName: corporationName.trim(),
      filingType: finalFilingType,
      trackingNumber: trackingNumber.trim(),
      status,
      dateFiled: dateFiled || new Date().toISOString().slice(0, 10),
      targetDate: targetDate || new Date().toISOString().slice(0, 10),
      dateCompleted: status === 'Completed' ? (dateCompleted || new Date().toISOString().slice(0, 10)) : undefined,
      totalFee: Number(totalFee) || 0,
      amountPaid: Number(amountPaid) || 0,
      isFullyPaid: isFullyPaid || amountPaid >= totalFee,
      expenses: expenses.filter(e => e.description.trim() !== '' || Number(e.amount) > 0),
      notes: notes.trim(),
      createdAt: initialRecord?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(recordToSave);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {initialRecord ? 'Edit SEC Transaction' : 'New SEC Corporate Transaction'}
              </h2>
              <p className="text-xs text-slate-400">
                Register compliance filing, professional fees, and itemized expenses
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-300 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Section 1: Corporation & Filing Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Corporation Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                Corporation / Entity Name *
              </label>
              <input
                type="text"
                list="corporation-suggestions"
                value={corporationName}
                onChange={(e) => setCorporationName(e.target.value)}
                placeholder="e.g. Apex Horizon Holdings Inc."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
              <datalist id="corporation-suggestions">
                {existingCorporations.map(corp => (
                  <option key={corp} value={corp} />
                ))}
              </datalist>
            </div>

            {/* Filing Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Filing / Transaction Type
              </label>
              <select
                value={filingType}
                onChange={(e) => setFilingType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {SEC_FILING_TYPES.map(type => (
                  <option key={type} value={type} className="bg-slate-900">
                    {type}
                  </option>
                ))}
              </select>
              {filingType === 'Other Corporate Compliance Filing' && (
                <input
                  type="text"
                  value={customFilingType}
                  onChange={(e) => setCustomFilingType(e.target.value)}
                  placeholder="Specify custom filing type..."
                  className="mt-2 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              )}
            </div>

            {/* Tracking / Reference Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-blue-400" />
                Tracking / Ref Number *
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. SEC-2026-GIS-09412 or eFAST ID"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

          </div>

          {/* Section 2: Status & Timeline Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            
            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Filing Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TransactionStatus)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Under Review">Under Review</option>
                <option value="For Release">For Release</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Date Filed */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                Date Filed
              </label>
              <input
                type="date"
                value={dateFiled}
                onChange={(e) => setDateFiled(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>

            {/* Target Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-400" />
                Target Release Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>

            {/* Date Completed (if status is completed) */}
            {status === 'Completed' && (
              <div className="sm:col-span-3 pt-2">
                <label className="block text-xs font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Date Completed & Released
                </label>
                <input
                  type="date"
                  value={dateCompleted}
                  onChange={(e) => setDateCompleted(e.target.value)}
                  className="w-full sm:w-1/3 bg-slate-900 border border-emerald-700/80 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>
            )}

          </div>

          {/* Section 3: Financials & Collections */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-blue-400" />
                Financials & Client Fee
              </h3>
              <label className="flex items-center gap-2 text-xs font-medium text-emerald-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFullyPaid}
                  onChange={(e) => handleToggleFullyPaid(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                />
                <span>Fully Paid</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Total Service / Filing Fee (₱)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={totalFee}
                  onChange={(e) => handleTotalFeeChange(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono tabular-nums text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Amount Paid / Collected (₱)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => handleAmountPaidChange(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono tabular-nums text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Uncollected Balance (₱)
                </label>
                <div className={`px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm font-mono tabular-nums font-semibold ${
                  calculatedBalance > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {formatPeso(calculatedBalance)}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Itemized Expenses */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-orange-400" />
                  Itemized Liaison & Filing Expenses
                </h3>
                <p className="text-[11px] text-slate-400">
                  Government fees, courier, notarial, and liaison processing disbursements
                </p>
              </div>

              {/* Add Expense Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAddExpense()}
                  className="px-2.5 py-1 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md inline-flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Custom Row
                </button>
              </div>
            </div>

            {/* Preset quick-add pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {STANDARD_EXPENSE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAddExpense(preset)}
                  className="px-2 py-0.5 rounded text-[11px] font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white transition-colors"
                >
                  + {preset}
                </button>
              ))}
            </div>

            {/* Expenses List */}
            <div className="space-y-2 pt-2">
              {expenses.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                  No expense items added yet. Click "+ Custom Row" or a preset above to log expenses.
                </div>
              ) : (
                expenses.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleUpdateExpense(item.id, 'description', e.target.value)}
                      placeholder={`Expense item #${idx + 1} description`}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="relative w-36">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">
                        ₱
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.amount || ''}
                        onChange={(e) => handleUpdateExpense(item.id, 'amount', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-6 pr-2.5 py-1.5 text-xs font-mono tabular-nums text-right text-orange-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExpense(item.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
                      title="Remove expense row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Expenses Summary Banner */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400">Total Disbursements:</span>
              <div className="flex items-center gap-4">
                <span className="font-mono tabular-nums font-semibold text-orange-400">
                  {formatPeso(totalExpensesSum)}
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400">Net Margin:</span>
                <span className={`font-mono tabular-nums font-bold ${
                  calculatedNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {formatPeso(calculatedNetProfit)}
                </span>
              </div>
            </div>

          </div>

          {/* Section 5: Notes & Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Notes & Compliance Remarks
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. eFAST electronic submission reference, BIR stamping, board resolution notes..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md shadow-blue-600/30 transition-all active:scale-[0.98]"
            >
              {initialRecord ? 'Save Changes' : 'Save Transaction'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
