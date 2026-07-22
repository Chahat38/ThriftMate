import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Calendar, Tag, DollarSign, FileText } from 'lucide-react';
import { Expense, ExpenseCategory, CATEGORIES, BudgetConfig } from '../types';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expenseData: Omit<Expense, 'id'>) => void;
  onUpdate: (id: string, expenseData: Partial<Expense>) => void;
  initialData?: Expense | null;
  budget: BudgetConfig;
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  initialData,
  budget
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Produce');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setAmount(String(initialData.amount));
      setDate(initialData.date);
      setNotes(initialData.notes || '');
    } else {
      setName('');
      setCategory('Produce');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Item name is required.');
      return;
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    if (!date) {
      setError('Please select a date.');
      return;
    }

    if (initialData) {
      onUpdate(initialData.id, {
        name: name.trim(),
        category,
        amount: numericAmount,
        date,
        notes: notes.trim()
      });
    } else {
      onSave({
        name: name.trim(),
        category,
        amount: numericAmount,
        date,
        notes: notes.trim()
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-xl shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            {initialData ? 'Edit Expense' : 'Add Grocery Expense'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Item Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Item Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Basmati Rice 5kg, Fresh Milk, Dish Soap"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Category Dropdown & Amount side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-indigo-600" />
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer font-medium"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
                Amount in PKR (Rs.) *
              </label>
              <input
                type="number"
                step="1"
                required
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 900"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-semibold"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              Expense Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Notes / Store Name (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bought at Supermarket, organic, discount applied"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all cursor-pointer"
            >
              {initialData ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{initialData ? 'Save Changes' : 'Add Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
