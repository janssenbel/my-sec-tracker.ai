import { SECTransaction } from '../types';

export const INITIAL_RECORDS: SECTransaction[] = [
  {
    id: 'sec-rec-001',
    corporationName: 'Apex Horizon Holdings Inc.',
    filingType: 'General Information Sheet (GIS)',
    status: 'Completed',
    dateAccepted: '2026-10-15',
    dateStarted: '2026-10-16',
    dateCompleted: '2026-10-20',
    totalFee: 15000,
    initialPayment: 10000,
    finalPayment: 5000,
    dateFullyPaid: '2026-10-20',
    amountPaid: 15000,
    isFullyPaid: true,
    expenses: [
      { id: 'exp-1', description: 'SEC Basic Filing Fee', amount: 3000 },
      { id: 'exp-2', description: 'Legal Research Fee (LRF)', amount: 500 },
      { id: 'exp-3', description: 'Notarial & Acknowledgment', amount: 1200 },
      { id: 'exp-4', description: 'Liaison & Messenger Service', amount: 800 }
    ],
    notes: '2026 Annual GIS submitted through eFAST. Electronic QR acknowledgement received and filed.',
    createdAt: '2026-10-15T08:30:00.000Z',
    updatedAt: '2026-10-20T14:15:00.000Z'
  },
  {
    id: 'sec-rec-002',
    corporationName: 'Luzon Strategic Ventures Corp.',
    filingType: 'Amendment',
    status: 'For Review',
    dateAccepted: '2026-10-28',
    dateStarted: '2026-10-30',
    totalFee: 45000,
    initialPayment: 25000,
    finalPayment: 0,
    amountPaid: 25000,
    isFullyPaid: false,
    expenses: [
      { id: 'exp-5', description: 'SEC Amendment Filing Fee', amount: 9500 },
      { id: 'exp-6', description: 'Directors Certificate Notarization', amount: 2000 },
      { id: 'exp-7', description: 'SEC CTC Copies (3 sets)', amount: 1500 }
    ],
    notes: 'Amending primary purpose to include renewable solar power solutions. Awaiting SEC examiner review.',
    createdAt: '2026-10-28T10:00:00.000Z',
    updatedAt: '2026-11-02T11:20:00.000Z'
  },
  {
    id: 'sec-rec-003',
    corporationName: 'Pacific Blue Shipping & Logistics Inc.',
    filingType: 'MC28 Electronic Mail & Contact Compliance',
    status: 'Completed',
    dateAccepted: '2026-11-01',
    dateStarted: '2026-11-02',
    dateCompleted: '2026-11-04',
    totalFee: 8500,
    initialPayment: 8500,
    finalPayment: 0,
    dateFullyPaid: '2026-11-01',
    amountPaid: 8500,
    isFullyPaid: true,
    expenses: [
      { id: 'exp-8', description: 'Notarized Board Authorization', amount: 800 },
      { id: 'exp-9', description: 'Electronic Portal Submission Processing', amount: 600 }
    ],
    notes: 'MC28 official corporate email and alternate mobile numbers verified and confirmed in SEC MC28 portal.',
    createdAt: '2026-11-01T09:15:00.000Z',
    updatedAt: '2026-11-04T16:00:00.000Z'
  },
  {
    id: 'sec-rec-004',
    corporationName: 'Manila Bay Digital Innovations Corp.',
    filingType: 'Registration',
    status: 'Approved / For Submission of Hard Copies',
    dateAccepted: '2026-11-03',
    dateStarted: '2026-11-04',
    totalFee: 38000,
    initialPayment: 18000,
    finalPayment: 0,
    amountPaid: 18000,
    isFullyPaid: false,
    expenses: [
      { id: 'exp-10', description: 'SEC Registration Fee & By-Laws', amount: 8200 },
      { id: 'exp-11', description: 'Documentary Stamp Tax (DST)', amount: 2500 },
      { id: 'exp-12', description: 'Name Reservation & Legal Research', amount: 750 }
    ],
    notes: 'Incorporation papers approved via eSPARC portal. Preparing hard copies for submission.',
    createdAt: '2026-11-03T13:45:00.000Z',
    updatedAt: '2026-11-05T09:10:00.000Z'
  },
  {
    id: 'sec-rec-005',
    corporationName: 'Golden Harvest Agro-Industrial Ltd.',
    filingType: 'Increase of Authorized Capital Stock',
    status: 'Submitted / Awaiting Certificate',
    dateAccepted: '2026-10-20',
    dateStarted: '2026-10-22',
    totalFee: 22000,
    initialPayment: 12000,
    finalPayment: 0,
    amountPaid: 12000,
    isFullyPaid: false,
    expenses: [
      { id: 'exp-13', description: 'SEC Filing & Processing Fee', amount: 2200 },
      { id: 'exp-14', description: 'Auditor Confirmation & Notarization', amount: 1500 },
      { id: 'exp-15', description: 'Courier & Official Transmittal', amount: 650 }
    ],
    notes: 'Hardcopies submitted to SEC Main Office; awaiting release of Certificate of Approval of Increase of Capital Stock.',
    createdAt: '2026-10-20T11:00:00.000Z',
    updatedAt: '2026-11-06T15:30:00.000Z'
  },
  {
    id: 'sec-rec-006',
    corporationName: 'Cebu Highlands Eco-Resort Corporation',
    filingType: 'SEC Certificate of Monitoring & Good Standing',
    status: 'For Preparation of Documents',
    dateAccepted: '2026-11-05',
    dateStarted: '2026-11-06',
    totalFee: 18500,
    initialPayment: 5000,
    finalPayment: 0,
    amountPaid: 5000,
    isFullyPaid: false,
    expenses: [
      { id: 'exp-16', description: 'SEC Monitoring Clearance Fee', amount: 4500 },
      { id: 'exp-17', description: 'Special Power of Attorney Notarization', amount: 900 }
    ],
    notes: 'Requesting SEC clearance for bank loan collateral and expansion. Preparing past 5 years GIS & AFS compliance folders.',
    createdAt: '2026-11-05T14:20:00.000Z',
    updatedAt: '2026-11-05T14:20:00.000Z'
  }
];
