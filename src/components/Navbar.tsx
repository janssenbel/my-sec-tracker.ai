import React, { useRef } from 'react';
import { 
  Building2, 
  Sun, 
  Moon, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  Plus, 
  ShieldCheck,
  CheckCircle2,
  HardDrive
} from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  autoBackup: boolean;
  onToggleAutoBackup: (value: boolean) => void;
  onExportCSV: () => void;
  onDownloadBackup: () => void;
  onRestoreBackup: (file: File) => void;
  onOpenNewModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleTheme,
  autoBackup,
  onToggleAutoBackup,
  onExportCSV,
  onDownloadBackup,
  onRestoreBackup,
  onOpenNewModal
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onRestoreBackup(file);
      // Reset input value so same file can be re-selected if needed
      e.target.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 dark:bg-slate-950/95 border-b border-slate-800 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand & Emblem */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-5 h-5 text-blue-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
                  SEC TRANSACTIONS TRACKER
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                  <ShieldCheck className="w-3 h-3" /> Offline Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                Corporate Compliance · Filings Ledger · Fee Balances · Itemized Expenses
              </p>
            </div>
          </div>

          {/* Controls & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Auto-backup Toggle */}
            <label 
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 hover:bg-slate-800 text-xs font-medium text-slate-200 cursor-pointer transition-colors"
              title="Automatically triggers a JSON backup download whenever you save, edit, or remove a transaction"
            >
              <input
                type="checkbox"
                checked={autoBackup}
                onChange={(e) => onToggleAutoBackup(e.target.checked)}
                className="rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900 w-3.5 h-3.5 cursor-pointer"
              />
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              <span className="whitespace-nowrap">Auto-Backup</span>
              {autoBackup && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </label>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-2 text-slate-300 hover:text-white rounded-lg bg-slate-800/70 border border-slate-700 hover:bg-slate-800 transition-colors"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle visual theme"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-blue-300" />
              )}
            </button>

            {/* Export CSV */}
            <button
              type="button"
              onClick={onExportCSV}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors whitespace-nowrap"
              title="Export all records to Excel CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV</span>
            </button>

            {/* Backup JSON */}
            <button
              type="button"
              onClick={onDownloadBackup}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors whitespace-nowrap"
              title="Download manual JSON backup file"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Backup</span>
            </button>

            {/* Restore JSON */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors whitespace-nowrap"
              title="Import JSON backup file"
            >
              <Upload className="w-3.5 h-3.5 text-purple-400" />
              <span>Restore</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />

            {/* Primary Action: New Transaction */}
            <button
              type="button"
              onClick={onOpenNewModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 active:scale-[0.98] transition-all shadow-md shadow-blue-600/30 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Transaction</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
