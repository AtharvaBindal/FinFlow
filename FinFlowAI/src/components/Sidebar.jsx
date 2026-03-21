import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Receipt, PieChart, Settings, Target, LogOut, Ghost } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', path: '/transactions', icon: Receipt },
  { name: 'Budgeting', path: '/budgeting', icon: PieChart },
  { name: 'Vampires', path: '/subscriptions', icon: Ghost },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar() {
  const { user, setUser, wishlist, transactions } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser({
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      name: '',
      currency: 'USD',
      permissions: { sms: false, location: false, community: false }
    });
    navigate('/login');
  };

  // Wishlist Math
  // Dream Tracker Math (Identical to Dashboard calculation)
  const totalSavedSoFar = Math.max(0, (balance || 0) - (wishlist.essentialBills || 0));
  const goalProgressPct = Math.min(100, wishlist.goalPrice > 0 ? (totalSavedSoFar / wishlist.goalPrice) * 100 : 0);
  
  const getProgressColor = (pct) => {
    const r = Math.round(255 - (pct / 100) * (255 - 30));
    const g = Math.round(60 + (pct / 100) * (179 - 60));
    const b = Math.round(60 - (pct / 100) * 60);
    return `rgb(${r},${g},${b})`;
  };

  return (
    <div className="glass w-full h-full flex flex-col pt-8 pb-6 px-4 shadow-2xl relative overflow-hidden">
      <div className="flex items-center gap-2 mb-10 px-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-head font-bold text-bg text-xl" style={{ backgroundColor: 'var(--color-accent)', boxShadow: '0 0 10px var(--color-accent-glow)' }}>F</div>
        <h1 className="font-head font-bold text-2xl tracking-tight text-text">Fin<span style={{ color: 'var(--color-accent)' }}>Flow</span></h1>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => isActive ? {
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-bg)',
                fontWeight: 600,
              } : {}}
              className={({ isActive }) => 
                `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive ? 'shadow-md' : 'text-muted hover:text-text hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm tracking-wide">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Wishlist Tracker Panel */}
      <div className="mt-6 mb-6 px-2">
        <div className="bg-surface border border-border rounded-2xl p-4 shadow-inner relative overflow-hidden">
          <div className="flex items-center gap-2 text-xs font-bold font-head tracking-widest uppercase text-text mb-3">
             <Target className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
             Dream Tracker
          </div>
          
          <div className="flex flex-col gap-1 mb-3">
             <span className="text-[10px] text-muted uppercase tracking-widest">{wishlist.goalName}</span>
             <span className="text-lg font-head font-bold text-[#2c9b99]">${wishlist.goalPrice.toLocaleString()}</span>
          </div>

          <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden mb-2 relative border border-[#2c9b99]/30">
             <div className="h-full transition-all duration-1000 ease-out" style={{ width: `${goalProgressPct}%`, backgroundColor: getProgressColor(goalProgressPct) }}></div>
          </div>
          
          <div className="text-[10px] text-muted flex justify-between">
             <span>Status:</span>
             <span className={goalProgressPct >= 100 ? "text-[#1eb300] font-semibold" : goalProgressPct > 30 ? "text-yellow font-semibold" : "text-rose font-semibold"}>
               {goalProgressPct >= 100 ? 'ACHIEVED' : goalProgressPct > 30 ? 'ON TRACK' : 'AT RISK'}
             </span>
          </div>
        </div>
      </div>

      <div className="mt-auto px-2">
        <div className="flex items-center justify-between px-2 py-2 rounded-xl border border-border bg-surface/50 mb-2">
          <NavLink to="/profile" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-full text-bg flex items-center justify-center font-bold tracking-widest text-xs uppercase transition-transform group-hover:scale-105 shadow-sm" style={{ backgroundColor: 'var(--color-accent)', boxShadow: '0 0 10px var(--color-accent-glow)' }}>
              {user.name ? user.name.slice(0,2) : 'AI'}
            </div>
            <div>
              <div className="text-sm font-semibold text-text tracking-wide truncate max-w-[100px] group-hover:text-accent transition-colors">{user.name || 'Hacker'}</div>
              <div className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--color-accent)' }}>Pro Member</div>
            </div>
          </NavLink>
          <button onClick={handleLogout} className="p-2 text-muted hover:text-rose hover:bg-rose/10 rounded-lg transition-colors" title="Logout / Switch Account">
             <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
