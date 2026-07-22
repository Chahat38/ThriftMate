import React, { useState } from 'react';
import { X, Save, RefreshCw, Download, Upload, Wallet, Globe, CheckCircle2 } from 'lucide-react';
import { BudgetConfig, Expense } from '../types';
import { exportDataAsJson, SAMPLE_EXPENSES } from '../lib/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: BudgetConfig;
  onSaveBudget: (budget: BudgetConfig) => void;
  expenses: Expense[];
  onResetExpenses: (newExpenses: Expense[]) => void;
}

const CURRENCIES = [
  { symbol: 'Rs.', code: 'PKR', label: 'Pakistani Rupee (Rs.)' },
  { symbol: '₹', code: 'INR', label: 'Indian Rupee (₹)' },
  { symbol: '$', code: 'USD', label: 'Dollar ($)' },
  { symbol: '€', code: 'EUR', label: 'Euro (€)' },
  { symbol: '£', code: 'GBP', label: 'Pound (£)' },
  { symbol: 'AED', code: 'AED', label: 'Dirham (AED)' },
  { symbol: 'SAR', code: 'SAR', label: 'Riyal (SAR)' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  budget,
  onSaveBudget,
  expenses,
  onResetExpenses,
}) => {
  const [monthlyBudget, setMonthlyBudget] = useState(budget.monthlyBudget);
  const [currencySymbol, setCurrencySymbol] = useState(budget.currencySymbol);
  const [currencyCode, setCurrencyCode] = useState(budget.currencyCode);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveBudget({
      monthlyBudget: Number(monthlyBudget) || 10000,
      currencySymbol,
      currencyCode
    });
    setToastMessage('Budget settings updated successfully!');
    setTimeout(() => {
      setToastMessage(null);
      onClose();
    }, 1000);
  };

  const handleExportData = () => {
    const jsonStr = exportDataAsJson(budget, expenses);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ration-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.budget && Array.isArray(parsed.expenses)) {
          onSaveBudget(parsed.budget);
          onResetExpenses(parsed.expenses);
          alert(`Successfully imported ${parsed.expenses.length} expenses and budget settings!`);
          onClose();
        } else {
          alert('Invalid backup JSON format.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetToSample = () => {
    if (confirm('Reset expense tracker with sample ration data? This will overwrite existing expenses.')) {
      onResetExpenses(SAMPLE_EXPENSES);
      setToastMessage('Reset to sample expenses.');
      setTimeout(() => setToastMessage(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-indigo-600" />
            Tracker Settings & Budget
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          {toastMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Monthly Budget Setting */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
              Monthly Budget Allowance
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Monthly Budget Amount
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-indigo-600" />
                  Currency
                </label>
                <select
                  value={currencySymbol}
                  onChange={(e) => {
                    const sel = CURRENCIES.find((c) => c.symbol === e.target.value);
                    if (sel) {
                      setCurrencySymbol(sel.symbol);
                      setCurrencyCode(sel.code);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer font-semibold"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.symbol}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Data Backup & Reset */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
              Data Backup & Controls
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExportData}
                className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs p-3 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                <span>Export Backup JSON</span>
              </button>

              <label className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs p-3 rounded-lg border border-slate-200 transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>Import Backup JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={handleResetToSample}
              className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium text-xs p-2.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset to Sample Data</span>
            </button>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
