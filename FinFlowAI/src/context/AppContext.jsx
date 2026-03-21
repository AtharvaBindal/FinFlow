import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { applyTheme } from '../utils/theme';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Global State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('finflow_user');
    return saved ? JSON.parse(saved) : {
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      name: '',
      email: '',
      currency: 'USD',
      accentColor: '#c8f135',
      safeSpendOverride: 0, // 0 = auto-calculate, >0 = user-set daily limit
      permissions: { sms: false, location: false, community: false }
    };
  });

  const getStorageKey = (key) => user.email ? `${key}_${user.email}` : key;

  // Apply theme palette whenever accent color changes
  useEffect(() => {
    applyTheme(user.accentColor || '#c8f135');
  }, [user.accentColor]);

  const [transactions, setTransactions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [wishlist, setWishlist] = useState({ income: 50000, goalName: 'Vacation', goalPrice: 20000, essentialBills: 15000 });

  // Load User Specific Data
  useEffect(() => {
    if (user.email) {
      const savedTx = localStorage.getItem(getStorageKey('finflow_transactions'));
      setTransactions(savedTx ? JSON.parse(savedTx) : []);
      
      const savedLogs = localStorage.getItem(getStorageKey('finflow_audit_logs'));
      setAuditLogs(savedLogs ? JSON.parse(savedLogs) : []);
      
      const savedBudgets = localStorage.getItem(getStorageKey('finflow_budgets'));
      setBudgets(savedBudgets ? JSON.parse(savedBudgets) : {
          Food: 5000, Transport: 3000, Shopping: 4000, Health: 2000,
          Entertainment: 2000, Bills: 6000, Education: 3000, Other: 2000
      });

      const savedWishlist = localStorage.getItem(getStorageKey('finflow_wishlist'));
      setWishlist(savedWishlist ? JSON.parse(savedWishlist) : {
          income: 50000, goalName: 'Vacation', goalPrice: 20000, essentialBills: 15000
      });
    }
  }, [user.email]);
  
  // Crowdsourced Merchant Intelligence (Global Merch DB Simulation)
  const [globalMerchants, setGlobalMerchants] = useState(() => {
    const saved = localStorage.getItem('finflow_global_merch');
    return saved ? JSON.parse(saved) : {
      'swiggy': { transactionCount: 10, communityCategory: 'Food', userTags: {} },
      'amazon': { transactionCount: 8, communityCategory: 'Shopping', userTags: {} },
      'zomato': { transactionCount: 15, communityCategory: 'Food', userTags: {} },
      'uber': { transactionCount: 7, communityCategory: 'Transport', userTags: {} }
    };
  });
  
  // Save State
  useEffect(() => {
    localStorage.setItem('finflow_user', JSON.stringify(user));
    if (user.email) {
      localStorage.setItem(`finflow_transactions_${user.email}`, JSON.stringify(transactions));
      localStorage.setItem(`finflow_audit_logs_${user.email}`, JSON.stringify(auditLogs));
      localStorage.setItem(`finflow_budgets_${user.email}`, JSON.stringify(budgets));
      localStorage.setItem(`finflow_wishlist_${user.email}`, JSON.stringify(wishlist));
    }
    localStorage.setItem('finflow_global_merch', JSON.stringify(globalMerchants));
  }, [user, transactions, auditLogs, budgets, wishlist, globalMerchants]);

  // ─── Balance & Spending Calculations ───────────────────────────────────
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const { monthSpent, monthDeposits, balance, balancePercent } = useMemo(() => {
    const thisMonthTxs = transactions.filter(t => t.date?.startsWith(currentMonth));
    const spent = thisMonthTxs.filter(t => t.type !== 'deposit').reduce((a, t) => a + t.amount, 0);
    const deposits = thisMonthTxs.filter(t => t.type === 'deposit').reduce((a, t) => a + t.amount, 0);
    const bal = Math.max(0, wishlist.income + deposits - spent);
    const pct = wishlist.income > 0 ? (bal / wishlist.income) * 100 : 100;
    return { monthSpent: spent, monthDeposits: deposits, balance: bal, balancePercent: pct };
  }, [transactions, wishlist.income, currentMonth]);

  // ─── Balance Warning Tier ──────────────────────────────────────────────
  const balanceWarning = useMemo(() => {
    if (balancePercent <= 10)  return { level: 'critical', label: '⚠️ CRITICAL — Under 10% balance left!', color: '#ff3b3b' };
    if (balancePercent <= 25)  return { level: 'danger',   label: '🔴 Danger — 25% balance remaining',    color: '#ff6b6b' };
    if (balancePercent <= 50)  return { level: 'warning',  label: '🟡 Warning — 50% balance used up',     color: '#ffa94d' };
    if (balancePercent <= 75)  return { level: 'caution',  label: '🟢 Caution — 75% spent, stay mindful', color: '#6af0d8' };
    return null; // >75% remaining = healthy, no warning
  }, [balancePercent]);

  // Methods
  const addTransaction = (t) => {
    // Balance guard — prevent expense exceeding remaining balance
    if (t.type !== 'deposit' && t.amount > balance) {
      return { blocked: true, reason: `Insufficient balance. You have ${balance.toFixed(2)} remaining.` };
    }
    const newTx = { id: Date.now(), type: 'expense', ...t };
    setTransactions(prev => [newTx, ...prev]);
    return newTx;
  };
  
  const editTransaction = (id, updatedFields) => {
    let oldTx = null;
    let newTx = null;

    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        oldTx = { ...t };
        newTx = { ...t, ...updatedFields };
        return newTx;
      }
      return t;
    }));

    // If transaction found and updated, log the audit
    setTimeout(() => {
        if (oldTx && newTx) {
        setAuditLogs(prev => [
            {
            id: Date.now(),
            txId: id,
            timestamp: new Date().toISOString(),
            oldData: oldTx,
            newData: newTx
            },
            ...prev
        ]);
        }
    }, 0);

    return newTx;
  };
  
  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };
  
  const processGlobalTransaction = (merchant, category) => {
    if (!user.permissions.community) return;
    const normMerchant = merchant.toLowerCase().trim();
    setGlobalMerchants(prev => {
      const existing = prev[normMerchant] || { transactionCount: 0, communityCategory: null, userTags: {} };
      return {
        ...prev,
        [normMerchant]: {
          ...existing,
          transactionCount: existing.transactionCount + 1,
          communityCategory: existing.communityCategory || category 
        }
      };
    });
  };

  return (
    <AppContext.Provider value={{
      user, setUser,
      transactions, addTransaction, editTransaction, deleteTransaction, setTransactions,
      auditLogs,
      budgets, setBudgets,
      wishlist, setWishlist,
      globalMerchants, processGlobalTransaction,
      monthSpent, monthDeposits, balance, balancePercent, balanceWarning,
      currentMonth
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
