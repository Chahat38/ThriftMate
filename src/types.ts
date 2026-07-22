export type ExpenseCategory = 
  | 'Dairy'
  | 'Produce'
  | 'Grains'
  | 'Meat'
  | 'Household'
  | 'Other';

export const CATEGORIES: ExpenseCategory[] = [
  'Dairy',
  'Produce',
  'Grains',
  'Meat',
  'Household',
  'Other'
];

export const CATEGORY_COLORS: Record<ExpenseCategory, { bg: string; text: string; border: string; hex: string }> = {
  Dairy: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', hex: '#f59e0b' },
  Produce: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', hex: '#10b981' },
  Grains: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', hex: '#8b5cf6' },
  Meat: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', hex: '#3b82f6' },
  Household: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', hex: '#64748b' },
  Other: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', hex: '#6366f1' }
};

export interface Expense {
  id: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  addedViaAi?: boolean;
}

export interface BudgetConfig {
  monthlyBudget: number;
  currencySymbol: string;
  currencyCode: string;
}

export interface ParsedItem {
  name: string;
  category: ExpenseCategory;
  amount: number;
  date?: string;
}

export interface AIAnalysisResponse {
  items: ParsedItem[];
  suggestions: string[];
  summaryMessage?: string;
}

export function formatPKR(amount: number, symbol = 'Rs.'): string {
  const val = Math.round(amount || 0);
  const formatted = val.toLocaleString('en-PK');
  const sym = symbol ? symbol.trim() : 'Rs.';
  return `${sym} ${formatted}`;
}
