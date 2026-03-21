import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Lock, Mail, ShieldAlert } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  
  const { setUser } = useAppContext();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email && password) {
      setUser(prev => ({
        ...prev,
        isAuthenticated: true,
        email: email,
        name: prev.name || email.split('@')[0],
      }));
      navigate('/dashboard');
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center relative p-4 bg-bg text-text font-mono z-50">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-50 z-0"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald/10 blur-[100px] rounded-full z-0 pointer-events-none"></div>

      {/* Login Card */}
      <div className="glass w-full max-w-sm p-8 rounded-3xl shadow-2xl z-10 animate-in zoom-in-95 duration-500">
        
        <div className="text-center mb-8">
           <div className="w-12 h-12 rounded-xl bg-emerald mx-auto flex items-center justify-center font-head font-bold text-bg text-3xl shadow-[0_0_20px_rgba(200,241,53,0.3)] mb-4">
             F
           </div>
           <h1 className="font-head font-bold text-3xl tracking-tight text-white mb-2">Welcome Back</h1>
           <p className="text-sm text-muted">Sign in to FinFlow AI</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
           
           <div className="flex flex-col gap-1 relative">
              <label className="text-[10px] text-muted uppercase tracking-widest pl-1 font-semibold">Email Address</label>
              <div className="relative flex items-center">
                 <Mail className="absolute left-3 w-4 h-4 text-muted" />
                 <input 
                   type="email" 
                   required
                   className="w-full bg-surface/50 border border-border p-3 pl-10 rounded-xl outline-none focus:border-emerald focus:bg-surface/80 transition-all focus:ring-1 ring-emerald placeholder-muted text-sm"
                   placeholder="you@example.com"
                   value={email}
                   onChange={e => setEmail(e.target.value)}
                 />
              </div>
           </div>

           <div className="flex flex-col gap-1 relative">
              <div className="flex justify-between items-end pl-1">
                 <label className="text-[10px] text-muted uppercase tracking-widest font-semibold">Password</label>
                 <a href="#" className="text-[10px] text-emerald hover:underline">Forgot?</a>
              </div>
              <div className="relative flex items-center">
                 <Lock className="absolute left-3 w-4 h-4 text-muted" />
                 <input 
                   type="password" 
                   required
                   className="w-full bg-surface/50 border border-border p-3 pl-10 rounded-xl outline-none focus:border-emerald focus:bg-surface/80 transition-all focus:ring-1 ring-emerald placeholder-muted text-sm tracking-widest"
                   placeholder="••••••••"
                   value={password}
                   onChange={e => setPassword(e.target.value)}
                 />
              </div>
           </div>

           <div className="flex items-center gap-2 mt-1">
              <input 
                 type="checkbox" 
                 id="remember" 
                 className="accent-emerald w-4 h-4 rounded cursor-pointer"
                 checked={remember}
                 onChange={e => setRemember(e.target.checked)}
              />
              <label htmlFor="remember" className="text-xs text-muted cursor-pointer select-none">Remember this device</label>
           </div>

           <button 
             type="submit" 
             className="mt-2 w-full bg-emerald text-bg font-head font-bold text-base py-3.5 rounded-xl hover:bg-white hover:-translate-y-0.5 shadow-[0_4px_14px_rgba(200,241,53,0.3)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.4)] transition-all active:translate-y-0"
           >
             Sign In
           </button>

           <div className="mt-4 text-center">
             <p className="text-xs text-muted flex items-center justify-center gap-1.5">
               <ShieldAlert className="w-3 h-3 text-emerald" /> Secure Encrypted Connection
             </p>
           </div>
        </form>

      </div>
    </div>
  );
}
