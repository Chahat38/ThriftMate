import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { ExpenseCategory, CATEGORIES, CATEGORY_COLORS, BudgetConfig, formatPKR } from '../types';
import { PieChart, ListFilter } from 'lucide-react';

interface CategoryChartProps {
  categoryTotals: Record<ExpenseCategory, number>;
  totalSpent: number;
  budget: BudgetConfig;
}

export const CategoryChart: React.FC<CategoryChartProps> = ({
  categoryTotals,
  totalSpent,
  budget,
}) => {
  const chartData = CATEGORIES.map((cat) => ({
    category: cat,
    amount: categoryTotals[cat] || 0,
    color: CATEGORY_COLORS[cat].hex,
    percentage: totalSpent > 0 ? Math.round(((categoryTotals[cat] || 0) / totalSpent) * 100) : 0
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-md text-xs">
          <p className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <span 
              className="w-2.5 h-2.5 rounded-full inline-block" 
              style={{ backgroundColor: data.color }} 
            />
            {data.category}
          </p>
          <p className="text-indigo-600 font-bold text-sm">
            {formatPKR(data.amount, budget.currencySymbol)}
          </p>
          <p className="text-slate-500 mt-0.5">{data.percentage}% of total spent</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-100">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Category Breakdown</h3>
            <p className="text-xs text-slate-500">Spending distribution across 6 ration categories</p>
          </div>
        </div>
        <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
          Bar Chart
        </div>
      </div>

      {/* Bar Chart Visualizer */}
      <div className="h-64 my-4 w-full">
        {totalSpent === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs text-center border border-dashed border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <ListFilter className="w-8 h-8 text-slate-400 mb-2" />
            <p className="font-semibold text-slate-700">No expenses recorded for this month</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Add grocery items or use AI receipt analyzer to see category charts.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
              <XAxis 
                dataKey="category" 
                tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }} 
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: '#64748b', fontSize: 10 }} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => formatPKR(val, budget.currencySymbol)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Category Pills List */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-100">
        {CATEGORIES.map((cat) => {
          const amount = categoryTotals[cat] || 0;
          const styles = CATEGORY_COLORS[cat];
          const pct = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;

          return (
            <div 
              key={cat} 
              className={`p-2.5 rounded-lg border ${styles.bg} ${styles.border} flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${styles.text}`}>{cat}</span>
                <span className="text-[10px] font-bold text-slate-600 bg-white/80 px-1.5 py-0.5 rounded border border-slate-200">
                  {pct}%
                </span>
              </div>
              <div className="mt-1 text-sm font-extrabold text-slate-900">
                {formatPKR(amount, budget.currencySymbol)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
