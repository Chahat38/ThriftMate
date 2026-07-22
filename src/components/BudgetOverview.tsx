import React from 'react';
import { Wallet, TrendingUp, AlertCircle, CheckCircle2, Edit2, Calendar, ShoppingBag } from 'lucide-react';
import { BudgetConfig, formatPKR } from '../types';

interface BudgetOverviewProps {
  budget: BudgetConfig;
  totalSpent: number;
  itemCount: number;
  selectedMonthLabel: string;
  onEditBudget: () => void;
}

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  budget,
  totalSpent,
  itemCount,
  selectedMonthLabel,
  onEditBudget,
}) => {
  const remaining = budget.monthlyBudget - totalSpent;
  const percentage = Math.round((totalSpent / (budget.monthlyBudget || 1)) * 100);
  const isOverBudget = remaining < 0;
  const isNearLimit = percentage >= 80 && !isOverBudget;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-100">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Budget Cycle</span>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              {selectedMonthLabel}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onEditBudget}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md border border-slate-200 transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
            Set Budget ({formatPKR(budget.monthlyBudget, budget.currencySymbol)})
          </button>
        </div>
      </div>

      {/* 3 Main Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-5">
        {/* Total Monthly Budget */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Monthly Budget</span>
            <Wallet className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {formatPKR(budget.monthlyBudget, budget.currencySymbol)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Target allowance for rations</p>
        </div>

        {/* Total Spent */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Total Spent</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {formatPKR(totalSpent, budget.currencySymbol)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <ShoppingBag className="w-3 h-3 text-slate-400" />
            <span>{itemCount} grocery item{itemCount !== 1 ? 's' : ''} logged</span>
          </p>
        </div>

        {/* Remaining Budget */}
        <div className={`p-4 rounded-lg border transition-colors ${
          isOverBudget 
            ? 'bg-rose-50 border-rose-200' 
            : isNearLimit 
            ? 'bg-amber-50 border-amber-200' 
            : 'bg-emerald-50/50 border-emerald-200'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Remaining Balance</span>
            {isOverBudget ? (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            ) : isNearLimit ? (
              <AlertCircle className="w-4 h-4 text-amber-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
          </div>
          <div className={`text-2xl font-extrabold tracking-tight ${
            isOverBudget ? 'text-rose-700' : isNearLimit ? 'text-amber-700' : 'text-slate-900'
          }`}>
            {isOverBudget && '-'}
            {formatPKR(Math.abs(remaining), budget.currencySymbol)}
          </div>
          <p className={`text-[11px] mt-1 font-semibold ${
            isOverBudget ? 'text-rose-600' : isNearLimit ? 'text-amber-600' : 'text-emerald-700'
          }`}>
            {isOverBudget ? 'Budget limit exceeded!' : `${100 - percentage}% allowance remaining`}
          </p>
        </div>
      </div>

      {/* Visual Budget Progress Bar */}
      <div className="mt-2 pt-2">
        <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
          <span className="text-slate-600">Budget Consumption</span>
          <span className={`${
            isOverBudget ? 'text-rose-600 font-bold' : isNearLimit ? 'text-amber-600 font-bold' : 'text-slate-700'
          }`}>
            {percentage}% used
          </span>
        </div>

        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOverBudget
                ? 'bg-rose-500'
                : isNearLimit
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
