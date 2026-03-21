import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import MagicBox from '../components/MagicBox';
import DemoModule from '../components/DemoModule';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Sparkles, Activity, ShieldCheck, AlertTriangle } from 'lucide-react';
import { formatCurrency, getCurrencySymbol } from '../utils/currency';

const COLORS = ['#c8f135', '#6af0d8', '#ff6b6b', '#ffa94d', '#cc8cff', '#5bc0eb', '#f7d070', '#888888'];

export default function Dashboard() {
  const { user, transactions, budgets, wishlist } = useAppContext();
  const currency = user.currency || 'USD';
  const fmt = (n) => formatCurrency(n, currency);
  
  // 1. Math & Data Logic
  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonthTxs = transactions.filter(t => t.date.startsWith(currentMonth));
  const monthSpent = thisMonthTxs.reduce((acc, t) => acc + t.amount, 0);

  // Categorized Data for Donut
  const catTotals = {};
  thisMonthTxs.forEach(t => {
     catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
  });
  const donutData = Object.entries(catTotals).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);

  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const dailyLimit = (wishlist.income - wishlist.essentialBills - wishlist.goalPrice) / daysInMonth;
  
  const todaySpent = thisMonthTxs.filter(t => t.date === new Date().toISOString().slice(0, 10)).reduce((a, b) => a + b.amount, 0);
  const overspend = todaySpent - dailyLimit;

  // 2. Financial Health Score Logic (starts at 700, max 850, min 300)
  const healthScore = useMemo(() => {
    let score = 700;
    // Add points if month spending is less than expected pace
    const expectedMonthPace = dailyLimit * new Date().getDate();
    if (monthSpent < expectedMonthPace) score += 40;
    else if (monthSpent > expectedMonthPace + 500) score -= 50;

    // Daily safe spend check
    if (overspend < 0) score += 15;
    else if (overspend > 50) score -= 25;
    
    // Bounds
    return Math.min(Math.max(Math.round(score), 300), 850);
  }, [monthSpent, dailyLimit, overspend]);

  const scoreColor = healthScore >= 750 ? 'text-emerald border-emerald shadow-[0_0_15px_rgba(200,241,53,0.3)]' : 
                     healthScore >= 600 ? 'text-yellow border-yellow shadow-[0_0_15px_rgba(255,169,77,0.3)]' : 
                     'text-rose border-rose shadow-[0_0_15px_rgba(255,107,107,0.3)]';

  // 3. Smart Text Insights (Daily Briefing)
  const generateInsight = () => {
    if (transactions.length === 0) return "Welcome to FinFlow! Add your first transaction to get personalized insights.";
    
    // Check if food spending is unusually high
    if (catTotals['Food'] > budgets['Food'] * 0.8) {
      return "Gentle reminder: You're approaching your Food budget limits. Maybe skip the cafe tomorrow to stay on track for your goal!";
    }
    
    if (overspend > 0) {
      return `We went ${overspend > 50 ? 'significantly ' : ''}over the daily safe limit today, but you're still doing great overall. Reel it in tomorrow!`;
    }

    if (monthSpent < (dailyLimit * new Date().getDate())) {
      return `You're crushing it! You are currently under-budget for the week. That's more money saved toward your ${wishlist.goalName}!`;
    }

    return "You're spending exactly at a healthy pace. Keep up the good work!";
  };

  // 4. Wishlist Progress Bar Math
  const totalSavedSoFar = Math.max(0, (wishlist.income - wishlist.essentialBills - monthSpent));
  const goalProgressPercent = Math.min((totalSavedSoFar / wishlist.goalPrice) * 100, 100).toFixed(1);

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-head tracking-tight">Overview</h1>
          <p className="text-sm text-muted">Welcome back, <span className="text-white font-medium capitalize">{user.name || 'Hacker'}</span>.</p>
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
        
        {/* Financial Health Score Ring */}
        <div className="glass p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent z-0"></div>
          <h3 className="text-xs uppercase tracking-widest text-muted font-bold mb-4 z-10">Financial Health</h3>
          
          <div className={`relative w-32 h-32 rounded-full border-[8px] flex items-center justify-center transition-all duration-1000 ${scoreColor} z-10`}>
            {/* Confetti Animation Trigger condition placeholder */}
            <div className="flex flex-col items-center">
          <span className="text-4xl font-head font-black tracking-tighter">{healthScore}</span>
              <span className="text-[10px] uppercase tracking-widest text-muted mt-1">Score</span>
            </div>
            
            {/* Dynamic decorative ring particles */}
            <div className="absolute -inset-4 border border-dashed border-white/10 rounded-full animate-[spin_20s_linear_infinite]"></div>
          </div>
          
          <div className="mt-4 text-xs font-semibold uppercase tracking-wider text-center z-10 flex items-center gap-1">
            {healthScore >= 750 ? <><ShieldCheck className="w-4 h-4 text-emerald" /> Rockstar Status</> : 
             healthScore >= 600 ? <><Activity className="w-4 h-4 text-yellow" /> On Track</> : 
             <><AlertTriangle className="w-4 h-4 text-rose" /> Needs Attention</>}
          </div>
        </div>

        {/* Daily Briefing Card */}
        <div className="md:col-span-2 glass p-6 rounded-2xl flex flex-col justify-center relative shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border-emerald/20">
          <div className="absolute top-0 right-0 p-4 opacity-50"><Sparkles className="w-16 h-16 text-emerald/10" /></div>
          
          <div className="flex items-center gap-2 mb-3">
             <div className="w-8 h-8 rounded-full bg-emerald text-bg flex items-center justify-center shadow-[0_0_15px_rgba(200,241,53,0.5)]">
               <Sparkles className="w-4 h-4" />
             </div>
             <h2 className="font-head font-bold text-lg text-white">Daily AI Briefing</h2>
          </div>
          
          <p className="text-base text-muted/90 leading-relaxed max-w-xl font-medium">
            "{generateInsight()}"
          </p>

          <div className="mt-5 flex gap-4">
             <div className="bg-surface/50 border border-border px-4 py-2 rounded-xl">
               <div className="text-[10px] uppercase tracking-widest text-muted">Safe Spend Limit</div>
               <div className="text-lg font-bold text-emerald">{fmt(Math.max(0, dailyLimit))} <span className="text-xs text-muted font-normal">/ day</span></div>
             </div>
             <div className="bg-surface/50 border border-border px-4 py-2 rounded-xl">
               <div className="text-[10px] uppercase tracking-widest text-muted">Spent Today</div>
               <div className={`text-lg font-bold ${overspend > 0 ? 'text-rose' : 'text-white'}`}>{fmt(todaySpent)}</div>
             </div>
          </div>
        </div>
      </div>

      {/* Advanced Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        
        {/* Wishlist Loading Bar */}
        <div className="glass p-6 rounded-2xl flex flex-col gap-4 border-t-2 border-t-emerald/30 relative overflow-hidden">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-sm font-bold font-head uppercase tracking-wider text-emerald">Goal Progression</h3>
              <p className="text-xs text-muted mt-1">Funding: {wishlist.goalName}</p>
            </div>
            <div className="text-right">
            <div className="text-2xl font-black font-head tracking-tighter text-white">{goalProgressPercent}%</div>
              <div className="text-[10px] text-muted uppercase tracking-widest">Funded</div>
            </div>
          </div>

          {/* Premium Loading Bar */}
          <div className="w-full h-8 bg-surface border border-border rounded-full p-1 relative overflow-hidden shadow-inner">
             <div 
               className="h-full bg-emerald rounded-full relative overflow-hidden transition-all duration-1000 ease-out flex items-center justify-end px-2"
               style={{ width: `${Math.max(5, goalProgressPercent)}%` }}
             >
                {/* Shine effect */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 rounded-full"></div>
                {/* Striped texture */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)'}}></div>
             </div>
          </div>
          
          <div className="flex justify-between text-[10px] uppercase tracking-widest font-semibold text-muted">
             <span>{fmt(totalSavedSoFar)} Saved</span>
             <span>Target: {fmt(wishlist.goalPrice)}</span>
          </div>
        </div>

        {/* Category Donut (Fixed Responsive Container Issue by using absolute sizing wrapper) */}
        <div className="glass p-6 rounded-2xl flex flex-col">
          <h3 className="text-sm font-bold font-head uppercase tracking-wider text-white mb-4">Category Analysis</h3>
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
                <span className="text-xl font-bold font-head text-white">{fmt(monthSpent)}</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Premium SVG Sankey (Money Flow) Diagram */}
      <div className="glass p-6 rounded-2xl w-full border border-border relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald/5 blur-[100px] rounded-full pointer-events-none"></div>
        
        <h3 className="text-sm font-bold font-head uppercase tracking-wider text-white mb-6">Cash Flow Architecture</h3>
        
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
            <div className="z-10 bg-surface border border-emerald/50 p-4 rounded-xl shadow-[0_0_20px_rgba(200,241,53,0.1)] flex flex-col items-center w-36">
              <span className="text-[10px] text-emerald uppercase tracking-widest font-bold">Income</span>
              <span className="text-xl font-black font-head text-white">{fmt(wishlist.income)}</span>
            </div>

            {/* Split Nodes */}
            <div className="z-10 flex flex-col justify-between h-full py-4 gap-4">
               {/* Essential Node */}
               <div className="bg-surface border border-rose/30 p-3 rounded-xl flex flex-col items-center w-36">
                 <span className="text-[10px] text-rose uppercase tracking-widest font-bold">Fixed Bills</span>
                 <span className="text-lg font-black font-head text-white">{fmt(wishlist.essentialBills)}</span>
               </div>
               
               {/* Discretionary Node */}
               <div className="bg-surface border border-yellow/30 p-3 rounded-xl flex flex-col items-center w-36 relative overflow-hidden">
                 <div className="absolute inset-0 bg-yellow/5"></div>
                 <span className="text-[10px] text-yellow uppercase tracking-widest font-bold z-10">Spent</span>
                 <span className="text-lg font-black font-head text-white z-10">{fmt(monthSpent)}</span>
               </div>
               
               {/* Savings Node */}
               <div className="bg-surface border border-blue/50 p-3 rounded-xl shadow-[0_0_15px_rgba(106,240,216,0.2)] flex flex-col items-center w-36">
                 <span className="text-[10px] text-blue uppercase tracking-widest font-bold">Saved (To Goal)</span>
                 <span className="text-lg font-black font-head text-white">{fmt(totalSavedSoFar)}</span>
               </div>
            </div>

          </div>
        </div>
        <p className="text-[10px] text-muted text-center mt-2 uppercase tracking-widest">Live Dynamic Distribution Mapping</p>
      </div>

    </div>
  );
}
