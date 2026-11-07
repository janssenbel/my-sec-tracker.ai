import { SECTransaction } from '../types';

export const INITIAL_RECORDS: SECTransaction[] = [
  {
    id: 'sec-rec-001',
    corporationName: 'Apex Horizon Holdings Inc.',
    filingType: 'General Information Sheet (GIS)',
    trackingNumber: 'SEC-2026-GIS-09412',
    status: 'Completed',
    dateFiled: '2026-10-15',
    targetDate: '2026-10-22',
    dateCompleted: '2026-10-20',
    totalFee: 15000,
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
    filingType: 'Articles of Incorporation & By-Laws Amendment',
    trackingNumber: 'SEC-2026-AMD-44109',
    status: 'In Progress',
    dateFiled: '2026-10-28',
    targetDate: '2026-11-15',
    totalFee: 45000,
    amountPaid: 25000,
    isFullyPaid: false,
    expenses: [
      { id: 'exp-5', description: 'SEC Amendment Filing Fee', amount: 9500 },
      { id: 'exp-6', description: 'Directors Certificate Notarization', amount: 2000 },
      { id: 'exp-7', description: 'SEC CTC Copies (3 sets)', amount: 1500 }
    ],
    notes: 'Amending primary purpose to include renewable solar power solutions. Awaiting SEC examiner review in Secretariat Building.',
    createdAt: '2026-10-28T10:00:00.000Z',
    updatedAt: '2026-11-02T11:20:00.000Z'
  },
  {
    id: 'sec-rec-003',
    corporationName: 'Pacific Blue Shipping & Logistics Inc.',
    filingType: 'MC28 Electronic Mail & Contact Compliance',
    trackingNumber: 'SEC-2026-MC28-11203',
    status: 'Completed',
    dateFiled: '2026-11-01',
    targetDate: '2026-11-05',
    dateCompleted: '2026-11-04',
    totalFee: 8500,
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
    filingType: 'SEC New Corporation Registration',
    trackingNumber: 'SEC-2026-REG-77401',
    status: 'Under Review',
    dateFiled: '2026-11-03',
    targetDate: '2026-11-12',
    totalFee: 38000,
    amountPaid: 18000,
    isFullyPaid: false,
    expenses: [
      { id: 'exp-10', description: 'SEC Registration Fee & By-Laws', amount: 8200 },
      { id: 'exp-11', description: 'Documentary Stamp Tax (DST)', amount: 2500 },
      { id: 'exp-12', description: 'Name Reservation & Legal Research', amount: 750 }
    ],
    notes: 'Incorporation papers submitted via eSPARC portal. Treasurer affidavit notarized; awaiting final SEC digital signature.',
    createdAt: '2026-11-03T13:45:00.000Z',
    updatedAt: '2026-11-05T09:10:00.000Z'
  },
  {
    id: 'sec-rec-005',
    corporationName: 'Golden Harvest Agro-Industrial Ltd.',
    filingType: 'Audited Financial Statements (AFS) Filing',
    trackingNumber: 'EFAST-2026-88124',
    status: 'For Release',
    dateFiled: '2026-10-20',
    targetDate: '2026-11-08',
    totalFee: 22000,
    amountPaid: 12000,
    isFullyPaid: false,
    expenses: [
      { id: 'exp-13', description: 'eFAST Electronic Processing Fee', amount: 2200 },
      { id: 'exp-14', description: 'Auditor Confirmation & Notarization', amount: 1500 },
      { id: 'exp-15', description: 'Courier & Official Transmittal', amount: 650 }
    ],
    notes: 'AFS accepted by BIR and SEC eFAST. Hardcopy stamped received set scheduled for courier pickup at SEC Main Office.',
    createdAt: '2026-10-20T11:00:00.000Z',
    updatedAt: '2026-11-06T15:30:00.000Z'
  },
  {
    id: 'sec-rec-006',
    corporationName: 'Cebu Highlands Eco-Resort Corporation',
    filingType: 'SEC Certificate of Monitoring & Good Standing',
    trackingNumber: 'SEC-2026-MON-33019',
    status: 'Pending',
    dateFiled: '2026-11-05',
    targetDate: '2026-11-20',
    totalFee: 18500,
    amountPaid: 5000,
    isFullyPaid: false,
    expenses: [
      { id: 'exp-16', description: 'SEC Monitoring Clearance Fee', amount: 4500 },
      { id: 'exp-17', description: 'Special Power of Attorney Notarization', amount: 900 }
    ],
    notes: 'Requesting SEC clearance for bank loan collateral and expansion. Monitoring officer verifying past 5 years GIS & AFS compliances.',
    createdAt: '2026-11-05T14:20:00.000Z',
    updatedAt: '2026-11-05T14:20:00.000Z'
  }
];
