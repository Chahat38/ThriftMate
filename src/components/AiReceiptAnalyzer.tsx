import React, { useState } from 'react';
import { Sparkles, Loader2, CheckCircle2, Lightbulb, AlertTriangle, Trash2, ShoppingBag } from 'lucide-react';
import { ExpenseCategory, CATEGORIES, CATEGORY_COLORS, ParsedItem, BudgetConfig, formatPKR } from '../types';

interface AiReceiptAnalyzerProps {
  onAddParsedItems: (items: ParsedItem[]) => void;
  budget: BudgetConfig;
  currentExpensesSummary: string;
}

const SAMPLE_TEXTS = [
  {
    label: 'Roman Urdu Mix (Prompt Example)',
    text: 'doodh 200, chawal 5kg 900, sabun 150, murghi 800'
  },
  {
    label: 'Weekly Pakistani Ration',
    text: '2L doodh 440, 10kg flour 1350, 1kg murghi 680, surf 350, tamatar 200, cooking oil 1550'
  },
  {
    label: 'Bazaar Grocery Items',
    text: 'chaye patti 620, ghee 3L 1550, aalu 3kg 180, dahi 180, anda 1 dozen 300, sabzi 450'
  }
];

export const AiReceiptAnalyzer: React.FC<AiReceiptAnalyzerProps> = ({
  onAddParsedItems,
  budget,
}) => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzedResult, setAnalyzedResult] = useState<{
    items: ParsedItem[];
    suggestions: string[];
    summaryMessage?: string;
  } | null>(null);

  const [addedSuccessMessage, setAddedSuccessMessage] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      setError('Please paste or type your raw grocery list or receipt text first.');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalyzedResult(null);
    setAddedSuccessMessage(null);

    try {
      const response = await fetch('/api/analyze-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText
        })
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to parse list with AI.');
      }

      const data = json.data;
      setAnalyzedResult(data);

      // Automatically add categorized items to the expense list as required
      if (data.items && data.items.length > 0) {
        onAddParsedItems(data.items);
        const totalAmt = data.items.reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0);
        setAddedSuccessMessage(
          `Automatically categorized and added ${data.items.length} items (${formatPKR(totalAmt, budget.currencySymbol)}) directly to your expense list!`
        );
      }
    } catch (err: any) {
      console.error('AI Analysis failed:', err);
      setError(err.message || 'An error occurred while connecting to the AI analyzer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              AI Smart Grocery List Parser
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Paste your raw grocery list or receipt text in English, Roman Urdu, or a mix.
              Gemini AI will extract each item, categorize it, automatically add it to your expense list, and share practical Pakistani money-saving tips in Roman Urdu.
            </p>
          </div>
        </div>
      </div>

      {/* Main Input Box Area */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span className="text-indigo-600">✦</span> Paste Grocery List / Receipt Text
          </label>
          <span className="text-xs text-slate-500 hidden sm:inline">English / Roman Urdu / Mix</span>
        </div>

        <textarea
          rows={4}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="e.g. doodh 200, chawal 5kg 900, sabun 150, murghi 800"
          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono transition-all resize-none"
        />

        {/* Sample Trigger Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-500 font-medium">Try Sample Notes:</span>
          {SAMPLE_TEXTS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputText(sample.text);
                setError(null);
                setAddedSuccessMessage(null);
              }}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 font-medium"
            >
              <span>{sample.label}</span>
            </button>
          ))}
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Action Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleAnalyze}
            disabled={loading || !inputText.trim()}
            className="flex items-center gap-2 bg-indigo-600 text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-all cursor-pointer active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 stroke-[2]" />
                <span>Analyze with AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Auto-Add Success Notification Banner */}
      {addedSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-900 text-sm flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{addedSuccessMessage}</span>
        </div>
      )}

      {/* AI Money-Saving Suggestions Card */}
      {analyzedResult && (
        <div className="space-y-6 animate-fade-in">
          {/* Money Saving Suggestions in Roman Urdu */}
          {analyzedResult.suggestions && analyzedResult.suggestions.length > 0 && (
            <div className="bg-gradient-to-br from-indigo-50 via-white to-amber-50/40 border border-indigo-200/80 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-1">
                <Lightbulb className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  💡 Pakistani Family Money-Saving Tips (Bachat Mashware)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {analyzedResult.suggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-indigo-100 p-4 rounded-lg flex items-start gap-3 shadow-xs hover:border-indigo-300 transition-all"
                  >
                    <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      {suggestion}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Added Categorized Items Table */}
          {analyzedResult.items && analyzedResult.items.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-indigo-600" />
                    Categorized Items Added To List ({analyzedResult.items.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Items extracted by Gemini AI and automatically added to your monthly ration tracker
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider block">Total Amount</span>
                  <span className="text-base font-bold text-slate-900">
                    {formatPKR(
                      analyzedResult.items.reduce((s, i) => s + (Number(i.amount) || 0), 0),
                      budget.currencySymbol
                    )}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3">Item</th>
                      <th className="p-3">Assigned Category</th>
                      <th className="p-3 text-right">Amount (PKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analyzedResult.items.map((item, idx) => {
                      const catStyle = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other;
                      return (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-semibold text-slate-900">
                            {item.name}
                          </td>
                          <td className="p-3">
                            <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                              {item.category}
                            </span>
                          </td>
                          <td className="p-3 text-right font-bold text-slate-900">
                            {formatPKR(item.amount, budget.currencySymbol)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
