import { SECTransaction } from '../types';

export function formatPeso(amount: number): string {
  const safeAmount = isNaN(amount) ? 0 : amount;
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(safeAmount);
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function getRecordTotalExpenses(record: SECTransaction): number {
  if (!record.expenses || !Array.isArray(record.expenses)) return 0;
  return record.expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
}

export function getRecordBalance(record: SECTransaction): number {
  const fee = Number(record.totalFee) || 0;
  const paid = Number(record.amountPaid) || 0;
  return Math.max(0, fee - paid);
}

export function getRecordNetProfit(record: SECTransaction): number {
  const fee = Number(record.totalFee) || 0;
  const expenses = getRecordTotalExpenses(record);
  return fee - expenses;
}

export function getWeekKey(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Unknown';
  // ISO week calculation
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

export function getMonthKey(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Unknown';
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function getYearKey(dateStr: string): string {
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
    const totalExpenses = getRecordTotalExpenses(r);
    const balance = getRecordBalance(r);
    const netProfit = getRecordNetProfit(r);
    const expenseBreakdown = (r.expenses || [])
      .map(e => `${e.description}: ₱${Number(e.amount).toFixed(2)}`)
      .join('; ');

    return [
      escapeCSV(r.id),
      escapeCSV(r.corporationName),
      escapeCSV(r.filingType),
      escapeCSV(r.trackingNumber),
      escapeCSV(r.status),
      escapeCSV(r.dateFiled),
      escapeCSV(r.targetDate),
      escapeCSV(r.dateCompleted || 'N/A'),
      escapeCSV(r.totalFee.toFixed(2)),
      escapeCSV(r.amountPaid.toFixed(2)),
      escapeCSV(balance.toFixed(2)),
      escapeCSV(totalExpenses.toFixed(2)),
      escapeCSV(netProfit.toFixed(2)),
      escapeCSV(expenseBreakdown),
      escapeCSV(r.notes || '')
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
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    application: 'SEC Transactions Tracker',
    isAutoBackup: isAuto,
    totalCount: records.length,
    records
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
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
