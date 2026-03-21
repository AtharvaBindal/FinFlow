import React from 'react';
import { useAppContext } from '../context/AppContext';
import MagicBox from '../components/MagicBox';
import DemoModule from '../components/DemoModule';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#c8f135', '#6af0d8', '#ff6b6b', '#ffa94d', '#cc8cff', '#5bc0eb', '#f7d070', '#888888'];

export default function Dashboard() {
  const { transactions, budgets, wishlist } = useAppContext();
  
  // Calculate Totals
  const totalSpent = transactions.reduce((acc, t) => acc + t.amount, 0);
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonthTxs = transactions.filter(t => t.date.startsWith(currentMonth));
  const monthSpent = thisMonthTxs.reduce((acc, t) => acc + t.amount, 0);

  // Categorized Data for Donut
  const catTotals = {};
  thisMonthTxs.forEach(t => {
     catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
  });
  const donutData = Object.entries(catTotals).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);

  // Daily Trend Data for Line Chart
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const trendData = [];
  let cumulative = 0;
  for (let i = 1; i <= daysInMonth; i++) {
     const dateStr = `${currentMonth}-${i.toString().padStart(2, '0')}`;
     const daySpent = thisMonthTxs.filter(t => t.date === dateStr).reduce((a, b) => a + b.amount, 0);
     cumulative += daySpent;
     if (i <= new Date().getDate()) {
       trendData.push({ day: i, spent: cumulative, limit: wishlist.income - wishlist.essentialBills });
     }
  }

  // Wishlist Daily Safe Limit
  const dailyLimit = (wishlist.income - wishlist.essentialBills - wishlist.goalPrice) / daysInMonth;
  const todaySpent = thisMonthTxs.filter(t => t.date === new Date().toISOString().slice(0, 10)).reduce((a, b) => a + b.amount, 0);

  // Calculate Delay Metrics (X days further away)
  const overspend = todaySpent - dailyLimit;
  const safePacePerDay = wishlist.income - wishlist.essentialBills > 0 ? (wishlist.income - wishlist.essentialBills - wishlist.goalPrice) / daysInMonth : 1; 
  const daysDelayed = overspend > 0 ? Math.ceil(overspend / safePacePerDay) : 0;


  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-head tracking-tight">Overview</h1>
          <p className="text-sm text-muted">Welcome back, here's your financial summary.</p>
        </div>
        <div className="flex items-center gap-3">
          <DemoModule />
          <div className="text-xs bg-card border border-border px-3 py-1.5 rounded-full text-muted">
            {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
      </header>
      
      {/* Laziness Bypass Magic Box */}
      <div className="w-full">
        <MagicBox />
      </div>

      {/* Wishlist Planner Warning */}
      {overspend > 0 && dailyLimit > 0 && (
        <div className="glass bg-rose/10 border-rose/30 p-5 rounded-2xl flex items-start gap-4 text-rose animate-in slide-in-from-top-4 shadow-[0_4px_20px_rgba(255,107,107,0.1)]">
           <div className="w-2.5 h-2.5 rounded-full bg-rose mt-1.5 animate-pulse shadow-[0_0_8px_rgba(255,107,107,0.8)]"></div>
           <div>
              <p className="text-base font-bold font-head tracking-wide">Goal Compromised!</p>
              <p className="text-sm mt-1 text-rose/80">
                You spent <span className="font-bold text-white">${overspend.toFixed(0)}</span> more than your daily safe limit today. 
                Your {wishlist.goalName} goal is now <b className="text-white">{daysDelayed} days</b> further away!
              </p>
           </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="glass p-5 flex flex-col gap-1 border-emerald/50">
            <span className="text-xs text-muted uppercase tracking-wider">Total Spent</span>
            <span className="text-2xl font-bold font-head text-emerald">${totalSpent.toFixed(2)}</span>
         </div>
         <div className="glass p-5 flex flex-col gap-1 border-blue/50">
            <span className="text-xs text-muted uppercase tracking-wider">This Month</span>
            <span className="text-2xl font-bold font-head text-blue">${monthSpent.toFixed(2)}</span>
         </div>
         <div className="glass p-5 flex flex-col gap-1 border-yellow/50">
            <span className="text-xs text-muted uppercase tracking-wider">Daily Limit</span>
            <span className="text-2xl font-bold font-head text-yellow">${dailyLimit > 0 ? dailyLimit.toFixed(0) : 0}</span>
         </div>
         <div className="glass p-5 flex flex-col gap-1">
            <span className="text-xs text-muted uppercase tracking-wider">Goal Savings</span>
            <span className="text-2xl font-bold font-head text-white">${wishlist.goalPrice}</span>
         </div>
      </div>
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 glass p-5 flex flex-col gap-4">
          <h3 className="text-sm text-muted uppercase tracking-wider">Monthly Spend vs Limit</h3>
          <div className="flex-1 w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff12" vertical={false} />
                <XAxis dataKey="day" stroke="#6b6b82" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b6b82" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#16161f', borderColor: '#ffffff12', borderRadius: '8px' }}
                  itemStyle={{ color: '#f0f0f5' }}
                />
                <Line type="monotone" dataKey="spent" stroke="#c8f135" strokeWidth={3} dot={false} name="Cumulative Spend" />
                <Line type="stepAfter" dataKey="limit" stroke="#ff6b6b" strokeWidth={1} strokeDasharray="5 5" dot={false} name="Max Limit" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-5 flex flex-col gap-4">
          <h3 className="text-sm text-muted uppercase tracking-wider">Category Breakdown</h3>
          <div className="flex-1 w-full h-64 relative flex items-center justify-center">
            {donutData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#16161f', borderColor: '#ffffff12', borderRadius: '8px' }}
                    itemStyle={{ color: '#f0f0f5' }}
                    formatter={(value) => `$${value.toFixed(2)}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-muted text-sm border border-dashed border-border p-4 rounded-xl">No data to chart</div>
            )}
            {donutData.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                <span className="text-xs text-muted">Total</span>
                <span className="text-lg font-bold font-head">${monthSpent.toFixed(0)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
