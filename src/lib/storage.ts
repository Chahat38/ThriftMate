import { Expense, BudgetConfig } from '../types';

const BUDGET_KEY = 'thriftmate_budget_v2';
const EXPENSES_KEY = 'thriftmate_expenses_v2';

export const DEFAULT_BUDGET: BudgetConfig = {
  monthlyBudget: 50000,
  currencySymbol: 'Rs.',
  currencyCode: 'PKR'
};

// Getting current date string YYYY-MM-DD
const getTodayStr = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().split('T')[0];
};

export const SAMPLE_EXPENSES: Expense[] = [
  { id: 'sample-1', name: 'Fresh Doodh (Milk 2L)', category: 'Dairy', amount: 440, date: getTodayStr(0), notes: 'Daily morning supply' },
  { id: 'sample-2', name: 'Super Basmati Rice (5kg)', category: 'Grains', amount: 1650, date: getTodayStr(1), notes: 'Monthly staple' },
  { id: 'sample-3', name: 'Chakki Whole Wheat Atta (10kg)', category: 'Grains', amount: 1350, date: getTodayStr(2), notes: 'Flour for roti' },
  { id: 'sample-4', name: 'Fresh Sabzi (Tomatoes, Onions, Potatoes)', category: 'Produce', amount: 850, date: getTodayStr(2) },
  { id: 'sample-5', name: 'Chicken Meat / Murghi (1.5kg)', category: 'Meat', amount: 980, date: getTodayStr(3) },
  { id: 'sample-6', name: 'Dishwashing Soap & Surf Detergent', category: 'Household', amount: 550, date: getTodayStr(4) },
  { id: 'sample-7', name: 'Dahi (Yogurt 1kg) & Butter', category: 'Dairy', amount: 380, date: getTodayStr(5) },
  { id: 'sample-8', name: 'Seasonal Fruits (Apples & Bananas)', category: 'Produce', amount: 620, date: getTodayStr(6) },
  { id: 'sample-9', name: 'Pakistani Cooking Oil (3L)', category: 'Other', amount: 1550, date: getTodayStr(7) },
  { id: 'sample-10', name: 'Tapal Danedar Chai Patti (400g)', category: 'Other', amount: 620, date: getTodayStr(8) }
];

export function getStoredBudget(): BudgetConfig {
  try {
    const data = localStorage.getItem(BUDGET_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        monthlyBudget: Number(parsed.monthlyBudget) || DEFAULT_BUDGET.monthlyBudget,
        currencySymbol: parsed.currencySymbol || DEFAULT_BUDGET.currencySymbol,
        currencyCode: parsed.currencyCode || DEFAULT_BUDGET.currencyCode
      };
    }
  } catch (e) {
    console.error('Error reading budget from localStorage:', e);
  }
  return DEFAULT_BUDGET;
}

export function saveStoredBudget(config: BudgetConfig): void {
  try {
    localStorage.setItem(BUDGET_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving budget to localStorage:', e);
  }
}

export function getStoredExpenses(): Expense[] {
  try {
    const data = localStorage.getItem(EXPENSES_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading expenses from localStorage:', e);
  }
  // Initialize with sample expenses if empty
  saveStoredExpenses(SAMPLE_EXPENSES);
  return SAMPLE_EXPENSES;
}

export function saveStoredExpenses(expenses: Expense[]): void {
  try {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  } catch (e) {
    console.error('Error saving expenses to localStorage:', e);
  }
}

export function exportDataAsJson(budget: BudgetConfig, expenses: Expense[]): string {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    budget,
    expenses
  };
  return JSON.stringify(data, null, 2);
}
