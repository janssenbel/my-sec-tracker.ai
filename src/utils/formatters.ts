import { SECTransaction, TransactionStatus, ExpenseItem } from '../types';

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
  if (!dateStr || typeof dateStr !== 'string') return '—';
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
 * Universal record normalizer that converts any legacy or current record
 * into a safe, valid SECTransaction object without throwing runtime errors.
 */
export function normalizeRecord(raw: any, fallbackId?: string): SECTransaction {
  if (!raw || typeof raw !== 'object') {
    return {
      id: fallbackId || `sec-${Date.now()}`,
      corporationName: 'Unknown Corporation',
      filingType: 'General Compliance Filing',
      trackingNumber: `SEC-${Date.now()}`,
      status: 'Pending',
      dateFiled: new Date().toISOString().slice(0, 10),
      targetDate: new Date().toISOString().slice(0, 10),
      totalFee: 0,
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
    raw.filingType || raw.transType || raw.transactionType || raw.type || 'General Compliance Filing'
  ).trim();

  // 3. Tracking number mapping
  const trackingNumber = String(
    raw.trackingNumber || raw.tracking || raw.ref || raw.referenceNumber || `SEC-${raw.id || Date.now()}`
  ).trim();

  // 4. Status mapping
  const rawStatus = String(raw.status || raw.currentStatus || 'In Progress').trim();
  let status: TransactionStatus = 'In Progress';
  if (/complete|done|finish/i.test(rawStatus)) {
    status = 'Completed';
  } else if (/review/i.test(rawStatus)) {
    status = 'Under Review';
  } else if (/release/i.test(rawStatus)) {
    status = 'For Release';
  } else if (/pending/i.test(rawStatus)) {
    status = 'Pending';
  } else {
    status = 'In Progress';
  }

  // 5. Dates
  const today = new Date().toISOString().slice(0, 10);
  const dateFiled = String(raw.dateFiled || raw.dateAccepted || raw.dateStarted || today).slice(0, 10);
  const targetDate = String(
    raw.targetDate || raw.dateTarget || raw.targetCompletion || raw.dateCompleted || raw.dateStarted || today
  ).slice(0, 10);
  const dateCompleted = raw.dateCompleted || raw.finishedDate || raw.dateFullyPaid || undefined;

  // 6. Fees and Collections
  const totalFee = Number(raw.totalFee ?? raw.fee ?? raw.assistanceFee ?? 0) || 0;
  let amountPaid = Number(raw.amountPaid);
  if (isNaN(amountPaid)) {
    const initial = Number(raw.initialPayment) || 0;
    const finalPay = Number(raw.finalPayment) || 0;
    amountPaid = initial + finalPay;
  }
  if (isNaN(amountPaid)) amountPaid = 0;

  const isFullyPaid = Boolean(
    raw.isFullyPaid ||
    (raw.balance !== undefined && Number(raw.balance) === 0 && totalFee > 0) ||
    (totalFee > 0 && amountPaid >= totalFee)
  );

  // If marked fully paid but amountPaid < totalFee, sync amountPaid
  if (isFullyPaid && amountPaid < totalFee) {
    amountPaid = totalFee;
  }

  // 7. Itemized Expenses & Disbursements
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
    id: String(raw.id || fallbackId || `sec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`),
    corporationName,
    filingType,
    trackingNumber,
    status,
    dateFiled,
    targetDate,
    dateCompleted: dateCompleted ? String(dateCompleted).slice(0, 10) : undefined,
    totalFee,
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

export function getRecordBalance(record: any): number {
  if (!record) return 0;
  if (record.isFullyPaid) return 0;
  const fee = Number(record.totalFee ?? record.fee ?? 0) || 0;
  const paid = Number(record.amountPaid ?? ((Number(record.initialPayment) || 0) + (Number(record.finalPayment) || 0))) || 0;
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
    'Record ID',
    'Corporation / Entity Name',
    'Filing / Transaction Type',
    'Tracking / Ref Number',
    'Status',
    'Date Filed',
    'Target Date',
    'Date Completed',
    'Total Service Fee (PHP)',
    'Amount Paid (PHP)',
    'Uncollected Balance (PHP)',
    'Total Expenses (PHP)',
    'Net Margin / Profit (PHP)',
    'Itemized Expenses Breakdown',
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
    const balance = getRecordBalance(norm);
    const netProfit = getRecordNetProfit(norm);
    const expenseBreakdown = (norm.expenses || [])
      .map(e => `${e.description}: ₱${Number(e.amount).toFixed(2)}`)
      .join('; ');

    return [
      escapeCSV(norm.id),
      escapeCSV(norm.corporationName),
      escapeCSV(norm.filingType),
      escapeCSV(norm.trackingNumber),
      escapeCSV(norm.status),
      escapeCSV(norm.dateFiled),
      escapeCSV(norm.targetDate),
      escapeCSV(norm.dateCompleted || 'N/A'),
      escapeCSV(norm.totalFee.toFixed(2)),
      escapeCSV(norm.amountPaid.toFixed(2)),
      escapeCSV(balance.toFixed(2)),
      escapeCSV(totalExpenses.toFixed(2)),
      escapeCSV(netProfit.toFixed(2)),
      escapeCSV(expenseBreakdown),
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
  const normalizedRecords = (records || []).map(r => normalizeRecord(r));
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    application: 'SEC Transactions Tracker',
    isAutoBackup: isAuto,
    totalCount: normalizedRecords.length,
    records: normalizedRecords
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const prefix = isAuto ? 'SEC_AutoBackup' : 'SEC_Transactions_Backup';
  link.setAttribute('href', url);
  link.setAttribute('download', `${prefix}_${timestamp}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
