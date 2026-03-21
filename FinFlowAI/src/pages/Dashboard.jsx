import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import MagicBox from '../components/MagicBox';
import DemoModule from '../components/DemoModule';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Sparkles, Activity, ShieldCheck, AlertTriangle, Edit2, Check, Download } from 'lucide-react';
import { formatCurrency, getCurrencySymbol } from '../utils/currency';

const COLORS = ['#c8f135', '#6af0d8', '#ff6b6b', '#ffa94d', '#cc8cff', '#5bc0eb', '#f7d070', '#888888'];

export default function Dashboard() {
  const { 
    user, setUser, transactions, budgets, wishlist, 
    balance, balancePercent, balanceWarning, monthSpent, monthDeposits, currentMonth 
  } = useAppContext();
  
  const currency = user.currency || 'USD';
  const fmt = (n) => formatCurrency(Math.max(0, n), currency);
  
  // Dream Tracker Math
  const totalSavedSoFar = Math.max(0, (balance || 0) - (wishlist.essentialBills || 0));
  const goalProgressPct = Math.min(100, wishlist.goalPrice > 0 ? (totalSavedSoFar / wishlist.goalPrice) * 100 : 0);
  const getProgressColor = () => 'var(--color-accent)';
  
  // 1. Math & Data Logic
  const thisMonthTxs = transactions.filter(t => t.date?.startsWith(currentMonth));
  
  // Categorized Data for Donut
  const catTotals = {};
  thisMonthTxs.filter(t => t.type !== 'deposit').forEach(t => {
     catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
  });
  const donutData = Object.entries(catTotals).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);

  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  
  // Safe Spend Limit — Auto-calculated vs User Override
  const autoDailyLimit = (wishlist.income - wishlist.essentialBills - wishlist.goalPrice) / daysInMonth;
  const currentDailyLimit = user.safeSpendOverride > 0 ? user.safeSpendOverride : autoDailyLimit;
  
  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [tempLimit, setTempLimit] = useState(currentDailyLimit.toString());

  const handleSaveLimit = () => {
    const val = Number(tempLimit);
    setUser(prev => ({ ...prev, safeSpendOverride: val }));
    setIsEditingLimit(false);
  };

  const todaySpent = thisMonthTxs.filter(t => t.date === new Date().toISOString().slice(0, 10)).reduce((acc, t) => t.type === 'deposit' ? acc - t.amount : acc + t.amount, 0);
  const overspend = todaySpent - currentDailyLimit;

  // 3. Smart Text Insights (Daily Briefing)
  const generateInsight = () => {
    if (transactions.length === 0) return "Welcome to FinFlow. Keep your wallet closed and we'll get along fine.";
    if (balanceWarning?.level === 'critical') return "CRITICAL ALERT: You are practically bankrupt. Stop buying things immediately!";
    
    if (overspend > 0) return `You blew past your daily limit by ${fmt(overspend)} today. Your future self is judging you harshly right now.`;
    
    const highestCat = Object.entries(catTotals).sort((a,b) => b[1] - a[1])[0];
    if (highestCat && highestCat[1] > 0 && highestCat[0] !== 'Bills') {
        if (highestCat[0] === 'Food') return `You've dropped ${fmt(highestCat[1])} on Food this month. We both know there is food at home.`;
        if (highestCat[0] === 'Shopping') return `Another ${fmt(highestCat[1])} gone to Shopping. Did you actually need more stuff, or were you just bored?`;
        if (highestCat[0] === 'Entertainment') return `${fmt(highestCat[1])} on Entertainment? Staring at the wall is literally free.`;
        return `You're hemorrhaging money on ${highestCat[0]} (${fmt(highestCat[1])}). Cut it out before you go broke.`;
    }
    
    if (todaySpent > 0) return `You spent ${fmt(todaySpent)} today. Was that purchase really necessary for your survival?`;
    
    return "You actually didn't overspend today. An absolute miracle. Don't ruin it tomorrow.";
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500 pb-20">
      
      {/* Dynamic Balance Warning Banner */}
      {balanceWarning && (
        <div style={{ backgroundColor: balanceWarning.color + '15', borderColor: balanceWarning.color + '40', color: balanceWarning.color }} 
             className="w-full p-4 rounded-xl border flex items-center gap-3 animate-in slide-in-from-top-4 shadow-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-bold tracking-wide">{balanceWarning.label}</p>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-head tracking-tight">Overview</h1>
          <p className="text-sm text-muted">Welcome back, <span className="text-text font-medium capitalize">{user.name || 'Hacker'}</span>.</p>
        </div>
        <div className="flex items-center gap-3">
          <DemoModule />
        </div>
      </header>

      {/* Laziness Bypass Magic Box */}
      <div className="w-full">
        <MagicBox />
      </div>

      {/* Top Section: Health Score & Smart Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Financial Health — Video Mood Indicator */}
        <div className="glass p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent z-0"></div>
          <h3 className="text-xs uppercase tracking-widest text-muted font-bold mb-4 z-10">Financial Health</h3>
          
          {/* Video container with glowing mood border */}
          {(() => {
            const teddyLeft = balance <= wishlist.goalPrice;
            const mood = teddyLeft ? 'dead' : balancePercent <= 50 ? 'sad' : balancePercent <= 75 ? 'mid' : 'happy';
            const videoSrc = mood === 'dead' ? '/dead.mp4' : mood === 'happy' ? '/happy.mp4' : mood === 'mid' ? '/mid.mp4' : '/sad.mp4';
            
            const glowColor = mood === 'happy'
              ? { shadow: '0 0 25px rgba(200,241,53,0.4), 0 0 60px rgba(200,241,53,0.15)', border: 'var(--color-accent)', badge: 'var(--color-accent)' }
              : mood === 'mid'
              ? { shadow: '0 0 25px rgba(255,169,77,0.4), 0 0 60px rgba(255,169,77,0.15)', border: 'var(--color-accent)', badge: 'var(--color-accent)' }
              : mood === 'sad'
              ? { shadow: '0 0 25px rgba(255,107,107,0.4), 0 0 60px rgba(255,107,107,0.15)', border: 'var(--color-rose)', badge: 'var(--color-rose)' }
              : { shadow: '0 0 25px rgba(255,107,107,0.8), 0 0 60px rgba(255,0,0,0.4)', border: 'var(--color-rose)', badge: 'var(--color-rose)' };
            
            const shadowStyle = mood === 'dead' ? 'shadow-[0_0_25px_var(--color-rose)]' :
                                mood === 'happy' ? 'shadow-[0_0_25px_var(--color-accent-glow)]' :
                                mood === 'mid' ? 'shadow-[0_0_25px_var(--color-accent)]' :
                                'shadow-[0_0_25px_var(--color-rose)]';

            return (
              <div
                className={`relative w-36 h-36 rounded-2xl overflow-hidden z-10 transition-all duration-700 ${shadowStyle}`}
                style={{ border: `2px solid ${glowColor.border}` }}
              >
                <video key={mood} src={videoSrc} autoPlay loop muted playsInline className="w-full h-full object-cover" />
              </div>
            );
          })()}
          
          <div className="mt-4 text-xs font-semibold uppercase tracking-wider text-center z-10 flex items-center gap-1">
            {balance <= wishlist.goalPrice ? <><AlertTriangle className="w-4 h-4 text-rose" /> Limit Reached</> :
             balancePercent > 75 ? <><ShieldCheck className="w-4 h-4 text-accent" /> Rockstar Status</> : 
             balancePercent > 50 ? <><Activity className="w-4 h-4 text-accent" /> On Track</> : 
             <><AlertTriangle className="w-4 h-4 text-rose" /> Bleeding Money</>}
          </div>
        </div>

        {/* Daily Briefing Card */}
        <div className="md:col-span-2 glass p-6 rounded-2xl flex flex-col justify-center relative border-accent/20">
          <div className="absolute top-0 right-0 p-4 opacity-50"><Sparkles className="w-16 h-16 text-accent/10" /></div>
          
          <div className="flex items-center gap-2 mb-3">
             <div className="w-8 h-8 rounded-full bg-accent text-bg flex items-center justify-center accent-glow">
               <Sparkles className="w-4 h-4" />
             </div>
             <h2 className="font-head font-bold text-lg text-text">Daily AI Briefing</h2>
          </div>
          
          <p className="text-base text-muted/90 leading-relaxed max-w-xl font-medium">
            "{generateInsight()}"
          </p>

          <div className="mt-5 flex gap-4">
             <div className="bg-surface/50 border border-border px-4 py-2 rounded-xl group relative">
               <div className="text-[10px] uppercase tracking-widest text-muted flex items-center justify-between">
                 Safe Spend Limit
                 {user.safeSpendOverride > 0 && <span className="text-[8px] bg-accent/20 text-accent px-1 py-0.5 rounded ml-2">OVERRIDE</span>}
               </div>
               
               {isEditingLimit ? (
                 <div className="flex items-center gap-2 mt-1">
                   <span className="text-muted text-sm">{getCurrencySymbol(currency)}</span>
                   <input 
                     type="number" 
                     value={tempLimit} 
                     onChange={(e) => setTempLimit(e.target.value)}
                     className="bg-transparent border-b border-accent outline-none w-16 text-text font-bold"
                     autoFocus
                     onKeyDown={(e) => e.key === 'Enter' && handleSaveLimit()}
                   />
                   <button onClick={handleSaveLimit} className="text-accent hover:text-text"><Check className="w-4 h-4" /></button>
                 </div>
               ) : (
                 <div className="text-lg font-bold text-accent flex items-center gap-2 group-hover:cursor-pointer" onClick={() => { setTempLimit(currentDailyLimit.toString()); setIsEditingLimit(true); }}>
                   {fmt(currentDailyLimit)} <span className="text-xs text-muted font-normal">/ day</span>
                   <Edit2 className="w-3 h-3 text-muted group-hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                 </div>
               )}
             </div>

             <div className="bg-surface/50 border border-border px-4 py-2 rounded-xl">
               <div className="text-[10px] uppercase tracking-widest text-muted">Spent Today</div>
               <div className={`text-lg font-bold ${overspend > 0 ? 'text-rose' : 'text-text'}`}>{fmt(todaySpent)}</div>
             </div>
          </div>
        </div>
      </div>

      {/* Advanced Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        
        {/* Balance & Export Summary Card */}
        <div className="glass p-6 rounded-2xl flex flex-col justify-between border-t-2 border-t-blue/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-50"><ShieldCheck className="w-24 h-24 text-blue/5" /></div>
          
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm font-bold font-head uppercase tracking-wider text-blue">Account Balance</h3>
                <p className="text-xs text-muted mt-1">Available Funds</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black font-head tracking-tighter text-text">{fmt(balance)}</div>
                <div className="flex items-center gap-1.5 justify-end mt-1">
                  <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: balanceWarning ? balanceWarning.color : '#6af0d8' }}></div>
                  <span className="text-[10px] text-muted tracking-widest uppercase font-bold text-right leading-tight">
                    {Math.max(0, balancePercent).toFixed(0)}% Left
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
               <div className="bg-surface/40 p-3 rounded-xl border border-border">
                 <div className="text-[10px] uppercase tracking-widest text-muted mb-1">Total In (Mo)</div>
                 <div className="text-accent font-bold font-mono">{fmt((wishlist.income || 0) + (monthDeposits || 0))}</div>
                 {monthDeposits > 0 && <div className="text-[8px] text-accent mt-1 font-bold">+ Recent Deposit Logged</div>}
               </div>
                <div className="bg-surface/40 p-3 rounded-xl border border-border">
                 <div className="text-[10px] uppercase tracking-widest text-muted mb-1">Total Out</div>
                 <div className="text-rose font-bold font-mono">{fmt(monthSpent || 0)}</div>
               </div>
            </div>
          </div>

          {/* Dream Tracker Progress */}
          {wishlist.goalName && (
             <div className="mt-6 pt-5 border-t border-border">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <h3 className="text-[11px] font-bold font-head uppercase tracking-wider text-text">Target: {wishlist.goalName}</h3>
                </div>
                <div className="text-right flex items-baseline gap-1">
                  <span className="text-sm font-bold text-[#2c9b99]">{fmt(totalSavedSoFar)}</span>
                  <span className="text-[9px] text-muted">/ {fmt(wishlist.goalPrice)}</span>
                </div>
              </div>
              <div className="w-full bg-surface rounded-full h-1.5 mt-1 overflow-hidden border border-[#2c9b99]/30 relative">
                <div className="h-full transition-all duration-1000 ease-out relative" style={{ width: `${goalProgressPct}%`, backgroundColor: getProgressColor(goalProgressPct) }}>
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          )}

          {/* Export Button */}
          <button 
            onClick={() => {
              const csvData = [
                ['Date', 'Merchant', 'Category', 'Amount', 'Type'],
                ...transactions.map(t => [
                  t.date, 
                  `"${t.merchant.replace(/"/g, '""')}"`, 
                  t.category, 
                  t.amount, 
                  t.type || 'expense'
                ])
              ].map(e => e.join(",")).join("\n");
              
              const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.setAttribute('href', url);
              a.setAttribute('download', `FinFlow_${currentMonth}_Export.csv`);
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}
            className="w-full mt-6 bg-blue/10 hover:bg-blue/20 border border-blue/30 text-blue text-xs font-bold uppercase tracking-widest py-3 rounded-xl transition-colors flex items-center justify-center gap-2 group cursor-pointer"
          >
             <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
             Export Data to Excel
          </button>
        </div>

        {/* Category Donut (Fixed Responsive Container Issue by using absolute sizing wrapper) */}
        <div className="glass p-6 rounded-2xl flex flex-col">
          <h3 className="text-sm font-bold font-head uppercase tracking-wider text-text mb-4">Category Analysis</h3>
          <div className="relative w-full h-[220px] flex items-center justify-center">
            {donutData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#16161f', borderColor: '#ffffff12', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#f0f0f5', fontWeight: 'bold' }}
                    formatter={(value) => `$${value.toFixed(2)}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-muted text-sm border border-dashed border-border p-4 rounded-xl">No Data Yet</div>
            )}
            
            {/* Center Summary */}
            {donutData.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                <span className="text-[10px] text-muted uppercase tracking-widest">Total</span>
                <span className="text-xl font-bold font-head text-text">{fmt(monthSpent)}</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Premium SVG Sankey (Money Flow) Diagram */}
      <div className="glass p-6 rounded-2xl w-full border border-border relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent/5 blur-[100px] rounded-full pointer-events-none"></div>
        
        <h3 className="text-sm font-bold font-head uppercase tracking-wider text-text mb-6">Cash Flow Architecture</h3>
        
        <div className="w-full overflow-x-auto pb-4">
          <div className="min-w-[700px] h-[200px] relative flex items-center justify-between px-10">
            
            {/* SVG Connecting Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
              <defs>
                <linearGradient id="flowGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#c8f135" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ff6b6b" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="flowGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#c8f135" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#6af0d8" stopOpacity="0.6" />
                </linearGradient>
              </defs>
              {/* Path to Essential Bills */}
              <path d="M 150 100 C 300 100, 300 40, 450 40" fill="none" stroke="url(#flowGrad1)" strokeWidth="8" className="opacity-50" strokeDasharray="6 4" />
              {/* Path to Discretionary */}
              <path d="M 150 100 C 300 100, 300 100, 450 100" fill="none" stroke="url(#flowGrad1)" strokeWidth="16" className="opacity-50" strokeDasharray="6 4" />
              {/* Path to Savings */}
              <path d="M 150 100 C 300 100, 300 160, 450 160" fill="none" stroke="url(#flowGrad2)" strokeWidth="12" className="opacity-80" strokeDasharray="10 5">
                 <animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" repeatCount="indefinite" />
              </path>
            </svg>

            {/* Income Node */}
            <div className="z-10 bg-surface border border-accent/50 p-4 rounded-xl shadow-[0_0_20px_rgba(200,241,53,0.1)] flex flex-col items-center w-36">
              <span className="text-[10px] text-accent uppercase tracking-widest font-bold">Income</span>
              <span className="text-xl font-black font-head text-text">{fmt(wishlist.income)}</span>
            </div>

            {/* Split Nodes */}
            <div className="z-10 flex flex-col justify-between h-full py-4 gap-4">
               {/* Essential Node */}
               <div className="bg-surface border border-rose/30 p-3 rounded-xl flex flex-col items-center w-36">
                 <span className="text-[10px] text-rose uppercase tracking-widest font-bold">Fixed Bills</span>
                 <span className="text-lg font-black font-head text-text">{fmt(wishlist.essentialBills)}</span>
               </div>
               
               {/* Discretionary Node */}
               <div className="bg-surface border border-accent/30 p-3 rounded-xl flex flex-col items-center w-36 relative overflow-hidden">
                 <div className="absolute inset-0 bg-accent/5"></div>
                 <span className="text-[10px] text-accent uppercase tracking-widest font-bold z-10">Spent</span>
                 <span className="text-lg font-black font-head text-text z-10">{fmt(monthSpent)}</span>
               </div>
               
               {/* Savings Node */}
               <div className="bg-surface border border-blue/50 p-3 rounded-xl shadow-[0_0_15px_rgba(106,240,216,0.2)] flex flex-col items-center w-36">
                 <span className="text-[10px] text-blue uppercase tracking-widest font-bold">Saved (To Goal)</span>
                 <span className="text-lg font-black font-head text-text">{fmt(totalSavedSoFar)}</span>
               </div>
            </div>

          </div>
        </div>
        <p className="text-[10px] text-muted text-center mt-2 uppercase tracking-widest">Live Dynamic Distribution Mapping</p>
      </div>

    </div>
  );
}
