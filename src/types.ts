export interface ExpenseItem {
  id: string;
  description: string;
  amount: number;
}

export type TransactionStatus = 
  | 'Pending' 
  | 'In Progress' 
  | 'Under Review' 
  | 'For Release' 
  | 'Completed';

export interface SECTransaction {
  id: string;
  corporationName: string;
  filingType: string;
  trackingNumber: string;
  status: TransactionStatus;
  dateFiled: string;
  targetDate: string;
  dateCompleted?: string;
  totalFee: number;
  amountPaid: number;
  isFullyPaid: boolean;
  expenses: ExpenseItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type SummaryPeriodType = 'weekly' | 'monthly' | 'yearly';

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
  'General Information Sheet (GIS)',
  'MC28 Electronic Mail & Contact Compliance',
  'Articles of Incorporation & By-Laws Amendment',
  'SEC New Corporation Registration',
  'Audited Financial Statements (AFS) Filing',
  'Increase of Authorized Capital Stock',
  'SEC Certificate of Monitoring & Good Standing',
  'Application for Corporate Dissolution',
  'Notice of Appointment of Officers',
  'Foreign Corporation License & Branch Registration',
  'Petition for Lifting of Suspension / Revocation',
  'Other Corporate Compliance Filing'
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
