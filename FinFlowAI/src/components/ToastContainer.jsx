/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect } from 'react';

// A simple global toast system
let addToastFn;

export const showToast = (message, type = 'success') => {
  if (addToastFn) addToastFn({ id: Date.now(), message, type });
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    addToastFn = (toast) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 3000);
    };
  }, []);

  return (
    <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map(toast => (
        <div 
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-xl border flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300
            ${toast.type === 'error' ? 'bg-rose/10 border-rose text-rose' : 'bg-accent text-bg font-semibold'}`}
        >
          <span className="text-sm font-head tracking-wide">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
