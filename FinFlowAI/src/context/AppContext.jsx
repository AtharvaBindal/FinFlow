import { createContext, useContext, useState, useEffect } from 'react';

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
      permissions: { sms: false, location: false, community: false }
    };
  });

  const getStorageKey = (key) => user.email ? `${key}_${user.email}` : key;

  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [wishlist, setWishlist] = useState({ income: 50000, goalName: 'Vacation', goalPrice: 20000, essentialBills: 15000 });

  // Load User Specific Data
  useEffect(() => {
    if (user.email) {
      const savedTx = localStorage.getItem(getStorageKey('finflow_transactions'));
      setTransactions(savedTx ? JSON.parse(savedTx) : []);
      
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
      localStorage.setItem(`finflow_budgets_${user.email}`, JSON.stringify(budgets));
      localStorage.setItem(`finflow_wishlist_${user.email}`, JSON.stringify(wishlist));
    }
    localStorage.setItem('finflow_global_merch', JSON.stringify(globalMerchants));
  }, [user, transactions, budgets, wishlist, globalMerchants]);

  // Methods
  const addTransaction = (t) => {
    const newTx = { id: Date.now(), ...t };
    setTransactions(prev => [newTx, ...prev]);
    return newTx;
  };
  
  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };
  
  const processGlobalTransaction = (merchant, category) => {
    if (!user.permissions.community) return; // Opt-in strictly respected

    const normMerchant = merchant.toLowerCase().trim();
    setGlobalMerchants(prev => {
      const existing = prev[normMerchant] || { transactionCount: 0, communityCategory: null, userTags: {} };
      const newCount = existing.transactionCount + 1;
      
      return {
        ...prev,
        [normMerchant]: {
          ...existing,
          transactionCount: newCount,
          communityCategory: existing.communityCategory || category 
        }
      };
    });
  };

  return (
    <AppContext.Provider value={{
      user, setUser,
      transactions, addTransaction, deleteTransaction,
      budgets, setBudgets,
      wishlist, setWishlist,
      globalMerchants, processGlobalTransaction
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
