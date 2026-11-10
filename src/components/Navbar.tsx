import React, { useRef, useState } from 'react';
import { 
  Sun, 
  Moon, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  Plus, 
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Smartphone,
  Share,
  X
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

const BookPencilLogo: React.FC<{ className?: string }> = ({ className = 'w-9 h-9 sm:w-10 sm:h-10 rounded-xl' }) => (
  <div
    className={`${className} bg-gradient-to-br from-sky-400 via-sky-500 to-blue-500 flex items-center justify-center shadow-md shadow-sky-500/25 border border-sky-300/40 shrink-0 overflow-hidden`}
  >
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-7 h-7 sm:w-8 sm:h-8"
      aria-hidden="true"
    >
      {/* Book Drop Shadow */}
      <rect x="11" y="12" width="34" height="42" rx="5" fill="#0284c7" fillOpacity="0.35" />
      {/* White Book Body */}
      <rect x="10" y="10" width="34" height="42" rx="5" fill="#FFFFFF" />
      {/* Book Spine Line */}
      <line x1="16.5" y1="10.5" x2="16.5" y2="51.5" stroke="#38bdf8" strokeWidth="1.8" />
      {/* Bottom Page Edge Highlight */}
      <rect x="14" y="47.5" width="27" height="2" rx="1" fill="#bae6fd" />
      {/* Writing Lines on Book */}
      <line x1="20.5" y1="20" x2="38.5" y2="20" stroke="#0ea5e9" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="20.5" y1="26" x2="38.5" y2="26" stroke="#0ea5e9" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="20.5" y1="32" x2="34.5" y2="32" stroke="#0ea5e9" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="20.5" y1="38" x2="30.5" y2="38" stroke="#0ea5e9" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="20.5" y1="44" x2="27.5" y2="44" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />

      {/* Pencil Writing on Book (Rotated -45 deg around tip at 31, 38) */}
      <g transform="translate(31, 38) rotate(-45)">
        {/* Light Blue Halo Outline around Pencil */}
        <path
          d="M-1.5 0 L6.5 -4.8 L27 -4.8 C28.5 -4.8 29.5 -3.6 29.5 -2.2 L29.5 2.2 C29.5 3.6 28.5 4.8 27 4.8 L6.5 4.8 Z"
          fill="#0ea5e9"
        />
        {/* White Pencil Shaft */}
        <rect x="6.5" y="-3.3" width="16.5" height="6.6" rx="0.8" fill="#FFFFFF" />
        {/* Shaft Center Ridge */}
        <line x1="7.5" y1="0" x2="22" y2="0" stroke="#bae6fd" strokeWidth="1.1" />
        {/* Ferrule Band */}
        <rect x="23" y="-3.3" width="2.2" height="6.6" fill="#7dd3fc" />
        {/* White Eraser Cap */}
        <path
          d="M25.2 -3.3 L27.2 -3.3 C28.1 -3.3 28.8 -2.5 28.8 -1.5 L28.8 1.5 C28.8 2.5 28.1 3.3 27.2 3.3 L25.2 3.3 Z"
          fill="#FFFFFF"
        />
        {/* White Pencil Cone */}
        <polygon points="0,0 6.5,-3.3 6.5,3.3" fill="#FFFFFF" />
        {/* Graphite Writing Nib */}
        <polygon points="0,0 2.8,-1.45 2.8,1.45" fill="#0284c7" />
      </g>
    </svg>
  </div>
);

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
  const mobileFileInputRef = useRef<HTMLInputElement>(null);
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onRestoreBackup(file);
      e.target.value = '';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-slate-900/95 dark:bg-slate-950/95 border-b border-slate-800 backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          
          {/* Main Top Row */}
          <div className="flex items-center justify-between h-15 sm:h-16 gap-2 sm:gap-4">
            
            {/* Brand & Emblem */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <BookPencilLogo className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl" />
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-white whitespace-nowrap">
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

            {/* Desktop Actions (md and up) */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3 shrink-0">
              
              {/* PWA Install Trigger: Desktop / Android */}
              {!isInstalled && isInstallable && (
                <button
                  type="button"
                  onClick={install}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:text-white hover:bg-blue-600 transition-colors text-xs font-semibold"
                  title="Install SEC Tracker as a standalone app"
                >
                  <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                  <span className="whitespace-nowrap">Install App</span>
                </button>
              )}

              {/* Auto-backup Toggle */}
              <label 
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 hover:bg-slate-800 text-xs font-medium text-slate-200 cursor-pointer transition-colors"
                title="Automatically downloads a fresh backup file every time you save or edit a transaction"
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
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors whitespace-nowrap"
                title="Export table to Excel CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>CSV</span>
              </button>

              {/* Backup JSON */}
              <button
                type="button"
                onClick={onDownloadBackup}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors whitespace-nowrap"
                title="Manually export full JSON backup file"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Backup</span>
              </button>

              {/* Restore JSON */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors whitespace-nowrap"
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
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 active:scale-[0.98] transition-all shadow-md shadow-blue-600/30 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>+ New Transaction</span>
              </button>

            </div>

            {/* Mobile Top Controls (Right side: Theme + Primary New button) */}
            <div className="flex md:hidden items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={onToggleTheme}
                className="p-2 text-slate-300 hover:text-white rounded-lg bg-slate-800/80 border border-slate-700 transition-colors"
                title="Toggle visual theme"
                aria-label="Toggle theme"
              >
                {darkMode ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-blue-300" />
                )}
              </button>

              <button
                type="button"
                onClick={onOpenNewModal}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-500 active:scale-[0.98] shadow-sm whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ New</span>
              </button>
            </div>

          </div>

          {/* Mobile Secondary Action Strip (Visible on iPhone / small screens) */}
          <div className="flex md:hidden items-center justify-between gap-1.5 py-2 border-t border-slate-800/70 overflow-x-auto no-scrollbar">
            
            {/* CSV Export Button */}
            <button
              type="button"
              onClick={onExportCSV}
              className="flex-1 min-w-[70px] inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-slate-800/90 border border-slate-700/80 text-[11px] font-semibold text-slate-200 active:bg-slate-700 transition-colors whitespace-nowrap"
              title="Export to Excel CSV"
            >
              <FileSpreadsheet className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>CSV</span>
            </button>

            {/* Download Backup Button */}
            <button
              type="button"
              onClick={onDownloadBackup}
              className="flex-1 min-w-[75px] inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-slate-800/90 border border-slate-700/80 text-[11px] font-semibold text-slate-200 active:bg-slate-700 transition-colors whitespace-nowrap"
              title="Download JSON backup"
            >
              <Download className="w-3 h-3 text-blue-400 shrink-0" />
              <span>Backup</span>
            </button>

            {/* Restore Backup Button */}
            <button
              type="button"
              onClick={() => mobileFileInputRef.current?.click()}
              className="flex-1 min-w-[75px] inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-slate-800/90 border border-slate-700/80 text-[11px] font-semibold text-slate-200 active:bg-slate-700 transition-colors whitespace-nowrap"
              title="Restore from JSON backup"
            >
              <Upload className="w-3 h-3 text-purple-400 shrink-0" />
              <span>Restore</span>
            </button>
            <input
              type="file"
              ref={mobileFileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />

            {/* Auto-backup toggle on mobile */}
            <label 
              className="flex-1 min-w-[95px] inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-800/90 border border-slate-700/80 text-[11px] font-semibold text-slate-200 cursor-pointer active:bg-slate-700 transition-colors whitespace-nowrap"
              title="Auto-backup toggle"
            >
              <input
                type="checkbox"
                checked={autoBackup}
                onChange={(e) => onToggleAutoBackup(e.target.checked)}
                className="rounded border-slate-600 bg-slate-900 text-blue-500 w-3 h-3 cursor-pointer shrink-0"
              />
              <span className="text-[10px]">Auto-Save</span>
            </label>

            {/* iOS Install trigger if on iPhone and not installed */}
            {!isInstalled && isIOS && (
              <button
                type="button"
                onClick={() => setShowIOSGuide(true)}
                className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-blue-600/20 border border-blue-500/40 text-[11px] font-semibold text-blue-300 active:bg-blue-600 transition-colors whitespace-nowrap"
                title="Add to Home Screen"
              >
                <Smartphone className="w-3 h-3 text-blue-400 shrink-0" />
                <span>Install</span>
              </button>
            )}

            {/* Chromium install trigger if installable on mobile */}
            {!isInstalled && isInstallable && !isIOS && (
              <button
                type="button"
                onClick={install}
                className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-blue-600/20 border border-blue-500/40 text-[11px] font-semibold text-blue-300 active:bg-blue-600 transition-colors whitespace-nowrap"
                title="Install App"
              >
                <Smartphone className="w-3 h-3 text-blue-400 shrink-0" />
                <span>Install</span>
              </button>
            )}

          </div>

        </div>
      </header>

      {/* iOS Safari Home Screen Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BookPencilLogo className="w-8 h-8 rounded-lg" />
                <h3 className="text-sm font-bold text-white">Add to iPhone / iPad</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-300">
              <p className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold shrink-0">1</span>
                <span>Tap the <strong className="text-white">Share</strong> button <Share className="w-3.5 h-3.5 inline text-blue-400" /> in Safari&apos;s bottom toolbar.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold shrink-0">2</span>
                <span>Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold shrink-0">3</span>
                <span>Tap <strong className="text-white">Add</strong> in the top-right corner. The SEC Tracker icon will appear on your Home Screen!</span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 text-xs font-semibold text-white transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
