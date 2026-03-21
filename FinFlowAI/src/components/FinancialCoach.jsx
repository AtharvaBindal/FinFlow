import React, { useState } from 'react';
import { MessageSquare, X, Download } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import html2pdf from 'html2pdf.js';

export default function FinancialCoach() {
  const [open, setOpen] = useState(false);
  const { transactions } = useAppContext();

  // Basic NLP Insight Generation
  const generateInsight = () => {
    if (transactions.length === 0) return "Add some transactions and I'll analyze your spending!";
    
    // Check biggest category this month
    const currentMonth = new Date().toISOString().slice(0, 7);
    const thisMonth = transactions.filter(t => t.date.startsWith(currentMonth));
    if (thisMonth.length === 0) return "No spending this month yet. Keep it up!";

    const cats = {};
    thisMonth.forEach(t => cats[t.category] = (cats[t.category] || 0) + t.amount);
    
    let maxCat = '';
    let maxAmt = 0;
    for (const [c, a] of Object.entries(cats)) {
      if (a > maxAmt) { maxAmt = a; maxCat = c; }
    }

    if (maxCat === 'Food' || maxCat === 'Shopping' || maxCat === 'Entertainment') {
      return `Your spending on '${maxCat}' is the highest right now ($${maxAmt.toFixed(0)}). Would you like to review your recurring payments in this area?`;
    }

    return `You've spent $${maxAmt.toFixed(0)} on '${maxCat}' this month. I'm keeping an eye on your limits!`;
  };

  const exportPDF = () => {
    const element = document.getElementById('root');
    const opt = {
      margin:       10,
      filename:     'FinFlow-Monthly-Report.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      
      {/* Popover */}
      {open && (
        <div className="glass w-72 p-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5">
           <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                 <div className="w-6 h-6 rounded-full bg-emerald flex items-center justify-center font-bold text-bg text-xs">AI</div>
                 <span className="font-head font-bold text-sm">FinCoach</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-white">
                 <X className="w-4 h-4" />
              </button>
           </div>
           <p className="text-sm text-text leading-relaxed">
             {generateInsight()}
           </p>

           <div className="mt-4 pt-4 border-t border-border flex justify-end">
              <button onClick={exportPDF} className="flex items-center gap-2 text-xs bg-surface border border-border px-3 py-2 rounded-xl hover:border-emerald transition-colors">
                <Download className="w-3 h-3" /> Export PDF Report
              </button>
           </div>
        </div>
      )}

      {/* Bubble */}
      <button 
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-emerald text-bg flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
      >
        <MessageSquare className="w-6 h-6" />
        {/* Unread dot indicator */}
        <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-rose border-2 border-bg"></span>
      </button>

    </div>
  );
}
