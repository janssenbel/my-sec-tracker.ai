import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Calculator, 
  Calendar, 
  Building2, 
  FileText, 
  Receipt,
  CheckCircle2,
  ClipboardList
} from 'lucide-react';
import { 
  SECTransaction, 
  SEC_FILING_TYPES, 
  STANDARD_STATUSES,
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
  
  // Chronological Dates
  const [dateAccepted, setDateAccepted] = useState('');
  const [dateStarted, setDateStarted] = useState('');
  const [dateCompleted, setDateCompleted] = useState('');

  // Current Status & "Others (please specify)"
  const [currentStatus, setCurrentStatus] = useState<string>(STANDARD_STATUSES[0]);
  const [customStatus, setCustomStatus] = useState('');

  // Financials
  const [totalFee, setTotalFee] = useState<number>(0);
  const [initialPayment, setInitialPayment] = useState<number>(0);
  const [isFullyPaid, setIsFullyPaid] = useState<boolean>(false);
  const [finalPayment, setFinalPayment] = useState<number>(0);
  const [dateFullyPaid, setDateFullyPaid] = useState<string>('');

  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Pre-fill form when editing or resetting
  useEffect(() => {
    if (initialRecord) {
      setCorporationName(initialRecord.corporationName || '');

      // Filing Type
      if (SEC_FILING_TYPES.includes(initialRecord.filingType as any) && initialRecord.filingType !== 'Others') {
        setFilingType(initialRecord.filingType);
        setCustomFilingType('');
      } else {
        setFilingType('Others');
        setCustomFilingType(initialRecord.filingType === 'Others' ? '' : initialRecord.filingType);
      }

      // Chronological Dates
      setDateAccepted(initialRecord.dateAccepted || '');
      setDateStarted(initialRecord.dateStarted || '');
      setDateCompleted(initialRecord.dateCompleted || '');

      // Current Status
      const matchingStandardStatus = STANDARD_STATUSES.find(
        s => s.toLowerCase() === (initialRecord.status || '').trim().toLowerCase() ||
             (s === 'Approved / For Submission of Hard Copies' &&
              (initialRecord.status || '').replace(/\s*\/\s*/g, ' / ').toLowerCase() === s.toLowerCase())
      );
      if (matchingStandardStatus) {
        setCurrentStatus(matchingStandardStatus);
        setCustomStatus('');
      } else if (initialRecord.status) {
        setCurrentStatus('Others');
        setCustomStatus(initialRecord.status);
      } else {
        setCurrentStatus(STANDARD_STATUSES[0]);
        setCustomStatus('');
      }

      // Financials
      const fee = Number(initialRecord.totalFee) || 0;
      const initPay = initialRecord.initialPayment !== undefined
        ? Number(initialRecord.initialPayment) || 0
        : (initialRecord.isFullyPaid ? fee : Number(initialRecord.amountPaid) || 0);
      const finPay = initialRecord.finalPayment !== undefined
        ? Number(initialRecord.finalPayment) || 0
        : 0;

      setTotalFee(fee);
      setInitialPayment(initPay);
      setIsFullyPaid(Boolean(initialRecord.isFullyPaid));
      setFinalPayment(finPay);
      setDateFullyPaid(initialRecord.dateFullyPaid || '');
      setExpenses(Array.isArray(initialRecord.expenses) ? [...initialRecord.expenses] : []);
      setNotes(initialRecord.notes || '');
      setErrorMessage('');
    } else {
      // New record defaults
      const today = new Date().toISOString().slice(0, 10);
      setCorporationName('');
      setFilingType(SEC_FILING_TYPES[0]);
      setCustomFilingType('');
      setDateAccepted(today);
      setDateStarted('');
      setDateCompleted('');
      setCurrentStatus(STANDARD_STATUSES[0]);
      setCustomStatus('');
      setTotalFee(0);
      setInitialPayment(0);
      setIsFullyPaid(false);
      setFinalPayment(0);
      setDateFullyPaid('');
      setExpenses([]);
      setNotes('');
      setErrorMessage('');
    }
  }, [initialRecord, isOpen]);

  // Toggle "Remaining balance is fully paid"
  const handleToggleFullyPaid = (checked: boolean) => {
    setIsFullyPaid(checked);
    if (checked) {
      const remaining = Math.max(0, (Number(totalFee) || 0) - (Number(initialPayment) || 0));
      setFinalPayment(remaining);
      if (!dateFullyPaid) {
        setDateFullyPaid(new Date().toISOString().slice(0, 10));
      }
    } else {
      setFinalPayment(0);
      setDateFullyPaid('');
    }
  };

  const handleTotalFeeChange = (val: number) => {
    setTotalFee(val);
    if (isFullyPaid) {
      setFinalPayment(Math.max(0, val - (Number(initialPayment) || 0)));
    }
  };

  const handleInitialPaymentChange = (val: number) => {
    setInitialPayment(val);
    if (isFullyPaid) {
      setFinalPayment(Math.max(0, (Number(totalFee) || 0) - val));
    }
  };

  const handleStatusSelectChange = (newStatus: string) => {
    setCurrentStatus(newStatus);
    if (newStatus === 'Completed' && !dateCompleted) {
      setDateCompleted(new Date().toISOString().slice(0, 10));
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

  // Live financial calculations
  const totalPaid = (Number(initialPayment) || 0) + (isFullyPaid ? (Number(finalPayment) || 0) : 0);
  const calculatedBalance = isFullyPaid ? 0 : Math.max(0, (Number(totalFee) || 0) - (Number(initialPayment) || 0));
  const totalExpensesSum = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const calculatedNetProfit = (Number(totalFee) || 0) - totalExpensesSum;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!corporationName.trim()) {
      setErrorMessage('Name of Corporation is required.');
      return;
    }
    if (!dateAccepted) {
      setErrorMessage('Date Accepted & Downpayment is required.');
      return;
    }
    if (filingType === 'Others' && !customFilingType.trim()) {
      setErrorMessage('Please specify the custom transaction type.');
      return;
    }
    if (currentStatus === 'Others' && !customStatus.trim()) {
      setErrorMessage('Please specify the custom current status.');
      return;
    }

    const finalFilingType = filingType === 'Others' ? customFilingType.trim() : filingType;
    const finalStatus = currentStatus === 'Others' ? customStatus.trim() : currentStatus;
    const effectivePaid = isFullyPaid ? Math.max(Number(totalFee) || 0, totalPaid) : (Number(initialPayment) || 0);

    const recordToSave: SECTransaction = {
      id: initialRecord?.id || `SEC-${Date.now()}`,
      corporationName: corporationName.trim(),
      filingType: finalFilingType,
      status: finalStatus,
      dateAccepted: dateAccepted || new Date().toISOString().slice(0, 10),
      dateStarted: dateStarted || '',
      dateCompleted: dateCompleted || undefined,
      totalFee: Number(totalFee) || 0,
      initialPayment: Number(initialPayment) || 0,
      finalPayment: isFullyPaid ? (Number(finalPayment) || 0) : 0,
      dateFullyPaid: isFullyPaid ? (dateFullyPaid || undefined) : undefined,
      amountPaid: effectivePaid,
      isFullyPaid: isFullyPaid || calculatedBalance === 0,
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
                {initialRecord ? 'Edit SEC Transaction' : 'New SEC Transaction'}
              </h2>
              <p className="text-xs text-slate-400">
                Record corporate transaction dates, fees, itemized expenses, and current status
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-300 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Section 1: Corporation Name & Transaction Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Corporation Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                Name of Corporation *
              </label>
              <input
                type="text"
                list="corporation-suggestions"
                value={corporationName}
                onChange={(e) => setCorporationName(e.target.value)}
                placeholder="e.g., Summit Peak Commercial Inc."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
              <datalist id="corporation-suggestions">
                {existingCorporations.map(corp => (
                  <option key={corp} value={corp} />
                ))}
              </datalist>
            </div>

            {/* Type of Transaction */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Type of Transaction *
              </label>
              <select
                value={filingType}
                onChange={(e) => setFilingType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {SEC_FILING_TYPES.map(type => (
                  <option key={type} value={type} className="bg-slate-900">
                    {type === 'Others' ? 'Others (Please specify)' : type}
                  </option>
                ))}
              </select>
              {filingType === 'Others' && (
                <div className="mt-2.5">
                  <label className="block text-xs font-semibold text-blue-300 mb-1">
                    Please Specify Other Transaction *
                  </label>
                  <input
                    type="text"
                    value={customFilingType}
                    onChange={(e) => setCustomFilingType(e.target.value)}
                    placeholder="e.g. Dissolution, Foreign License, By-Laws Amendment"
                    className="w-full bg-slate-950 border border-blue-800/80 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              )}
            </div>

          </div>

          {/* Section 2: Chronological Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            
            {/* 1. Date Accepted & Downpayment */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                1. Date Accepted &amp; Downpayment *
              </label>
              <input
                type="date"
                value={dateAccepted}
                onChange={(e) => setDateAccepted(e.target.value)}
                required
                title="Date Accepted and Received the Downpayment"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>

            {/* 2. Date Started */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                2. Date Started
              </label>
              <input
                type="date"
                value={dateStarted}
                onChange={(e) => setDateStarted(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>

            {/* 3. Date Completed */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                3. Date Completed
              </label>
              <input
                type="date"
                value={dateCompleted}
                onChange={(e) => setDateCompleted(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>

          </div>

          {/* Section 3: Financials & Payments */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-blue-400" />
              Financials &amp; Payments
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Assistance Fee (₱) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={totalFee || ''}
                  onChange={(e) => handleTotalFeeChange(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono tabular-nums text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Initial Payment (₱)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={initialPayment || ''}
                  onChange={(e) => handleInitialPaymentChange(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono tabular-nums text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Balance (Auto-Computed)
                </label>
                <div className={`px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm font-mono tabular-nums font-bold ${
                  calculatedBalance > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {formatPeso(calculatedBalance)}
                </div>
              </div>
            </div>

            {/* Remaining balance is fully paid checkbox & Final Payment fields */}
            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-emerald-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFullyPaid}
                  onChange={(e) => handleToggleFullyPaid(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>Remaining balance is fully paid</span>
              </label>

              {isFullyPaid && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                  <div>
                    <label className="block text-xs font-semibold text-emerald-400 mb-1">
                      Final Payment Amount (₱)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={finalPayment || ''}
                      onChange={(e) => setFinalPayment(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full bg-slate-950 border border-emerald-800/70 rounded-lg px-3 py-1.5 text-xs font-mono tabular-nums text-emerald-300 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-emerald-400 mb-1">
                      Date Fully Paid
                    </label>
                    <input
                      type="date"
                      value={dateFullyPaid}
                      onChange={(e) => setDateFullyPaid(e.target.value)}
                      className="w-full bg-slate-950 border border-emerald-800/70 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Itemized Corporation Expenses */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-orange-400" />
                  Itemized Corporation Expenses
                </h3>
                <p className="text-[11px] text-slate-400">
                  Add filing fees, legal research fee, notary, courier, etc.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAddExpense()}
                  className="px-2.5 py-1 text-xs font-semibold text-orange-300 bg-orange-950/50 hover:bg-orange-900/60 border border-orange-800/70 rounded-md inline-flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Expense Item
                </button>
              </div>
            </div>

            {/* Preset quick-add buttons */}
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
                <div className="p-4 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg italic">
                  No expenses encoded yet. Click &quot;+ Add Expense Item&quot; or a preset above to add SEC fees, notary, logistics, etc.
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
            <div className="flex flex-wrap items-center justify-between pt-2.5 border-t border-slate-800 text-xs gap-2">
              <div>
                <span className="text-slate-400 font-semibold">TOTAL EXPENSES: </span>
                <span className="font-mono tabular-nums font-bold text-orange-400 text-sm">
                  {formatPeso(totalExpensesSum)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">ESTIMATED NET MARGIN: </span>
                <span className={`font-mono tabular-nums font-bold text-sm ${
                  calculatedNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {formatPeso(calculatedNetProfit)}
                </span>
              </div>
            </div>

          </div>

          {/* Section 5: Current Status */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <ClipboardList className="w-3.5 h-3.5 text-blue-400" />
                Current Status *
              </label>
              <select
                value={currentStatus}
                onChange={(e) => handleStatusSelectChange(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="For Preparation of Documents">For Preparation of Documents</option>
                <option value="For Signing of Documents">For Signing of Documents</option>
                <option value="For Review">For Review</option>
                <option value="For Payment">For Payment</option>
                <option value="Approved / For Submission of Hard Copies">Approved / For Submission of Hard Copies</option>
                <option value="Submitted / Awaiting Certificate">Submitted / Awaiting Certificate</option>
                <option value="Completed">Completed</option>
                <option value="For Compliance of Client">For Compliance of Client</option>
                <option value="Others">Others (please specify)</option>
              </select>
            </div>

            {currentStatus === 'Others' && (
              <div>
                <label className="block text-xs font-semibold text-blue-300 mb-1">
                  Please Specify Other Status *
                </label>
                <input
                  type="text"
                  value={customStatus}
                  onChange={(e) => setCustomStatus(e.target.value)}
                  placeholder="e.g. SEC Hearing, Securing BIR Tax Clearance"
                  required
                  className="w-full bg-slate-900 border border-blue-800/80 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Section 6: Notes & Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Notes &amp; Remarks (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional remarks or client compliance notes..."
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
              {initialRecord ? 'Save Changes' : 'Save Details'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
