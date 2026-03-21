import React, { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { parseMagicInput, checkGuiltTrip } from '../utils/logic';
import { showToast } from './ToastContainer';

export default function MagicBox() {
  const [input, setInput] = useState('');
  const { addTransaction, transactions, processGlobalTransaction } = useAppContext();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 1. Parse NLP Input
    const parsedData = parseMagicInput(input);
    if (!parsedData.amount) {
      showToast("Couldn't find an amount. Try again!", "error");
      return;
    }

    // 2. Guilt Trip Scanner
    const guiltTripMsg = checkGuiltTrip(transactions, parsedData.merchant, parsedData.category);

    // 3. Add to Transactions
    addTransaction(parsedData);
    
    // 4. Update Crowdsourced Intelligence Global State
    processGlobalTransaction(parsedData.merchant, parsedData.category);

    // 5. Success Notifications
    showToast(`Added $${parsedData.amount} for ${parsedData.merchant} ✓`, "success");
    
    if (guiltTripMsg) {
      setTimeout(() => {
        showToast(guiltTripMsg, "error");
      }, 500);
    }

    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full relative group">
      <div className="absolute inset-0 bg-emerald/20 blur-xl group-hover:bg-emerald/30 transition-all rounded-full z-0 pointer-events-none"></div>
      
      <div className="relative z-10 bg-card border border-border flex items-center p-2 rounded-full shadow-lg">
        <div className="pl-4 pr-3 text-emerald animate-pulse">
          <Sparkles className="w-5 h-5" />
        </div>
        
        <input 
          type="text"
          className="flex-1 bg-transparent outline-none text-text placeholder-muted px-2 min-w-0"
          placeholder="e.g. 1500 for groceries at Reliance today..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        
        <button 
          type="submit"
          disabled={!input.trim()}
          className="bg-emerald text-bg p-3 rounded-full hover:bg-white transition-colors disabled:opacity-50 flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
