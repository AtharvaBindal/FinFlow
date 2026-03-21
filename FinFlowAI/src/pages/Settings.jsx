import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { LogOut, Download, Clock, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCurrencySymbol, CURRENCIES } from '../utils/currency';
import ColorPicker from '../components/ColorPicker';


export default function Settings() {
  const { user, wishlist, setWishlist, setUser, transactions } = useAppContext();
  const navigate = useNavigate();
  const currencySymbol = getCurrencySymbol(user.currency || 'USD');

  // Pull login history for current user
  const loginHistory = useMemo(() => {
    if (!user.email) return [];
    const raw = localStorage.getItem(`finflow_login_history_${user.email}`);
    return raw ? JSON.parse(raw) : [];
  }, [user.email]);

  const handleLogout = () => {
    setUser({
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      name: '',
      email: '',
      currency: 'USD',
      permissions: { sms: false, location: false, community: false }
    });
    navigate('/login');
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) return alert('No transactions to export!');
    const headers = ['ID', 'Date', 'Merchant', 'Category', 'Amount', 'Currency'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => `${t.id},${t.date},"${t.merchant}",${t.category},${t.amount},${user.currency || 'USD'}`)
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `finflow_data_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500 pb-20">
      <header>
        <h1 className="text-2xl font-bold font-head tracking-tight">Goal & Settings</h1>
        <p className="text-sm text-muted">Configure your wishlists and parameters.</p>
      </header>

      {/* Appearance — Color Theme */}
      <div className="glass p-6 flex flex-col gap-4 max-w-lg">
        <h2 className="text-lg font-bold font-head flex items-center gap-2" style={{ color: 'var(--color-accent)' }}>
          🎨 Appearance
        </h2>
        <p className="text-sm text-muted -mt-2">Choose your accent color — the app palette updates instantly.</p>
        <ColorPicker />
      </div>

      {/* Wishlist Planner */}
      <div className="glass p-6 flex flex-col gap-4 max-w-lg">
        <h2 className="text-lg font-bold font-head">Wishlist Planner</h2>
        
        <div className="flex flex-col gap-2">
           <label className="text-xs text-muted uppercase tracking-wider">Monthly Income ({currencySymbol})</label>
           <input type="number"
              className="bg-surface border border-border p-3 rounded-xl outline-none focus:border-emerald transition-colors"
              value={wishlist.income}
              onChange={(e) => setWishlist({...wishlist, income: Number(e.target.value)})}
           />
        </div>


        <div className="flex flex-col md:flex-row gap-4">
           <div className="flex flex-col gap-2 flex-1">
             <label className="text-xs text-muted uppercase tracking-wider">Goal Name</label>
             <input type="text"
                className="bg-surface border border-border p-3 rounded-xl outline-none focus:border-emerald transition-colors"
                value={wishlist.goalName}
                onChange={(e) => setWishlist({...wishlist, goalName: e.target.value})}
             />
           </div>
           
           <div className="flex flex-col gap-2 flex-1">
             <label className="text-xs text-muted uppercase tracking-wider">Goal Target ({currencySymbol})</label>
             <input type="number"
                className="bg-surface border border-border p-3 rounded-xl outline-none focus:border-emerald transition-colors"
                value={wishlist.goalPrice}
                onChange={(e) => setWishlist({...wishlist, goalPrice: Number(e.target.value)})}
             />
           </div>
        </div>

        <div className="flex flex-col gap-2">
           <label className="text-xs text-muted uppercase tracking-wider">Essential Bills / Month ({currencySymbol})</label>
           <input type="number"
              className="bg-surface border border-border p-3 rounded-xl outline-none focus:border-emerald transition-colors"
              value={wishlist.essentialBills}
              onChange={(e) => setWishlist({...wishlist, essentialBills: Number(e.target.value)})}
           />
        </div>
      </div>

      {/* Login History */}
      <div className="glass p-6 flex flex-col gap-4 max-w-lg border-blue/20">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue" />
          <h2 className="text-lg font-bold font-head text-blue">Login History</h2>
        </div>
        <p className="text-xs text-muted">Recent sessions for <span className="text-white">{user.email}</span></p>
        
        {loginHistory.length === 0 ? (
          <p className="text-sm text-muted border border-dashed border-border p-4 rounded-xl text-center">No history recorded yet.</p>
        ) : (
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
            {loginHistory.map((entry, idx) => {
              const date = new Date(entry.timestamp);
              return (
                <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${idx === 0 ? 'border-blue/30 bg-blue/5' : 'border-border bg-surface/50'}`}>
                  <div className="flex items-center gap-3">
                    <Monitor className={`w-4 h-4 ${idx === 0 ? 'text-blue' : 'text-muted'}`} />
                    <div>
                      <div className="text-xs text-muted truncate max-w-[200px]">{entry.userAgent || 'Unknown Device'}</div>
                      <div className="text-[10px] text-muted/60 font-mono">{date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                  {idx === 0 && <span className="text-[9px] font-bold text-blue bg-blue/10 border border-blue/20 px-2 py-0.5 rounded-full">CURRENT</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Export Data */}
      <div className="glass p-6 flex flex-col gap-4 max-w-lg">
        <h2 className="text-lg font-bold font-head text-emerald">Export Data</h2>
        <p className="text-sm text-muted">Download all your transactions as an Excel-compatible CSV file.</p>
        <button onClick={handleExportCSV} className="flex items-center justify-center gap-2 bg-emerald/10 hover:bg-emerald/20 text-emerald border border-emerald/20 p-3 rounded-xl transition-colors font-bold tracking-wide mt-2">
           <Download className="w-5 h-5" /> Export to Excel (CSV)
        </button>
      </div>

      {/* Account */}
      <div className="glass p-6 flex flex-col gap-4 max-w-lg">
        <h2 className="text-lg font-bold font-head text-rose">Account</h2>
        <p className="text-sm text-muted">Sign out of your account to switch to another profile or start fresh.</p>
        <button onClick={handleLogout} className="flex items-center justify-center gap-2 bg-rose/10 hover:bg-rose/20 text-rose border border-rose/20 p-3 rounded-xl transition-colors font-bold tracking-wide mt-2">
           <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </div>
    </div>
  );
}
