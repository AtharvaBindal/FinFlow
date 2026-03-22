import React, { useState } from 'react';
import { ShieldCheck, Plus, Zap, Edit2, Trash2, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { KEYWORDS } from '../utils/logic';
import { formatCurrency } from '../utils/currency';

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
  const { user, transactions, auditLogs, globalMerchants, addTransaction, editTransaction, deleteTransaction } = useAppContext();
  const fmt = (n) => formatCurrency(n, user.currency || 'USD');
  
  const [editingId, setEditingId] = useState(null);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  
  const [type, setType] = useState('expense');
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
    if (suggested && type === 'expense') setCat(suggested);
  };

  const handleAdd = () => {
    if (!desc || !amt || Number(amt) <= 0) return alert('Please fill description and valid amount');
    if (!date) return alert('Please pick a date');
    
    if (editingId) {
       editTransaction(editingId, {
         merchant: desc,
         amount: Number(amt),
         category: type === 'deposit' ? 'Income' : (cat || 'Other'),
         date: date,
         type: type
       });
       setEditingId(null);
    } else {
       const result = addTransaction({
         merchant: desc,
         amount: Number(amt),
         category: type === 'deposit' ? 'Income' : (cat || 'Other'),
         date: date,
         type: type
       });
       if (result && result.blocked) {
         return alert(result.reason);
       }
    }
    
    setDesc('');
    setAmt('');
    setCat('');
  };
  
  const handleEditClick = (t) => {
     setEditingId(t.id);
     setType(t.type || 'expense');
     setDesc(t.merchant);
     setAmt(t.amount.toString());
     setCat(t.category);
     setDate(t.date);
     window.scrollTo({ top: 0, behavior: 'smooth' });
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
      
      {/* New Form */}
      <div className={`glass p-5 flex flex-col gap-4 transition-all duration-300 ${editingId ? 'ring-2 ring-accent rounded-2xl' : 'rounded-2xl'}`}>
        <div className="flex justify-between items-center pr-2">
          <h2 className={`text-xs tracking-widest uppercase font-bold ${editingId ? 'text-accent' : 'text-muted'}`}>
             {editingId ? 'Editing Transaction' : 'New Entry'}
          </h2>
          <div className="flex bg-surface p-1 rounded-lg border border-border">
             <button 
               onClick={() => setType('expense')} 
               className={`px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold rounded-md transition-all ${type === 'expense' ? 'bg-rose/20 text-rose' : 'text-muted hover:text-text'}`}
             >Expense</button>
             <button 
               onClick={() => setType('deposit')} 
               className={`px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold rounded-md transition-all ${type === 'deposit' ? 'bg-accent/20 text-accent' : 'text-muted hover:text-text'}`}
             >Deposit</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-muted uppercase tracking-wider">Description</label>
            <input 
              type="text" 
              value={desc} 
              onChange={handleDescChange} 
              className="bg-surface border border-border rounded-lg p-2.5 text-sm outline-none focus:border-accent transition-colors text-text font-mono"
              placeholder="e.g. Grocery run"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-muted uppercase tracking-wider">Amount ($)</label>
            <input 
              type="number" 
              value={amt} 
              onChange={(e) => setAmt(e.target.value)} 
              className="bg-surface border border-border rounded-lg p-2.5 text-sm outline-none focus:border-accent transition-colors text-text font-mono"
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
              className="bg-surface border border-border rounded-lg p-2.5 text-sm outline-none focus:border-accent transition-colors text-text font-mono"
            />
          </div>
          {type === 'expense' && (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-muted uppercase tracking-wider">Category</label>
              <div className="relative">
                <select 
                  value={cat} 
                  onChange={(e) => setCat(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg p-2.5 text-sm outline-none focus:border-accent transition-colors text-text font-mono appearance-none"
                >
                  <option value="">Auto-detect</option>
                  {CATEGORIES.map(c => (
                    <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
        
        {type === 'expense' && (
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
                                  : 'bg-surface text-muted border-border hover:border-muted hover:text-text'
                          }`}
                      >
                          {c.icon} {c.name}
                      </button>
                  ))}
              </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-2 pt-4 border-t border-border/50">
          <button onClick={addSimulated} className="flex items-center gap-2 text-xs text-muted hover:text-text bg-surface border border-border px-3 py-2 rounded-lg transition-colors font-mono">
             <Zap className="w-3.5 h-3.5" /> Simulate Sample Data
          </button>
          <div className="flex gap-2">
            {editingId && (
              <button 
                onClick={() => { setEditingId(null); setDesc(''); setAmt(''); setCat(''); }} 
                className="bg-surface border border-border text-muted font-head font-bold text-sm px-6 py-2.5 rounded-lg hover:text-text transition-colors flex items-center gap-2 tracking-wide"
              >
                Cancel <X className="w-4 h-4" />
              </button>
            )}
            <button onClick={handleAdd} className="bg-accent text-black font-head font-bold text-sm px-6 py-2.5 rounded-lg hover:opacity-80 transition-colors flex items-center gap-2 tracking-wide">
               {editingId ? 'Update Log' : `Add ${type === 'deposit' ? 'Deposit / Income' : 'Expense'}`} <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 glass rounded-2xl overflow-hidden flex flex-col shadow-inner">
        <div className="p-5 border-b border-border/50 bg-[#ffffff02] flex justify-between items-center">
            <h2 className="text-xs text-muted tracking-widest uppercase font-bold">All Transactions</h2>
            <button 
              onClick={() => setShowAuditLogs(!showAuditLogs)}
              className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded disabled:opacity-50 ${showAuditLogs ? 'bg-rose/20 text-rose' : 'bg-surface border border-border text-muted hover:text-text'}`}
            >
              {showAuditLogs ? 'Hide Audit Logs' : 'View Edit History'}
            </button>
        </div>
        <div className="overflow-y-auto p-4 md:p-6 flex-1">
            {showAuditLogs ? (
              <div className="flex flex-col gap-4">
                <div className="bg-rose/10 border border-rose/30 p-3 rounded-xl mb-2 text-rose text-xs flex items-center gap-2 font-mono">
                  <ShieldCheck className="w-4 h-4" /> IMMUTABLE AUDIT TRAIL — THESE LOGS CANNOT BE DELETED
                </div>
                {auditLogs.length === 0 ? (
                   <p className="text-muted text-sm text-center py-10 font-mono">No edits have been made yet.</p>
                ) : (
                  auditLogs.map(log => (
                    <div key={log.id} className="p-4 bg-surface rounded-xl border border-border flex flex-col gap-2 font-mono text-xs">
                       <div className="flex justify-between text-muted border-b border-border/50 pb-2">
                         <span>✏️ Tx ID: {log.txId}</span>
                         <span>{new Date(log.timestamp).toLocaleString()}</span>
                       </div>
                       <div className="grid grid-cols-2 gap-4 mt-1">
                          <div>
                            <span className="text-rose opacity-80 uppercase tracking-widest text-[9px] block mb-1">Old Data</span>
                            <div className="text-muted/80">{log.oldData.merchant} • {fmt(log.oldData.amount)} • {log.oldData.category}</div>
                          </div>
                          <div>
                            <span className="text-accent opacity-80 uppercase tracking-widest text-[9px] block mb-1">New Data</span>
                            <div className="text-text">{log.newData.merchant} • {fmt(log.newData.amount)} • {log.newData.category}</div>
                          </div>
                       </div>
                    </div>
                  ))
                )}
              </div>
            ) : transactions.length === 0 ? (
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
                    <div key={t.id} className="p-4 bg-surface rounded-xl border border-border flex justify-between items-center group hover:bg-text/5 transition-colors shadow-sm gap-2">
                      <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-lg shadow-sm flex-shrink-0">
                              {catData.icon}
                          </div>
                          <div className="flex flex-col gap-1 items-start min-w-0">
                             <div className="flex items-center gap-2 max-w-full">
                               <span className="font-semibold text-text truncate max-w-[100px] md:max-w-[200px]">{t.merchant}</span>
                               {verified && (
                                 <div className="flex items-center gap-1 bg-accent/10 text-accent px-2 py-0.5 rounded-md border border-accent/20" title="Community Verified Merchant">
                                    <ShieldCheck className="w-3 h-3" />
                                    <span className="text-[10px] font-bold tracking-wider">VERIFIED</span>
                                 </div>
                               )}
                             </div>
                             <div className="text-xs text-muted flex items-center gap-2 font-mono">
                               <span>{t.category}</span>
                               {verified && t.category === globalMerchants[t.merchant.toLowerCase()]?.communityCategory && (
                                 <span className="italic text-[10px] opacity-70 border-l border-border pl-2">Auto-tagged</span>
                               )}
                             </div>
                          </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                         <div className="text-right flex flex-col gap-1">
                            <div className={`font-head font-bold text-lg whitespace-nowrap ${t.type === 'deposit' ? 'text-accent' : 'text-text'}`}>
                              {t.type === 'deposit' ? '+' : '-'}{fmt(t.amount)}
                            </div>
                            <div className="text-[10px] text-muted font-mono whitespace-nowrap">{t.date}</div>
                         </div>
                         <button 
                           onClick={() => handleEditClick(t)} 
                           className="text-muted hover:text-accent p-2 border border-border hover:border-accent rounded-lg transition-all opacity-0 group-hover:opacity-100"
                           title="Edit Transaction"
                         >
                            <Edit2 className="w-4 h-4" />
                         </button>
                         <button 
                           onClick={() => { if(window.confirm('Are you sure you want to delete this transaction?')) deleteTransaction(t.id); }} 
                           className="text-muted hover:text-rose p-2 border border-border hover:border-rose rounded-lg transition-all opacity-0 group-hover:opacity-100"
                           title="Delete Transaction"
                         >
                            <Trash2 className="w-4 h-4" />
                         </button>
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
