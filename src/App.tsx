import React, { useState, useEffect, useMemo } from 'react';
import { 
  Expense, 
  ExpenseCategory, 
  BudgetConfig, 
  CATEGORIES, 
  ParsedItem 
} from './types';
import { 
  getStoredBudget, 
  saveStoredBudget, 
  getStoredExpenses, 
  saveStoredExpenses 
} from './lib/storage';
import { Header } from './components/Header';
import { BudgetOverview } from './components/BudgetOverview';
import { CategoryChart } from './components/CategoryChart';
import { AiReceiptAnalyzer } from './components/AiReceiptAnalyzer';
import { ExpenseListTable } from './components/ExpenseListTable';
import { ExpenseFormModal } from './components/ExpenseFormModal';
import { SettingsModal } from './components/SettingsModal';
import { Sparkles, Plus, ReceiptText, ArrowRight, Wallet, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [budget, setBudget] = useState<BudgetConfig>(() => getStoredBudget());
  const [expenses, setExpenses] = useState<Expense[]>(() => getStoredExpenses());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses' | 'ai-analyzer' | 'settings'>('dashboard');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Save budget changes to localStorage
  const handleUpdateBudget = (newBudget: BudgetConfig) => {
    setBudget(newBudget);
    saveStoredBudget(newBudget);
    showToast('Budget configuration updated');
  };

  // Save expense changes to localStorage
  const handleAddExpense = (data: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...data,
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    };
    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    saveStoredExpenses(updated);
    showToast(`Added '${newExpense.name}' to expenses`);
  };

  const handleUpdateExpense = (id: string, updatedFields: Partial<Expense>) => {
    const updated = expenses.map((e) => (e.id === id ? { ...e, ...updatedFields } : e));
    setExpenses(updated);
    saveStoredExpenses(updated);
    showToast('Expense updated successfully');
  };

  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    saveStoredExpenses(updated);
    showToast('Expense removed');
  };

  const handleDeleteBatchExpenses = (ids: string[]) => {
    const idSet = new Set(ids);
    const updated = expenses.filter((e) => !idSet.has(e.id));
    setExpenses(updated);
    saveStoredExpenses(updated);
    showToast(`Deleted ${ids.length} item(s)`);
  };

  // Batch add from AI Receipt Parser
  const handleAddParsedItems = (items: ParsedItem[]) => {
    const today = new Date().toISOString().split('T')[0];
    const newExpenses: Expense[] = items.map((item, idx) => ({
      id: `ai-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
      name: item.name,
      category: item.category,
      amount: Number(item.amount) || 0,
      date: item.date && item.date.length === 10 ? item.date : today,
      notes: 'Added via AI Receipt Analyzer',
      addedViaAi: true
    }));

    const updated = [...newExpenses, ...expenses];
    setExpenses(updated);
    saveStoredExpenses(updated);
    showToast(`Successfully added ${newExpenses.length} items from AI analysis!`);
  };

  const handleResetExpenses = (newExpensesList: Expense[]) => {
    setExpenses(newExpensesList);
    saveStoredExpenses(newExpensesList);
    showToast('Expenses list reset successfully');
  };

  // Calculations for current month
  const currentMonthPrefix = useMemo(() => {
    return new Date().toISOString().substring(0, 7); // YYYY-MM
  }, []);

  const currentMonthExpenses = useMemo(() => {
    return expenses.filter((e) => e.date && e.date.startsWith(currentMonthPrefix));
  }, [expenses, currentMonthPrefix]);

  const totalSpentThisMonth = useMemo(() => {
    return currentMonthExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [currentMonthExpenses]);

  // Category totals for current month
  const categoryTotals = useMemo(() => {
    const totals: Record<ExpenseCategory, number> = {
      Dairy: 0,
      Produce: 0,
      Grains: 0,
      Meat: 0,
      Household: 0,
      Other: 0
    };

    currentMonthExpenses.forEach((e) => {
      if (totals[e.category] !== undefined) {
        totals[e.category] += Number(e.amount) || 0;
      } else {
        totals.Other += Number(e.amount) || 0;
      }
    });

    return totals;
  }, [currentMonthExpenses]);

  // Summary string passed to AI
  const currentExpensesSummary = useMemo(() => {
    const lines = Object.entries(categoryTotals).map(
      ([cat, amt]) => `${cat}: ${budget.currencySymbol}${amt}`
    );
    return `Total Spent This Month: ${budget.currencySymbol}${totalSpentThisMonth}. Breakdown: ${lines.join(', ')}`;
  }, [categoryTotals, totalSpentThisMonth, budget.currencySymbol]);

  const currentMonthLabel = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Popup Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm px-4 py-3 rounded-lg shadow-xl flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toast}</span>
        </div>
      )}

      {/* App Header */}
      <Header
        activeTab={activeTab === 'settings' ? 'dashboard' : activeTab}
        setActiveTab={(tab) => {
          if (tab === 'settings') {
            setIsSettingsOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenAddModal={() => {
          setEditingExpense(null);
          setIsFormModalOpen(true);
        }}
        budget={budget}
        totalSpent={totalSpentThisMonth}
      />

      {/* Main Content View Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* Top Grid: Budget Overview & Category Bar Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* Card 1: Budget Overview */}
              <BudgetOverview
                budget={budget}
                totalSpent={totalSpentThisMonth}
                itemCount={currentMonthExpenses.length}
                selectedMonthLabel={currentMonthLabel}
                onEditBudget={() => setIsSettingsOpen(true)}
              />

              {/* Card 2: Category Spending Chart */}
              <CategoryChart
                categoryTotals={categoryTotals}
                totalSpent={totalSpentThisMonth}
                budget={budget}
              />
            </div>

            {/* AI Receipt Quick Launcher Banner */}
            <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 border border-indigo-800 rounded-xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-indigo-500/20 rounded-lg text-indigo-300 border border-indigo-400/30 shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Have a raw grocery list or paper receipt?</h3>
                  <p className="text-xs text-indigo-200 mt-0.5">
                    Paste text like "milk 200, rice 5kg 900" and let Gemini AI categorize & log them automatically.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('ai-analyzer')}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-lg shadow-sm cursor-pointer transition-all shrink-0 active:scale-95"
              >
                <span>Try AI Analyzer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Recent Logged Expenses Table Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <ReceiptText className="w-5 h-5 text-indigo-600" />
                  Recent Expense Activity
                </h3>
                <button
                  onClick={() => setActiveTab('expenses')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Expenses ({expenses.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <ExpenseListTable
                expenses={expenses.slice(0, 5)}
                onEdit={(exp) => {
                  setEditingExpense(exp);
                  setIsFormModalOpen(true);
                }}
                onDelete={handleDeleteExpense}
                onDeleteBatch={handleDeleteBatchExpenses}
                budget={budget}
              />
            </div>
          </div>
        )}

        {/* EXPENSES LIST TAB */}
        {activeTab === 'expenses' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <ReceiptText className="w-6 h-6 text-indigo-600" />
                  All Grocery & Ration Expenses
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Search, filter by category or month, edit items, or delete records.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingExpense(null);
                  setIsFormModalOpen(true);
                }}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>

            <ExpenseListTable
              expenses={expenses}
              onEdit={(exp) => {
                setEditingExpense(exp);
                setIsFormModalOpen(true);
              }}
              onDelete={handleDeleteExpense}
              onDeleteBatch={handleDeleteBatchExpenses}
              budget={budget}
            />
          </div>
        )}

        {/* AI RECEIPT ANALYZER TAB */}
        {activeTab === 'ai-analyzer' && (
          <div className="animate-fade-in">
            <AiReceiptAnalyzer
              onAddParsedItems={handleAddParsedItems}
              budget={budget}
              currentExpensesSummary={currentExpensesSummary}
            />
          </div>
        )}
      </main>

      {/* Add / Edit Expense Modal */}
      <ExpenseFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleAddExpense}
        onUpdate={handleUpdateExpense}
        initialData={editingExpense}
        budget={budget}
      />

      {/* Budget Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        budget={budget}
        onSaveBudget={handleUpdateBudget}
        expenses={expenses}
        onResetExpenses={handleResetExpenses}
      />
    </div>
  );
}
