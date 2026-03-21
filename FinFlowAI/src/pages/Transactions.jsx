import React, { useState } from 'react';
import { ShieldCheck, Plus, Zap } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { KEYWORDS } from '../utils/logic';

const CATEGORIES = [
  { name: 'Food', icon: '🍔' },
  { name: 'Transport', icon: '🚗' },
  { name: 'Shopping', icon: '🛒' },
  { name: 'Health', icon: '💊' },
  { name: 'Entertainment', icon: '🎮' },
  { name: 'Bills', icon: '💡' },
  { name: 'Education', icon: '📚' },
  { name: 'Other', icon: '📦' }
];

export default function Transactions() {
  const { transactions, globalMerchants, addTransaction } = useAppContext();
  
  const [desc, setDesc] = useState('');
  const [amt, setAmt] = useState('');
  const [cat, setCat] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));

  // Check if a merchant is globally verified (>5 transactions)
  const isMerchantVerified = (merchantName) => {
    const data = globalMerchants[merchantName.toLowerCase()];
    return data && data.transactionCount > 5;
  };

  const autoCategory = (description) => {
    const d = description.toLowerCase();
    for (const [category, kws] of Object.entries(KEYWORDS)) {
      if (kws.some(k => d.includes(k))) return category;
    }
    return '';
  };

  const handleDescChange = (e) => {
    const val = e.target.value;
    setDesc(val);
    const suggested = autoCategory(val);
    if (suggested) setCat(suggested);
  };

  const handleAdd = () => {
    if (!desc || !amt || Number(amt) <= 0) return alert('Please fill description and valid amount');
    if (!date) return alert('Please pick a date');
    addTransaction({
      merchant: desc,
      amount: Number(amt),
      category: cat || 'Other',
      date: date
    });
    setDesc('');
    setAmt('');
    setCat('');
  };

  const addSimulated = () => {
    const samples = [
      { desc: 'Zomato order', amt: 350, cat: 'Food' },
      { desc: 'Uber ride', amt: 180, cat: 'Transport' },
      { desc: 'Amazon shopping', amt: 1200, cat: 'Shopping' },
      { desc: 'Netflix subscription', amt: 499, cat: 'Entertainment' },
      { desc: 'Electricity bill', amt: 1800, cat: 'Bills' },
    ];
    const today = new Date();
    samples.forEach((s, i) => {
      const d = new Date(today); d.setDate(d.getDate() - i * 2);
      addTransaction({
        merchant: s.desc,
        amount: s.amt,
        category: s.cat,
        date: d.toISOString().slice(0,10)
      });
    });
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-in fade-in duration-500 pb-20">
      <header>
        <h1 className="text-2xl font-bold font-head tracking-tight">Transactions</h1>
        <p className="text-sm text-muted">View and manage all your past entries.</p>
      </header>
      
      {/* New Expense Form */}
      <div className="glass p-5 rounded-2xl flex flex-col gap-4">
        <h2 className="text-xs text-muted tracking-widest uppercase font-bold">New Expense Entry</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-muted uppercase tracking-wider">Description</label>
            <input 
              type="text" 
              value={desc} 
              onChange={handleDescChange} 
              className="bg-surface border border-border rounded-lg p-2.5 text-sm outline-none focus:border-accent transition-colors text-white font-mono"
              placeholder="e.g. Grocery run"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-muted uppercase tracking-wider">Amount ($)</label>
            <input 
              type="number" 
              value={amt} 
              onChange={(e) => setAmt(e.target.value)} 
              className="bg-surface border border-border rounded-lg p-2.5 text-sm outline-none focus:border-accent transition-colors text-white font-mono"
              placeholder="0.00"
              min="0" step="0.01"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-muted uppercase tracking-wider">Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              className="bg-surface border border-border rounded-lg p-2.5 text-sm outline-none focus:border-accent transition-colors text-white font-mono"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-muted uppercase tracking-wider">Category</label>
            <div className="relative">
              <select 
                value={cat} 
                onChange={(e) => setCat(e.target.value)}
                className="w-full bg-surface border border-border rounded-lg p-2.5 text-sm outline-none focus:border-accent transition-colors text-white font-mono appearance-none"
              >
                <option value="">Auto-detect</option>
                {CATEGORIES.map(c => (
                  <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
            <label className="text-[10px] text-muted uppercase tracking-wider">Smart Category Suggestions</label>
            <div className="flex flex-wrap gap-2">
                {CATEGORIES.filter(c => c.name !== 'Other').map(c => (
                    <button 
                        key={c.name} 
                        onClick={() => setCat(c.name)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-mono border transition-all ${
                            cat === c.name 
                                ? 'bg-accent text-black border-accent font-bold' 
                                : 'bg-surface text-muted border-border hover:border-muted hover:text-white'
                        }`}
                    >
                        {c.icon} {c.name}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex justify-between items-center mt-2 pt-4 border-t border-border/50">
          <button onClick={addSimulated} className="flex items-center gap-2 text-xs text-muted hover:text-white bg-surface border border-border px-3 py-2 rounded-lg transition-colors font-mono">
             <Zap className="w-3.5 h-3.5" /> Simulate Sample Data
          </button>
          <button onClick={handleAdd} className="bg-accent text-black font-head font-bold text-sm px-6 py-2.5 rounded-lg hover:bg-[#d4fc40] transition-colors flex items-center gap-2 tracking-wide">
             Add Expense <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 glass rounded-2xl overflow-hidden flex flex-col shadow-inner">
        <div className="p-5 border-b border-border/50 bg-[#ffffff02]">
            <h2 className="text-xs text-muted tracking-widest uppercase font-bold">All Transactions</h2>
        </div>
        <div className="overflow-y-auto p-4 md:p-6 flex-1">
            {transactions.length === 0 ? (
               <div className="flex-1 flex flex-col items-center justify-center text-muted border border-dashed border-border rounded-xl p-8 text-center min-h-[200px]">
                  <ShieldCheck className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm">No transactions yet.</p>
               </div>
            ) : (
              <div className="flex flex-col gap-3">
                {transactions.map(t => {
                  const verified = isMerchantVerified(t.merchant);
                  const catData = CATEGORIES.find(c => c.name === t.category) || { icon: '📦' };
                  
                  return (
                    <div key={t.id} className="p-4 bg-surface rounded-xl border border-border flex justify-between items-center group hover:bg-white/5 transition-colors shadow-sm">
                      <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-lg shadow-sm">
                              {catData.icon}
                          </div>
                          <div className="flex flex-col gap-1 items-start">
                             <div className="flex items-center gap-2">
                               <span className="font-semibold text-text">{t.merchant}</span>
                               {verified && (
                                 <div className="flex items-center gap-1 bg-emerald/10 text-emerald px-2 py-0.5 rounded-md border border-emerald/20" title="Community Verified Merchant">
                                    <ShieldCheck className="w-3 h-3" />
                                    <span className="text-[10px] font-bold tracking-wider">VERIFIED</span>
                                 </div>
                               )}
                             </div>
                             <div className="text-xs text-muted flex items-center gap-2 font-mono">
                               <span>{t.category}</span>
                               {verified && t.category === globalMerchants[t.merchant.toLowerCase()]?.communityCategory && (
                                 <span className="italic text-[10px] opacity-70 border-l border-border pl-2">Auto-tagged via consensus</span>
                               )}
                             </div>
                          </div>
                      </div>
                      <div className="text-right flex flex-col gap-1">
                         <div className="font-head font-bold text-lg text-white">${t.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                         <div className="text-[10px] text-muted font-mono">{t.date}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
