import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Edit2 } from 'lucide-react';

const COLORS = {
  Food: '#c8f135',
  Transport: '#6af0d8',
  Shopping: '#ffa94d',
  Health: '#ff6b6b',
  Entertainment: '#cc8cff',
  Bills: '#5bc0eb',
  Education: '#f7d070',
  Other: '#888888',
};

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
  const { budgets, setBudgets, transactions } = useAppContext();
  
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
    const newVal = window.prompt(`Set monthly budget for ${cat} ($):`, budgets[cat]);
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
          
          let alertColor = COLORS[cat] || COLORS.Other;
          let badgeText = '🟢 OK';
          let badgeBg = '#c8f13522';
          let badgeColor = '#c8f135';

          if (pct >= 100) {
            alertColor = '#ff6b6b';
            badgeText = '🔴 Over';
            badgeBg = '#ff6b6b22';
            badgeColor = '#ff6b6b';
          } else if (pct >= 80) {
            alertColor = '#ffa94d';
            badgeText = '🟡 High';
            badgeBg = '#ffa94d22';
            badgeColor = '#ffa94d';
          }

          return (
            <div key={cat} className="glass p-5 flex flex-col gap-4 rounded-xl border border-border/50 hover:border-border transition-colors">
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{ICONS[cat] || ICONS.Other}</span>
                    <span className="font-semibold font-head tracking-wide text-white">{cat}</span>
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
                    <span className="text-white font-bold">${spent.toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:2})}</span>
                    <span className="text-muted">of ${limit.toLocaleString()}</span>
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
