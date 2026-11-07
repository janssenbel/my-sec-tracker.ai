export interface ExpenseItem {
  id: string;
  description: string;
  amount: number;
}

export const STANDARD_STATUSES = [
  'For Preparation of Documents',
  'For Signing of Documents',
  'For Review',
  'For Payment',
  'Approved / For Submission of Hard Copies',
  'Submitted / Awaiting Certificate',
  'Completed',
  'For Compliance of Client'
] as const;

export type TransactionStatus = string;

export interface SECTransaction {
  id: string;
  corporationName: string;
  filingType: string;
  status: string;
  dateAccepted: string;
  dateStarted: string;
  dateCompleted?: string;
  totalFee: number;
  initialPayment?: number;
  finalPayment?: number;
  dateFullyPaid?: string;
  amountPaid: number;
  isFullyPaid: boolean;
  expenses: ExpenseItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type SummaryPeriodType = 'all' | 'weekly' | 'monthly' | 'yearly';

export interface CorporationSummary {
  name: string;
  totalFilings: number;
  activeFilings: number;
  completedFilings: number;
  totalFees: number;
  totalPaid: number;
  balance: number;
  totalExpenses: number;
  netProfit: number;
}

export const SEC_FILING_TYPES = [
  'Registration',
  'Amendment',
  'Increase of Authorized Capital Stock',
  'General Information Sheet (GIS)',
  'MC28 Electronic Mail & Contact Compliance',
  'Audited Financial Statements (AFS) Filing',
  'SEC Certificate of Monitoring & Good Standing',
  'Application for Corporate Dissolution',
  'Notice of Appointment of Officers',
  'Foreign Corporation License & Branch Registration',
  'Petition for Lifting of Suspension / Revocation',
  'Others'
] as const;

export const STANDARD_EXPENSE_PRESETS = [
  'SEC Basic Filing Fee',
  'Legal Research Fee (LRF)',
  'Notarial & Acknowledgment Fee',
  'Liaison & Messenger Service',
  'SEC Certified True Copy (CTC)',
  'Courier & Document Delivery',
  'Documentary Stamp Tax (DST)',
  'Late Filing Penalty Surcharge'
];
