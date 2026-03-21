import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { showToast } from './ToastContainer';

const MOCK_MERCHANTS = ['Amazon', 'Uber', 'Zomato', 'Starbucks', 'Netflix', 'Shell', 'Apollo Pharmacy', 'Coursera'];
const MOCK_CATS = ['Shopping', 'Transport', 'Food', 'Food', 'Entertainment', 'Transport', 'Health', 'Education'];

export default function DemoModule() {
  const { addTransaction, processGlobalTransaction } = useAppContext();
  const [loading, setLoading] = useState(false);

  const simulateData = () => {
    setLoading(true);
    
    setTimeout(() => {
      const today = new Date();
      
      for(let i = 0; i < 50; i++) {
         const randomDays = Math.floor(Math.random() * 90); // last 3 months
         const date = new Date(today);
         date.setDate(date.getDate() - randomDays);
         
         const mIdx = Math.floor(Math.random() * MOCK_MERCHANTS.length);
         const merchant = MOCK_MERCHANTS[mIdx];
         const cat = MOCK_CATS[mIdx];
         const amount = Number((Math.random() * 100 + 10).toFixed(2));

         const tx = {
           amount,
           merchant,
           category: cat,
           date: date.toISOString().slice(0, 10)
         };
         
         addTransaction(tx);
         processGlobalTransaction(merchant, cat);
      }

      setLoading(false);
      showToast("Generated 50+ diverse transactions!", "success");
    }, 800);
  };

  return (
    <button 
      onClick={simulateData}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-surface hover:opacity-80/5 border border-border rounded-xl text-xs font-mono text-muted hover:text-text transition-colors disabled:opacity-50"
    >
      <Zap className={`w-3 h-3 ${loading ? 'animate-pulse text-accent' : 'text-blue'}`} />
      <span>{loading ? 'Simulating Database...' : 'Demo Mode (50+ TXs)'}</span>
    </button>
  );
}
