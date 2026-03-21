import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Edit2 } from 'lucide-react';
import { formatCurrency, getCurrencySymbol } from '../utils/currency';

// Colors managed via CSS Theme Variables
const ICONS = {
  Food: '🍔',
  Transport: '🚗',
  Shopping: '🛒',
  Health: '💊',
  Entertainment: '🎮',
  Bills: '💡',
  Education: '📚',
  Other: '📦',
};

export default function Budgeting() {
  const { user, budgets, setBudgets, transactions } = useAppContext();
  const currency = user.currency || 'USD';
  const fmt = (n) => formatCurrency(n, currency);
  const sym = getCurrencySymbol(currency);
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  // Calculate spent per category
  const spentByCategory = {};
  Object.keys(budgets).forEach(cat => spentByCategory[cat] = 0);
  
  transactions
    .filter(t => t.date.startsWith(currentMonth))
    .forEach(t => {
      const cat = t.category || 'Other';
      if (spentByCategory[cat] !== undefined) {
        spentByCategory[cat] += t.amount;
      } else {
        spentByCategory[cat] = t.amount;
      }
    });

  const handleEditLimit = (cat) => {
    const newVal = window.prompt(`Set monthly budget for ${cat} (${sym}):`, budgets[cat]);
    if (newVal !== null && !isNaN(newVal) && Number(newVal) > 0) {
      setBudgets(prev => ({
        ...prev,
        [cat]: Number(newVal)
      }));
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-in fade-in duration-500 pb-20">
      <header>
        <h1 className="text-2xl font-bold font-head tracking-tight">Budget Tracking</h1>
        <p className="text-sm text-muted">Manage your category limits and stay on track.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(budgets).map(([cat, limit]) => {
          const spent = spentByCategory[cat] || 0;
          const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
          
          let alertColor = 'var(--color-accent)';
          let badgeText = 'OK';
          let badgeBg = 'rgba(167, 74, 201, 0.15)'; // Soft accent bg
          let badgeColor = 'var(--color-accent)';

          if (pct >= 100) {
            alertColor = 'var(--color-rose)';
            badgeText = 'OVER BUDGET';
            badgeBg = 'rgba(255, 107, 107, 0.15)';
            badgeColor = 'var(--color-rose)';
          } else if (pct >= 80) {
            alertColor = 'var(--color-accent)';
            badgeText = 'WARNING';
            badgeBg = 'rgba(167, 74, 201, 0.25)';
            badgeColor = 'var(--color-accent)';
          }

          return (
            <div key={cat} className="glass p-5 flex flex-col gap-4 rounded-xl border border-border/50 hover:border-border transition-colors">
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{ICONS[cat] || ICONS.Other}</span>
                    <span className="font-semibold font-head tracking-wide text-text">{cat}</span>
                  </div>
                  <div 
                    className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold tracking-wider"
                    style={{ backgroundColor: badgeBg, color: badgeColor }}
                  >
                    {badgeText} {pct.toFixed(0)}%
                  </div>
               </div>
               
               <div className="w-full bg-surface h-2.5 rounded-full overflow-hidden border border-border/40">
                  <div 
                    className="h-full transition-all duration-700 ease-out" 
                    style={{ width: `${pct}%`, backgroundColor: alertColor }}
                  ></div>
               </div>
               
               <div className="flex justify-between items-center text-xs font-mono">
                  <div className="flex items-baseline gap-1">
                    <span className="text-text font-bold">{fmt(spent)}</span>
                    <span className="text-muted">of {fmt(limit)}</span>
                  </div>
                  <button 
                    onClick={() => handleEditLimit(cat)}
                    className="flex items-center gap-1 text-muted hover:text-accent border border-transparent hover:border-accent/30 bg-surface/50 hover:bg-surface px-2 py-1 rounded transition-all"
                  >
                    <Edit2 className="w-3 h-3" /> Edit Limit
                  </button>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
