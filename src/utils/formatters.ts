import { SECTransaction, ExpenseItem } from '../types';

export function formatPeso(amount: number): string {
  const safeAmount = isNaN(amount) ? 0 : Number(amount);
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(safeAmount);
}

export function formatDate(dateStr?: string): string {
  if (!dateStr || typeof dateStr !== 'string' || !dateStr.trim()) return '—';
  try {
    const parts = dateStr.slice(0, 10).split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }
    }
    const fallback = new Date(dateStr);
    if (!isNaN(fallback.getTime())) {
      return fallback.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

/**
 * Normalizes status strings to canonical Current Status labels while
 * preserving any custom "Others" status string entered by the user.
 */
export function normalizeStatus(rawStatus: string): string {
  const trimmed = (rawStatus || '').trim();
  if (!trimmed) return 'For Preparation of Documents';

  const lower = trimmed.toLowerCase();
  if (lower === 'for preparation of documents' || lower === 'pending') {
    return 'For Preparation of Documents';
  }
  if (lower === 'for signing of documents') {
    return 'For Signing of Documents';
  }
  if (lower === 'for review' || lower === 'under review') {
    return 'For Review';
  }
  if (lower === 'for payment') {
    return 'For Payment';
  }
  if (
    lower === 'approved / for submission of hard copies' ||
    lower === 'approved/ for submission of hard copies' ||
    lower === 'approved/for submission of hard copies'
  ) {
    return 'Approved / For Submission of Hard Copies';
  }
  if (
    lower === 'submitted / awaiting certificate' ||
    lower === 'submitted/ awaiting certificate' ||
    lower === 'for release'
  ) {
    return 'Submitted / Awaiting Certificate';
  }
  if (lower === 'completed' || lower === 'done' || lower === 'finished') {
    return 'Completed';
  }
  if (lower === 'for compliance of client') {
    return 'For Compliance of Client';
  }
  if (lower === 'in progress') {
    return 'For Preparation of Documents';
  }
  // Return custom status as-is
  return trimmed;
}

/**
 * Universal record normalizer that converts any legacy or current record
 * into a safe, valid SECTransaction object without throwing runtime errors.
 */
export function normalizeRecord(raw: any, fallbackId?: string): SECTransaction {
  if (!raw || typeof raw !== 'object') {
    const today = new Date().toISOString().slice(0, 10);
    return {
      id: fallbackId || `sec-${Date.now()}`,
      corporationName: 'Unknown Corporation',
      filingType: 'Registration',
      status: 'For Preparation of Documents',
      dateAccepted: today,
      dateStarted: '',
      dateCompleted: '',
      totalFee: 0,
      initialPayment: 0,
      finalPayment: 0,
      dateFullyPaid: '',
      amountPaid: 0,
      isFullyPaid: false,
      expenses: [],
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // 1. Corporation name mapping
  const corporationName = String(
    raw.corporationName || raw.corpName || raw.companyName || raw.name || 'Unnamed Corporation'
  ).trim();

  // 2. Filing type mapping
  const filingType = String(
    raw.filingType || raw.transType || raw.transactionType || raw.type || 'Registration'
  ).trim();

  // 3. Current Status mapping (preserves custom statuses and normalizes standard ones)
  const status = normalizeStatus(String(raw.currentStatus || raw.status || 'For Preparation of Documents'));

  // 4. Chronological Dates: Date Accepted & Downpayment, Date Started, Date Completed
  const today = new Date().toISOString().slice(0, 10);
  const rawAccepted = raw.dateAccepted || raw.dateFiled || today;
  const dateAccepted = rawAccepted ? String(rawAccepted).slice(0, 10) : today;

  const rawStarted = raw.dateStarted || '';
  const dateStarted = rawStarted ? String(rawStarted).slice(0, 10) : '';

  const rawCompleted = raw.dateCompleted || raw.finishedDate || '';
  const dateCompleted = rawCompleted ? String(rawCompleted).slice(0, 10) : '';

  // 5. Fees and Collections
  const totalFee = Number(raw.totalFee ?? raw.fee ?? raw.assistanceFee ?? 0) || 0;
  const hasInitial = raw.initialPayment !== undefined && raw.initialPayment !== null;
  const hasFinal = raw.finalPayment !== undefined && raw.finalPayment !== null;

  let initialPayment = hasInitial ? (Number(raw.initialPayment) || 0) : (Number(raw.amountPaid) || 0);
  let finalPayment = hasFinal ? (Number(raw.finalPayment) || 0) : 0;

  let amountPaid = hasInitial || hasFinal
    ? initialPayment + finalPayment
    : (Number(raw.amountPaid) || 0);

  if (isNaN(amountPaid)) amountPaid = 0;

  const isFullyPaid = Boolean(
    raw.isFullyPaid ||
    (raw.balance !== undefined && Number(raw.balance) === 0 && totalFee > 0) ||
    (totalFee > 0 && amountPaid >= totalFee)
  );

  if (isFullyPaid && amountPaid < totalFee) {
    finalPayment = Math.max(0, totalFee - initialPayment);
    amountPaid = totalFee;
  }

  const rawDateFullyPaid = raw.dateFullyPaid || '';
  const dateFullyPaid = rawDateFullyPaid ? String(rawDateFullyPaid).slice(0, 10) : '';

  // 6. Itemized Expenses & Disbursements
  let expenses: ExpenseItem[] = [];
  if (Array.isArray(raw.expenses)) {
    expenses = raw.expenses.map((e: any, idx: number) => ({
      id: String(e?.id || `exp-${idx}-${Date.now()}`),
      description: String(e?.description || e?.desc || 'Expense Item'),
      amount: Number(e?.amount) || 0
    }));
  } else if (Array.isArray(raw.expenseItems)) {
    expenses = raw.expenseItems.map((e: any, idx: number) => ({
      id: String(e?.id || `exp-${idx}-${Date.now()}`),
      description: String(e?.description || e?.desc || 'Expense Item'),
      amount: Number(e?.amount) || 0
    }));
  } else if (typeof raw.expenses === 'number' && raw.expenses > 0) {
    expenses = [
      {
        id: `exp-legacy-${Date.now()}`,
        description: String(raw.expenseRemarks || 'Liaison & Filing Expenses'),
        amount: raw.expenses
      }
    ];
  }

  return {
    id: String(raw.id || fallbackId || `SEC-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`),
    corporationName,
    filingType,
    status,
    dateAccepted,
    dateStarted,
    dateCompleted: dateCompleted || undefined,
    totalFee,
    initialPayment,
    finalPayment,
    dateFullyPaid: dateFullyPaid || undefined,
    amountPaid,
    isFullyPaid,
    expenses,
    notes: String(raw.notes || raw.remarks || raw.comments || '').trim(),
    createdAt: String(raw.createdAt || new Date().toISOString()),
    updatedAt: String(raw.updatedAt || new Date().toISOString())
  };
}

export function getRecordTotalExpenses(record: any): number {
  if (!record) return 0;
  if (Array.isArray(record.expenses)) {
    return record.expenses.reduce((sum: number, item: any) => sum + (Number(item?.amount) || 0), 0);
  }
  if (Array.isArray(record.expenseItems)) {
    return record.expenseItems.reduce((sum: number, item: any) => sum + (Number(item?.amount) || 0), 0);
  }
  if (typeof record.expenses === 'number') {
    return record.expenses;
  }
  return 0;
}

export function getRecordTotalPaid(record: any): number {
  if (!record) return 0;
  const fee = Number(record.totalFee ?? record.fee ?? 0) || 0;
  if (record.isFullyPaid && fee > 0) {
    const explicitPaid = Number(
      record.amountPaid ?? ((Number(record.initialPayment) || 0) + (Number(record.finalPayment) || 0))
    ) || 0;
    return Math.max(fee, explicitPaid);
  }
  return Number(
    record.amountPaid ?? ((Number(record.initialPayment) || 0) + (Number(record.finalPayment) || 0))
  ) || 0;
}

export function getRecordBalance(record: any): number {
  if (!record) return 0;
  if (record.isFullyPaid) return 0;
  const fee = Number(record.totalFee ?? record.fee ?? 0) || 0;
  const paid = getRecordTotalPaid(record);
  return Math.max(0, fee - paid);
}

export function getRecordNetProfit(record: any): number {
  if (!record) return 0;
  const fee = Number(record.totalFee ?? record.fee ?? 0) || 0;
  const expenses = getRecordTotalExpenses(record);
  return fee - expenses;
}

export function getWeekKey(dateStr?: string): string {
  if (!dateStr) return 'Unknown';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Unknown';
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return `Week ${weekNumber} (${d.getFullYear()})`;
}

export function getMonthKey(dateStr?: string): string {
  if (!dateStr) return 'Unknown';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Unknown';
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function getYearKey(dateStr?: string): string {
  if (!dateStr) return 'Unknown';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Unknown';
  return d.getFullYear().toString();
}

export function exportToCSV(records: SECTransaction[]): void {
  if (!records || records.length === 0) {
    return;
  }

  const headers = [
    'Corporation Name',
    'Transaction Type',
    'Date Accepted & Downpayment',
    'Date Started',
    'Date Completed',
    'Assistance Fee (PHP)',
    'Initial Payment (PHP)',
    'Final Payment (PHP)',
    'Total Paid (PHP)',
    'Date Fully Paid',
    'Balance (PHP)',
    'Payment Status',
    'Total Expenses (PHP)',
    'Itemized Expenses Breakdown',
    'Net Profit (PHP)',
    'Current Status',
    'Notes'
  ];

  const escapeCSV = (value: unknown): string => {
    if (value === null || value === undefined) return '""';
    const stringValue = String(value).replace(/"/g, '""');
    return `"${stringValue}"`;
  };

  const rows = records.map(r => {
    const norm = normalizeRecord(r);
    const totalExpenses = getRecordTotalExpenses(norm);
    const totalPaid = getRecordTotalPaid(norm);
    const balance = getRecordBalance(norm);
    const netProfit = getRecordNetProfit(norm);
    const isPaid = norm.isFullyPaid || balance === 0;
    const expenseBreakdown = (norm.expenses || [])
      .map(e => `${e.description}: ₱${Number(e.amount).toFixed(2)}`)
      .join('; ');

    return [
      escapeCSV(norm.corporationName),
      escapeCSV(norm.filingType),
      escapeCSV(norm.dateAccepted || ''),
      escapeCSV(norm.dateStarted || ''),
      escapeCSV(norm.dateCompleted || ''),
      escapeCSV(norm.totalFee.toFixed(2)),
      escapeCSV((norm.initialPayment ?? norm.amountPaid).toFixed(2)),
      escapeCSV((norm.finalPayment ?? 0).toFixed(2)),
      escapeCSV(totalPaid.toFixed(2)),
      escapeCSV(norm.dateFullyPaid || ''),
      escapeCSV(balance.toFixed(2)),
      escapeCSV(isPaid ? 'Fully Paid' : 'With Balance'),
      escapeCSV(totalExpenses.toFixed(2)),
      escapeCSV(expenseBreakdown),
      escapeCSV(netProfit.toFixed(2)),
      escapeCSV(norm.status),
      escapeCSV(norm.notes || '')
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `SEC_Transactions_Export_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJSONBackup(records: SECTransaction[], isAuto = false): void {
  const normalizedRecords = (records || []).map(r => {
    const norm = normalizeRecord(r);
    // Include both legacy and current field keys so backup is 100% compatible everywhere
    return {
      ...norm,
      corpName: norm.corporationName,
      transType: norm.filingType,
      currentStatus: norm.status,
      fee: norm.totalFee,
      expenseItems: norm.expenses
    };
  });

  const jsonString = JSON.stringify(normalizedRecords, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().slice(0, 10);
  const prefix = isAuto ? 'SEC_Tracker_AutoBackup' : 'SEC_Tracker_Backup';
  link.setAttribute('href', url);
  link.setAttribute('download', `${prefix}_${timestamp}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
