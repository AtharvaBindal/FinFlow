import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Ghost, DollarSign, ExternalLink, Calendar, AlertTriangle } from 'lucide-react';

export default function Subscriptions() {
  const { transactions, manualVampires, setManualVampires } = useAppContext();
  const [selectedSub, setSelectedSub] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSub, setNewSub] = useState({ merchant: '', amount: '' });

  // Auto-detect subscriptions by finding duplicate exact amounts to the same merchant
  // (In a real app, we'd use flags or ML, here we use a clever heuristic)
  const subscriptions = useMemo(() => {
    const merchantMap = {};
    
    // Only look at negative expenses, group by Merchant
    transactions.forEach(t => {
      if (t.amount > 0) {
        if (!merchantMap[t.merchant]) merchantMap[t.merchant] = [];
        merchantMap[t.merchant].push(t);
      }
    });

    const identifiedSubs = [];
    
    // Heuristic: If there are at least 2 transactions with the EXACT SAME amount
    // to the SAME merchant in different months, flag it as a subscription.
    // For demo purposes, we will relax the rules slightly.
    Object.entries(merchantMap).forEach(([merchant, txs]) => {
      // Find the most common amount
      const amountCounts = {};
      txs.forEach(t => {
        amountCounts[t.amount] = (amountCounts[t.amount] || 0) + 1;
      });
      
      let maxCount = 0;
      let recurringAmount = null;
      Object.entries(amountCounts).forEach(([amt, count]) => {
        if (count > maxCount) {
          maxCount = count;
          recurringAmount = Number(amt);
        }
      });

      // If we see it 2+ times, or if it's a known subscription keyword, classify as Vampire
      const knownVampires = ['netflix', 'spotify', 'gym', 'prime', 'apple', 'hulu', 'xbox', 'adobe', 'internet'];
      const isKnown = knownVampires.some(k => merchant.toLowerCase().includes(k));
      
      if (maxCount >= 2 || (txs.length >= 1 && isKnown)) {
         recurringAmount = recurringAmount || txs[0].amount;
         identifiedSubs.push({
           merchant,
           amount: recurringAmount,
           frequency: 'Monthly',
           yearlyBleed: recurringAmount * 12,
           lastCharged: txs.sort((a,b) => new Date(b.date) - new Date(a.date))[0].date,
           totalOccurrences: txs.length
         });
      }
    });

    return identifiedSubs;
  }, [transactions]);

  const allSubscriptions = useMemo(() => {
    return [...subscriptions, ...manualVampires].sort((a,b) => b.yearlyBleed - a.yearlyBleed);
  }, [subscriptions, manualVampires]);

  const totalYearlyBleed = allSubscriptions.reduce((acc, sub) => acc + sub.yearlyBleed, 0);

  const handleAddManual = () => {
    if (!newSub.merchant || !newSub.amount || Number(newSub.amount) <= 0) return alert('Fill valid details');
    setManualVampires(prev => [...prev, {
      id: Date.now(),
      merchant: newSub.merchant,
      amount: Number(newSub.amount),
      frequency: 'Monthly',
      yearlyBleed: Number(newSub.amount) * 12,
      lastCharged: 'Manual Entry',
      totalOccurrences: 1,
      isManual: true
    }]);
    setNewSub({ merchant: '', amount: '' });
    setShowAddForm(false);
  };
  
  const removeManual = (id) => {
    setManualVampires(prev => prev.filter(v => v.id !== id));
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500 pb-20 relative">
      <header>
        <div className="flex items-center gap-3">
           <Ghost className="w-8 h-8 text-rose drop-shadow-[0_0_15px_rgba(255,107,107,0.5)]" />
           <h1 className="text-2xl font-bold font-head tracking-tight text-rose">Vampire Tracker</h1>
        </div>
        <p className="text-sm text-muted mt-1">Automatically detecting subscriptions draining your wallet.</p>
      </header>

      {/* Aggregate Bleed Card */}
      <div className="glass bg-rose/5 border-rose/30 p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden text-center shadow-[0_10px_40px_rgba(255,107,107,0.1)]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose/10 rounded-full blur-[50px]"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose/10 rounded-full blur-[50px]"></div>
        
        <span className="text-sm font-bold font-head uppercase tracking-widest text-rose mb-2 z-10">Total Yearly Bleed</span>
        <span className="text-5xl font-black font-head tracking-tighter text-text z-10">${totalYearlyBleed.toFixed(0)}</span>
        <span className="text-xs text-muted mt-2 z-10">Money you lose every single year to recurring charges.</span>
      </div>
      
      <div className="flex justify-between items-center px-1">
         <h2 className="text-sm font-bold tracking-widest uppercase text-text font-head drop-shadow-md">Active Bloodsuckers</h2>
         <button onClick={() => setShowAddForm(!showAddForm)} className="text-xs font-bold bg-surface border border-border px-4 py-2 rounded-lg text-text hover:border-rose transition-colors">
            {showAddForm ? 'Cancel' : '+ Add Vampire'}
         </button>
      </div>

      {showAddForm && (
        <div className="glass p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-end animate-in slide-in-from-top-4 duration-300 border-rose/30 bg-rose/5">
           <div className="flex-1 w-full">
             <label className="text-[10px] uppercase font-bold text-rose mb-1 block">What is it?</label>
             <input type="text" value={newSub.merchant} onChange={e => setNewSub({...newSub, merchant: e.target.value})} placeholder="e.g. Netflix, Gym" className="w-full bg-surface border border-border rounded-lg p-2.5 text-sm text-text outline-none focus:border-rose" />
           </div>
           <div className="flex-1 w-full">
             <label className="text-[10px] uppercase font-bold text-rose mb-1 block">Monthly Cost ($)</label>
             <input type="number" value={newSub.amount} onChange={e => setNewSub({...newSub, amount: e.target.value})} placeholder="0.00" className="w-full bg-surface border border-border rounded-lg p-2.5 text-sm font-mono text-text outline-none focus:border-rose" />
           </div>
           <button onClick={handleAddManual} className="w-full md:w-auto bg-rose text-bg font-bold px-6 py-2.5 rounded-lg whitespace-nowrap hover:bg-white transition-colors">
              Save Bloodsucker
           </button>
        </div>
      )}

      {allSubscriptions.length === 0 && !showAddForm && (
         <div className="text-center p-10 glass border-dashed">
            <p className="text-muted">No subscriptions found. You are completely free of bloodsuckers! Or you can add them manually.</p>
         </div>
      )}

      {/* Subscriptions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {allSubscriptions.map((sub, idx) => (
          <div key={idx} className="glass p-5 rounded-xl border-border flex flex-col gap-4 relative group hover:border-rose/50 transition-colors">
             {sub.isManual && (
                <button onClick={() => removeManual(sub.id)} className="absolute -top-2 -right-2 bg-rose text-bg w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold">×</button>
             )}
             <div className="flex justify-between items-start">
               <div>
                 <h3 className="font-bold text-lg text-text capitalize">{sub.merchant}</h3>
                 <p className="text-xs text-muted flex items-center gap-1 mt-1">
                   <Calendar className="w-3 h-3" /> Last charged: {sub.lastCharged}
                 </p>
               </div>
               <div className="bg-surface border border-border px-3 py-1 rounded-lg text-rose font-bold">
                 ${sub.amount.toFixed(2)}/mo
               </div>
             </div>

             <div className="bg-rose/10 rounded-xl p-3 flex justify-between items-center text-rose border border-rose/20">
               <span className="text-xs font-bold uppercase tracking-wider">Yearly Bleed</span>
               <span className="font-black text-lg font-head">${sub.yearlyBleed.toFixed(0)}</span>
             </div>

             <button 
               onClick={() => setSelectedSub(sub)}
               className="w-full mt-2 py-3 border border-border rounded-xl text-sm font-bold text-muted hover:text-text hover:bg-surface transition-colors flex items-center justify-center gap-2"
             >
               Should I Keep This? <AlertTriangle className="w-4 h-4 text-yellow" />
             </button>
          </div>
        ))}
      </div>

      {/* "Should I Keep This?" Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
           <div className="glass w-full max-w-md p-6 rounded-3xl shadow-2xl animate-in zoom-in-95 border-rose/30 flex flex-col gap-6">
              
              <div className="text-center">
                 <div className="w-16 h-16 bg-rose/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose/20">
                    <Ghost className="w-8 h-8 text-rose" />
                 </div>
                 <h2 className="text-2xl font-bold font-head text-text capitalize">{selectedSub.merchant} Analysis</h2>
                 <p className="text-sm text-muted mt-2">
                   You are paying <b className="text-rose">${selectedSub.amount}/mo</b> for this service.
                 </p>
              </div>

              <div className="bg-surface rounded-xl p-5 border border-border">
                 <h4 className="text-xs uppercase tracking-widest text-muted font-bold mb-3">Hard Truth:</h4>
                 <ul className="text-sm text-text space-y-3 list-disc pl-4 marker:text-rose">
                   <li>This costs you <b>${selectedSub.yearlyBleed.toFixed(0)}</b> every 12 months.</li>
                   <li>If you invest that money at 7% instead, it would be <b>${(selectedSub.yearlyBleed * 1.07 * 10).toFixed(0)}</b> in 10 years.</li>
                   <li>You've been charged <b>{selectedSub.totalOccurrences}</b> times for this recently.</li>
                 </ul>
              </div>

              <div className="flex gap-3">
                 <button onClick={() => setSelectedSub(null)} className="flex-1 py-3 bg-surface border border-border text-text font-bold rounded-xl hover:bg-white/10 transition-colors">
                   Close
                 </button>
                 <a href={`https://www.google.com/search?q=how+to+cancel+${selectedSub.merchant}+subscription`} target="_blank" rel="noreferrer" className="flex-1 py-3 bg-rose flex items-center justify-center gap-2 text-bg font-bold rounded-xl hover:bg-white transition-colors">
                   Cancel It <ExternalLink className="w-4 h-4" />
                 </a>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
