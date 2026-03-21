import React from 'react';
import { useAppContext } from '../context/AppContext';
import { LogOut, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { wishlist, setWishlist, setUser, transactions } = useAppContext();
  const navigate = useNavigate();
  
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
    
    const headers = ['ID', 'Date', 'Merchant', 'Category', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => `${t.id},${t.date},"${t.merchant}",${t.category},${t.amount}`)
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
    <div className="w-full h-full flex flex-col gap-6 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl font-bold font-head tracking-tight">Goal & settings</h1>
        <p className="text-sm text-muted">Configure your wishlists and parameters.</p>
      </header>

      <div className="glass p-6 flex flex-col gap-4 max-w-lg">
        <h2 className="text-lg font-bold font-head">Wishlist Planner</h2>
        
        <div className="flex flex-col gap-2">
           <label className="text-xs text-muted uppercase tracking-wider">Monthly Income</label>
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
             <label className="text-xs text-muted uppercase tracking-wider">Goal Target ($)</label>
             <input type="number" 
                className="bg-surface border border-border p-3 rounded-xl outline-none focus:border-emerald transition-colors"
                value={wishlist.goalPrice}
                onChange={(e) => setWishlist({...wishlist, goalPrice: Number(e.target.value)})}
             />
           </div>
        </div>
      </div>

      <div className="glass p-6 flex flex-col gap-4 max-w-lg mt-2 border-emerald/30/10">
        <h2 className="text-lg font-bold font-head text-emerald">Export Data</h2>
        <p className="text-sm text-muted">Download all your transactions as an Excel-compatible CSV file.</p>
        <button onClick={handleExportCSV} className="flex items-center justify-center gap-2 bg-emerald/10 hover:bg-emerald/20 text-emerald border border-emerald/20 p-3 rounded-xl transition-colors font-bold tracking-wide mt-2">
           <Download className="w-5 h-5" /> Export to Excel (CSV)
        </button>
      </div>

      <div className="glass p-6 flex flex-col gap-4 max-w-lg mt-2 border-rose/30/10">
        <h2 className="text-lg font-bold font-head text-rose">Account</h2>
        <p className="text-sm text-muted">Sign out of your account to switch to another profile or start fresh.</p>
        <button onClick={handleLogout} className="flex items-center justify-center gap-2 bg-rose/10 hover:bg-rose/20 text-rose border border-rose/20 p-3 rounded-xl transition-colors font-bold tracking-wide mt-2">
           <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </div>
    </div>
  );
}
