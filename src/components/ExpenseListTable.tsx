import React, { useState, useMemo } from 'react';
import { Search, Filter, Edit3, Trash2, ArrowUpDown, Calendar, Sparkles, CheckSquare, Square } from 'lucide-react';
import { Expense, CATEGORIES, CATEGORY_COLORS, BudgetConfig, formatPKR } from '../types';

interface ExpenseListTableProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onDeleteBatch: (ids: string[]) => void;
  budget: BudgetConfig;
}

export const ExpenseListTable: React.FC<ExpenseListTableProps> = ({
  expenses,
  onEdit,
  onDelete,
  onDeleteBatch,
  budget,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL'); // YYYY-MM
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'name'>('date-desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Available Months Extracted from Expenses
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    expenses.forEach((e) => {
      if (e.date && e.date.length >= 7) {
        months.add(e.date.substring(0, 7));
      }
    });
    return Array.from(months).sort().reverse();
  }, [expenses]);

  // Filtering & Sorting
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        const matchesSearch =
          exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (exp.notes && exp.notes.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCat = selectedCategory === 'ALL' || exp.category === selectedCategory;

        const matchesMonth =
          selectedMonth === 'ALL' || (exp.date && exp.date.startsWith(selectedMonth));

        return matchesSearch && matchesCat && matchesMonth;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return b.date.localeCompare(a.date);
        if (sortBy === 'date-asc') return a.date.localeCompare(b.date);
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [expenses, searchQuery, selectedCategory, selectedMonth, sortBy]);

  const filteredTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.size === filteredExpenses.length && filteredExpenses.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredExpenses.map((e) => e.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.size} selected expense item(s)?`)) {
      onDeleteBatch(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Search & Filter Bar */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search box */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items, notes, stores..."
            className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-indigo-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-slate-700 focus:outline-none cursor-pointer font-semibold"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-slate-700 focus:outline-none cursor-pointer font-semibold"
            >
              <option value="ALL">All Months</option>
              {availableMonths.map((m) => {
                const dateObj = new Date(`${m}-01T00:00:00`);
                const label = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                return (
                  <option key={m} value={m}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs shadow-2xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-700 focus:outline-none cursor-pointer font-semibold"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Price: High to Low</option>
              <option value="amount-asc">Price: Low to High</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Batch Operations Bar */}
      <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-1.5 hover:text-slate-800 transition-colors cursor-pointer"
          >
            {selectedIds.size > 0 && selectedIds.size === filteredExpenses.length ? (
              <CheckSquare className="w-4 h-4 text-indigo-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>Select All ({filteredExpenses.length})</span>
          </button>

          {selectedIds.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-1 text-rose-700 hover:text-rose-800 font-semibold transition-colors cursor-pointer bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.size})</span>
            </button>
          )}
        </div>

        <div>
          Showing <span className="font-bold text-slate-800">{filteredExpenses.length}</span> transactions | Total:{' '}
          <span className="font-bold text-slate-900">
            {formatPKR(filteredTotal, budget.currencySymbol)}
          </span>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white border-b border-slate-100 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase w-10 text-center">#</th>
              <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase">Item Name</th>
              <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase">Category</th>
              <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase">Date</th>
              <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase text-right">Amount (PKR)</th>
              <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-500 italic">
                  No matching expense items found.
                </td>
              </tr>
            ) : (
              filteredExpenses.map((item) => {
                const catStyle = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other;
                const isSelected = selectedIds.has(item.id);

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isSelected ? 'bg-indigo-50/40' : ''
                    }`}
                  >
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleSelect(item.id)}
                        className="text-slate-400 hover:text-indigo-600"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </button>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800 text-sm flex items-center gap-2">
                        <span>{item.name}</span>
                        {item.addedViaAi && (
                          <span
                            className="inline-flex items-center gap-0.5 text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded-md font-bold"
                            title="Added via AI Parser"
                          >
                            <Sparkles className="w-2.5 h-2.5" /> AI
                          </span>
                        )}
                      </div>
                      {item.notes && <p className="text-xs text-slate-400 mt-0.5">{item.notes}</p>}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${catStyle.bg} ${catStyle.text}`}
                      >
                        {item.category}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {item.date}
                    </td>

                    <td className="px-6 py-4 text-right font-bold text-slate-900 text-sm">
                      {formatPKR(item.amount, budget.currencySymbol)}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEdit(item)}
                          className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                          title="Edit expense"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete '${item.name}'?`)) {
                              onDelete(item.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout View */}
      <div className="block sm:hidden p-4 space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="p-6 text-center text-slate-500 italic border border-slate-200 rounded-xl bg-slate-50">
            No matching expense items found.
          </div>
        ) : (
          filteredExpenses.map((item) => {
            const catStyle = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other;
            const isSelected = selectedIds.has(item.id);

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border bg-white ${
                  isSelected ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-200'
                } space-y-2`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleSelect(item.id)}
                      className="text-slate-400 hover:text-indigo-600"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300" />
                      )}
                    </button>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        {item.name}
                        {item.addedViaAi && (
                          <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1 py-0.5 rounded">AI</span>
                        )}
                      </h4>
                      {item.notes && <p className="text-xs text-slate-400">{item.notes}</p>}
                    </div>
                  </div>

                  <span className="text-base font-bold text-slate-900 shrink-0">
                    {formatPKR(item.amount, budget.currencySymbol)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${catStyle.bg} ${catStyle.text}`}>
                    {item.category}
                  </span>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-[11px]">{item.date}</span>
                    <button
                      onClick={() => onEdit(item)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
