import React from 'react';
import { ShoppingBag, LayoutDashboard, ReceiptText, Sparkles, Settings, Plus, Wallet } from 'lucide-react';
import { BudgetConfig, formatPKR } from '../types';

interface HeaderProps {
  activeTab: 'dashboard' | 'expenses' | 'ai-analyzer' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'expenses' | 'ai-analyzer' | 'settings') => void;
  onOpenAddModal: () => void;
  budget: BudgetConfig;
  totalSpent: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  budget,
  totalSpent
}) => {
  const remaining = budget.monthlyBudget - totalSpent;
  const percentage = Math.min(100, Math.round((totalSpent / (budget.monthlyBudget || 1)) * 100));
  const isOverBudget = remaining < 0;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
              <ShoppingBag className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 font-sans">ThriftMate</h1>
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Pakistani Ration IQ
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Smart Household Grocery & Budget Tracker</p>
            </div>
          </div>

          {/* Center Nav Items */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'expenses'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <ReceiptText className="w-4 h-4" />
              Expenses List
            </button>

            <button
              onClick={() => setActiveTab('ai-analyzer')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'ai-analyzer'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              AI Grocery Parser
            </button>
          </nav>

          {/* Right Action buttons & Budget Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick budget status badge */}
            <div 
              onClick={() => setActiveTab('settings')}
              className={`hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-semibold cursor-pointer transition-colors ${
                isOverBudget 
                  ? 'bg-rose-50 border-rose-200 text-rose-700' 
                  : percentage > 85 
                  ? 'bg-amber-50 border-amber-200 text-amber-700' 
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-slate-500">Remaining:</span>
              <span className={`font-bold ${isOverBudget ? 'text-rose-600' : 'text-slate-900'}`}>
                {formatPKR(Math.abs(remaining), budget.currencySymbol)}
                {isOverBudget && ' over'}
              </span>
            </div>

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-md shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Expense</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`p-2 rounded-md border transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title="Settings & Budget"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden border-t border-slate-200 py-2 justify-around text-xs bg-slate-50">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-md ${
              activeTab === 'dashboard' ? 'text-indigo-600 font-bold bg-white border border-slate-200 shadow-xs' : 'text-slate-600'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-md ${
              activeTab === 'expenses' ? 'text-indigo-600 font-bold bg-white border border-slate-200 shadow-xs' : 'text-slate-600'
            }`}
          >
            <ReceiptText className="w-4 h-4" />
            Expenses
          </button>
          <button
            onClick={() => setActiveTab('ai-analyzer')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-md ${
              activeTab === 'ai-analyzer' ? 'text-indigo-600 font-bold bg-white border border-slate-200 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI Parser
          </button>
        </div>
      </div>
    </header>
  );
};
