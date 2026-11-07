import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StatCards } from './components/StatCards';
import { PeriodicSummary } from './components/PeriodicSummary';
import { TransactionTable } from './components/TransactionTable';
import { TransactionModal } from './components/TransactionModal';
import { RecordViewModal } from './components/RecordViewModal';
import { CorporationListModal } from './components/CorporationListModal';
import { INITIAL_RECORDS } from './data/initialRecords';
import { SECTransaction } from './types';
import { 
  exportToCSV, 
  downloadJSONBackup, 
  formatPeso, 
  getRecordBalance 
} from './utils/formatters';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const STORAGE_KEY = 'sec_tracker_records_v1';
const THEME_KEY = 'sec_tracker_theme';
const AUTOBACKUP_KEY = 'sec_tracker_autobackup';

export default function App() {
  // 1. Records state initialized from localStorage
  const [records, setRecords] = useState<SECTransaction[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading stored SEC records:', e);
    }
    return INITIAL_RECORDS;
  });

  // 2. Dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme) {
        return savedTheme === 'dark';
      }
    } catch {}
    return true; // Default dark
  });

  // 3. Auto-backup setting
  const [autoBackup, setAutoBackup] = useState<boolean>(() => {
    try {
      const savedAuto = localStorage.getItem(AUTOBACKUP_KEY);
      if (savedAuto !== null) {
        return savedAuto === 'true';
      }
    } catch {}
    return false; // Default manual unless activated
  });

  // 4. Modal and interaction states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SECTransaction | null>(null);
  const [viewingRecord, setViewingRecord] = useState<SECTransaction | null>(null);
  const [isCorporationsModalOpen, setIsCorporationsModalOpen] = useState(false);
  const [corporationsFilterType, setCorporationsFilterType] = useState<'all' | 'active'>('all');
  const [preselectedCorporation, setPreselectedCorporation] = useState<string | undefined>(undefined);
  
  // Notification toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4000);
  }, []);

  // Sync dark mode class on document
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
      document.body.className = 'bg-slate-950 text-slate-100 antialiased selection:bg-blue-600 selection:text-white';
    } else {
      root.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
      document.body.className = 'bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white';
    }
  }, [darkMode]);

  // Sync auto backup preference
  const handleToggleAutoBackup = (val: boolean) => {
    setAutoBackup(val);
    try {
      localStorage.setItem(AUTOBACKUP_KEY, val.toString());
    } catch {}
    if (val) {
      showToast('Auto-backup activated. Backup downloads will trigger automatically on save.', 'info');
    } else {
      showToast('Auto-backup deactivated. You can still export manual backups anytime.', 'info');
    }
  };

  // Helper to persist records
  const persistRecords = (updated: SECTransaction[], shouldAutoBackup = false) => {
    setRecords(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to write to localStorage:', e);
    }

    if (shouldAutoBackup && autoBackup) {
      setTimeout(() => {
        downloadJSONBackup(updated, true);
      }, 300);
    }
  };

  // Save (Create or Update) Record
  const handleSaveRecord = (record: SECTransaction) => {
    const existingIndex = records.findIndex(r => r.id === record.id);
    let updated: SECTransaction[];
    if (existingIndex >= 0) {
      updated = [...records];
      updated[existingIndex] = record;
      showToast(`Updated transaction for ${record.corporationName}`);
    } else {
      updated = [record, ...records];
      showToast(`Added new transaction for ${record.corporationName}`);
    }

    persistRecords(updated, true);
    
    // Also update viewing record if currently open
    if (viewingRecord && viewingRecord.id === record.id) {
      setViewingRecord(record);
    }
  };

  // Delete Record
  const handleDeleteRecord = (id: string) => {
    const target = records.find(r => r.id === id);
    const company = target?.corporationName || 'this record';
    if (window.confirm(`Are you sure you want to permanently delete the filing for "${company}"?`)) {
      const updated = records.filter(r => r.id !== id);
      persistRecords(updated, true);
      showToast(`Deleted transaction for ${company}`, 'info');
      if (viewingRecord?.id === id) {
        setViewingRecord(null);
      }
    }
  };

  // Quick Settle Balance
  const handleQuickSettle = (id: string) => {
    const target = records.find(r => r.id === id);
    if (!target) return;

    const updated = records.map(r => {
      if (r.id === id) {
        return {
          ...r,
          amountPaid: r.totalFee,
          isFullyPaid: true,
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    });

    persistRecords(updated, true);
    showToast(`Balance for ${target.corporationName} marked as fully settled!`, 'success');

    if (viewingRecord?.id === id) {
      setViewingRecord(prev => (prev ? { ...prev, amountPaid: prev.totalFee, isFullyPaid: true } : null));
    }
  };

  // Restore from JSON
  const handleRestoreBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        let recordsToLoad: SECTransaction[] = [];
        if (Array.isArray(parsed)) {
          recordsToLoad = parsed;
        } else if (parsed && Array.isArray(parsed.records)) {
          recordsToLoad = parsed.records;
        } else {
          throw new Error('Invalid backup file format');
        }

        if (recordsToLoad.length === 0) {
          showToast('The backup file contained no transactions.', 'error');
          return;
        }

        if (window.confirm(`Restore ${recordsToLoad.length} transactions from backup file "${file.name}"? This will replace your current records.`)) {
          persistRecords(recordsToLoad, false);
          showToast(`Successfully restored ${recordsToLoad.length} transactions!`, 'success');
        }
      } catch (err) {
        console.error('Restore error:', err);
        showToast('Failed to parse backup file. Please select a valid SEC Tracker JSON file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Existing unique corporation names for autocomplete suggestions
  const existingCorporations = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => set.add(r.corporationName.trim()));
    return Array.from(set).sort();
  }, [records]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 transition-colors duration-200">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs font-medium text-white transition-all animate-in fade-in slide-in-from-bottom-2">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(prev => !prev)}
        autoBackup={autoBackup}
        onToggleAutoBackup={handleToggleAutoBackup}
        onExportCSV={() => {
          exportToCSV(records);
          showToast('Exported SEC records to CSV');
        }}
        onDownloadBackup={() => {
          downloadJSONBackup(records, false);
          showToast('Downloaded full JSON backup');
        }}
        onRestoreBackup={handleRestoreBackup}
        onOpenNewModal={() => {
          setEditingRecord(null);
          setIsModalOpen(true);
        }}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* KPI Stat Cards */}
        <StatCards
          records={records}
          onOpenCorporationsModal={(filter) => {
            setCorporationsFilterType(filter);
            setIsCorporationsModalOpen(true);
          }}
        />

        {/* Periodic Summary Panel */}
        <PeriodicSummary records={records} />

        {/* Filings Data Table */}
        <TransactionTable
          records={records}
          onViewRecord={(record) => setViewingRecord(record)}
          onEditRecord={(record) => {
            setEditingRecord(record);
            setIsModalOpen(true);
          }}
          onDeleteRecord={handleDeleteRecord}
          onQuickSettle={handleQuickSettle}
          preselectedFilter={preselectedCorporation}
          onClearPreselectedFilter={() => setPreselectedCorporation(undefined)}
        />

      </main>

      {/* Quiet Footer */}
      <footer className="no-print border-t border-slate-800/80 bg-slate-950 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            SEC TRANSACTIONS TRACKER · Offline-First Compliance & Professional Fee Management
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            {records.length} Records Tracked · Standard Philippine SEC Filing Protocol
          </div>
        </div>
      </footer>

      {/* New / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSaveRecord}
        initialRecord={editingRecord}
        existingCorporations={existingCorporations}
      />

      {/* Transaction View & Print Summary Slip Modal */}
      <RecordViewModal
        isOpen={viewingRecord !== null}
        onClose={() => setViewingRecord(null)}
        record={viewingRecord}
        onEdit={(rec) => {
          setEditingRecord(rec);
          setIsModalOpen(true);
        }}
        onQuickSettle={handleQuickSettle}
      />

      {/* Corporations Directory Modal */}
      <CorporationListModal
        isOpen={isCorporationsModalOpen}
        onClose={() => setIsCorporationsModalOpen(false)}
        records={records}
        filterType={corporationsFilterType}
        onSelectCorporation={(corpName) => {
          setPreselectedCorporation(corpName);
          showToast(`Filtered filings by ${corpName}`, 'info');
        }}
      />

    </div>
  );
}
