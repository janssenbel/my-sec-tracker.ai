# SEC Transactions Tracker (Modernized 1-to-1 Recreation)

A robust, offline-first corporate compliance and filing management dashboard tailored for Philippine SEC (Securities and Exchange Commission) transactions, tracking corporation records, filing stages, payment balances, itemized expenses, net profit, and periodic reporting.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions reflect your confirmed survey choices and preserve all features from the original `my-sectracker-app`:

- **Confirmed Mode & Fidelity**: Faithful 1-to-1 feature parity with modern React 19, TypeScript, and Tailwind CSS v4, improving visual balance, touch ergonomics, and responsiveness while retaining the exact calculation logic and workflow speed.
- **Confirmed Offline Storage**: 100% offline-ready client architecture utilizing local storage with instant auto-backup triggers, manual JSON export/import restore, and CSV data export for spreadsheet integration without requiring internet connectivity.
- **Currency & Locale**: Standardized Philippine Peso (`₱`) formatting across all financial totals, fee balances, itemized expenses, and printable slips.
- **Dual-Theme Support**: Dark mode (`#090e1a` deep navy) and clean light mode with persistent preference and seamless `@custom-variant dark` support.

---

### 1. Overview & Core Concept

- **What It Does**: Facilitates corporate secretaries, legal compliance officers, and liaison service providers in logging and managing SEC filings (GIS, MC28, Registration, AFS, Amendments, Monitoring/Clearances). It tracks client payment collections, calculates uncollected balances, logs itemized liaison/processing expenses, and computes net earnings.
- **Target Audience**: Corporate secretarial firms, accountants, legal liaisons, and compliance managers handling multiple corporations and filing deadlines.
- **Key Value**: Eliminates lost filing deadlines and uncollected fees with automated financial calculations, deadline visibility, instant printable transaction receipts, and zero-latency offline performance.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Dashboard & Metric Overview**: Users see high-level KPI cards (Total Records, In Progress / Pending, Completed, Total Uncollected Balance, Total Expenses) and a Periodic Summary panel (Weekly / Monthly / Yearly breakdown).
2. **Transaction Entry & Editing**: Modal form capturing:
   - Corporation / Entity Name
   - Transaction / Filing Type (SEC Registration, Annual GIS, MC28 Compliance, AFS, Articles Amendment, Increase of Capital, Monitoring / Clearance, Dissolution, etc.)
   - Status (Pending, In Progress, Under Review, For Release, Completed)
   - Tracking / SEC Express / eFAST Reference Number
   - Filing Date, Target Completion Date, Date Completed
   - Financial breakdown: Total Service / Filing Fee (`₱`), Downpayment / Paid (`₱`), auto-calculated Balance (`₱`), and "Fully Paid" quick-toggle.
   - Dynamic Itemized Expenses: Add/remove expense rows with custom descriptions (SEC filing fee, courier, notarization, certified true copies) and amounts.
   - Live Net Profit display (`Fee - Total Expenses`).
3. **Transaction Details & Summary Slip**: Comprehensive view modal showing client details, timeline, itemized expense ledger, payment history, and a one-click "Print Summary Slip" generating a formatted, printer-ready receipt.
4. **Quick Settle Action**: One-click settlement directly from the record row or view modal to mark remaining balance as paid.
5. **Data Management & Backup**:
   - Toggleable "Auto-Backup" that triggers fresh backup downloads upon transaction save/update.
   - Manual "Export JSON Backup" and "Restore from JSON" with validation.
   - "Export to CSV" formatted for Excel reporting.
   - Filterable table with live search across company names and tracking numbers.

#### Visual Identity & Theme
- **Aesthetic Direction**: Utilitarian, crisp, high-density financial dashboard.
- **Color Palette**:
  - *Dark Canvas*: `#090e1a` (deep slate navy base) with `#0f172a` card surfaces and `#1e293b` borders.
  - *Light Canvas*: `#f8fafc` crisp neutral with `#ffffff` cards and `#e2e8f0` borders.
  - *Accents*: `#2563eb` (primary blue), `#16a34a` (completed / paid), `#d97706` (in progress / warning), `#dc2626` (uncollected balance).
- **Typography**: Clean sans-serif headings with tabular monospace figures (`tabular-nums`, `font-mono`) for all monetary amounts (`₱`) and dates to ensure visual alignment.
- **Anti-Slop Discipline**: Clean unboxed metadata badges, no decorative pulsing dots, no fake telemetry, single-elevation card depth, and standard human-readable action labels.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Storage Layer Architecture**
  - *Chosen Approach*: Reactive local state backed by `localStorage` with JSON import/export and CSV export.
  - *Why*: Satisfies the strict requirement to work seamlessly without internet, zero latency, and zero dependency on remote servers, while preserving user ownership through backup files.
  - *Alternative Considered*: Remote cloud database — rejected to fulfill the user's explicit preference for offline capability.

- **Decision 2: Dynamic Expense Breakdown & Financial Computation**
  - *Chosen Approach*: Embedded array of `{ id, description, amount }` within each transaction record, with pure functional recalculation for balance and net profit.
  - *Why*: Accurately reflects how corporate filing services operate (charging a flat service fee while incurring variable government fees, notarization, and courier expenses).

- **Decision 3: Print Optimization**
  - *Chosen Approach*: Dedicated CSS print media styling for the Transaction Summary Slip, hiding navigation bars, toolbars, and background cards during browser print dialog.
  - *Why*: Allows liaisons and accountants to hand physical or PDF filing receipts directly to corporate clients.

---

### 4. Technical Architecture & Data Strategy

```
┌───────────────────────────────────────────────────────────────────┐
│                    SEC Transactions Tracker                       │
├───────────────────────────────────────────────────────────────────┤
│ Top Bar: Brand, Search Bar, Auto-Backup Toggle, Theme & Data Tools│
│ [Auto-Backup]  [Export CSV]  [Backup JSON]  [Restore]  [+ Record] │
└─────────────────┬─────────────────────────────────┬───────────────┘
                  │                                 │
┌─────────────────▼──────────────┐   ┌──────────────▼───────────────┐
│     Global Metric Cards        │   │    Periodic Summary Panel    │
│  Records · Pending · Completed │   │   Weekly / Monthly / Yearly  │
│  Uncollected · Total Expenses  │   │   Revenue / Expenses / Net   │
└─────────────────┬──────────────┘   └──────────────┬───────────────┘
                  │                                 │
┌─────────────────▼─────────────────────────────────▼───────────────┐
│                   Transactions Data Table                         │
│  Filter Tabs (All / In Progress / Completed) & Quick Search Bar  │
│  Company · Type · Tracking · Balance · Status · Settle · Actions  │
└─────────────────┬─────────────────────────────────┬───────────────┘
                  │                                 │
┌─────────────────▼──────────────┐   ┌──────────────▼───────────────┐
│   Record Editor / Modal Form   │   │ Record View & Summary Slip   │
│  Company, Filing, Dates, Fees  │   │ Full Audit Details, Expenses │
│  Itemized Expense Rows, Profit │   │ [Print Slip]  [Quick Settle] │
└────────────────────────────────┴──────────────────┴───────────────┘
```

#### Data Model (`SECTransaction`)
```typescript
interface ExpenseItem {
  id: string;
  description: string;
  amount: number;
}

interface SECTransaction {
  id: string;
  corporationName: string;
  filingType: string; // e.g. "General Information Sheet (GIS)", "MC28 Compliance", "Articles Amendment", etc.
  trackingNumber: string;
  status: 'Pending' | 'In Progress' | 'Under Review' | 'For Release' | 'Completed';
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
```

#### Initial Seed Data
Includes authentic sample SEC corporate transactions (e.g., Annual GIS filings, MC28 contact registration, SEC Certificate of Good Standing, Articles of Incorporation Amendment) so the application displays populated metrics upon launch.
