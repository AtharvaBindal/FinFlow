import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { User, DollarSign, Globe2, Bell, MapPin, Users, CheckCircle } from 'lucide-react';

export default function OnboardingModal() {
  const { user, setUser, setWishlist, wishlist } = useAppContext();
  
  const [step, setStep] = useState(1);
  const [name, setName] = useState(user.name || '');
  const [currency, setCurrency] = useState('USD');
  const [income, setIncome] = useState(50000);
  
  const [perms, setPerms] = useState({
    sms: false,
    location: false,
    community: true // Opt-in by default
  });

  if (user.hasCompletedOnboarding) return null;

  const nextStep = () => {
    if (step === 1 && name.trim() && income > 0) {
      setStep(2);
    }
  };

  const completeOnboarding = () => {
    setUser(prev => ({
      ...prev,
      name,
      currency,
      permissions: perms,
      hasCompletedOnboarding: true
    }));
    
    setWishlist(prev => ({
      ...prev,
      income: income
    }));
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-bg/80 backdrop-blur-md p-4">
      
      <div className="glass w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-500 overflow-hidden relative">
        
        {/* Step Indicator */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-surface flex">
          <div className={`h-full bg-emerald transition-all duration-500 ${step === 1 ? 'w-1/2' : 'w-full'}`}></div>
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-6">
             <div className="text-center">
               <div className="w-12 h-12 bg-white/5 border border-border rounded-full flex items-center justify-center mx-auto mb-4 text-emerald">
                 <User className="w-6 h-6" />
               </div>
               <h2 className="font-head font-bold text-2xl text-white">Financial Profile</h2>
               <p className="text-sm text-muted mt-1">Let's personalize your FinFlow AI engine.</p>
             </div>

             <div className="flex flex-col gap-4">
               <div>
                  <label className="text-[10px] uppercase text-muted tracking-widest ml-1 mb-1 block">Full Name</label>
                  <input type="text" className="w-full bg-surface border border-border p-3 rounded-xl outline-none focus:border-emerald text-sm" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />
               </div>
               <div className="flex gap-4">
                 <div className="flex-1">
                    <label className="text-[10px] uppercase text-muted tracking-widest ml-1 mb-1 block">Monthly Income</label>
                    <div className="relative flex items-center">
                      <DollarSign className="absolute left-3 w-4 h-4 text-muted" />
                      <input type="number" className="w-full bg-surface border border-border p-3 pl-9 rounded-xl outline-none focus:border-emerald text-sm" value={income} onChange={e => setIncome(Number(e.target.value))} />
                    </div>
                 </div>
                 <div className="w-1/3">
                    <label className="text-[10px] uppercase text-muted tracking-widest ml-1 mb-1 block">Currency</label>
                    <select className="w-full bg-surface border border-border p-3 rounded-xl outline-none focus:border-emerald text-sm" value={currency} onChange={e => setCurrency(e.target.value)}>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                 </div>
               </div>
             </div>

             <button onClick={nextStep} disabled={!name.trim() || income <= 0} className="w-full py-3 bg-emerald text-bg font-bold font-head rounded-xl disabled:opacity-50 mt-2 hover:bg-white transition-colors">
               Continue
             </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-6 animate-in slide-in-from-right-10">
             <div className="text-center">
               <div className="w-12 h-12 bg-yellow/10 border border-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow">
                 <Globe2 className="w-6 h-6" />
               </div>
               <h2 className="font-head font-bold text-2xl text-white">Data & Permissions</h2>
               <p className="text-sm text-muted mt-1">Enhance your experience with smart connectivity.</p>
             </div>

             <div className="flex flex-col gap-3">
                <label className="flex items-start gap-3 p-4 bg-surface rounded-xl border border-border cursor-pointer group hover:bg-white/5 transition-colors">
                  <div className="mt-0.5"><Bell className={`w-5 h-5 ${perms.sms ? 'text-emerald' : 'text-muted'}`} /></div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">SMS/Notifications</div>
                    <div className="text-[10px] text-muted leading-relaxed">For real-time spending alerts and goal warnings.</div>
                  </div>
                  <input type="checkbox" className="accent-emerald w-4 h-4 mt-1" checked={perms.sms} onChange={e => setPerms({...perms, sms: e.target.checked})} />
                </label>

                <label className="flex items-start gap-3 p-4 bg-surface rounded-xl border border-border cursor-pointer group hover:bg-white/5 transition-colors">
                  <div className="mt-0.5"><MapPin className={`w-5 h-5 ${perms.location ? 'text-emerald' : 'text-muted'}`} /></div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">Location Data</div>
                    <div className="text-[10px] text-muted leading-relaxed">Tag merchant locations for superior auto-categorization maps.</div>
                  </div>
                  <input type="checkbox" className="accent-emerald w-4 h-4 mt-1" checked={perms.location} onChange={e => setPerms({...perms, location: e.target.checked})} />
                </label>

                <label className="flex items-start gap-3 p-4 bg-surface rounded-xl border border-border cursor-pointer group hover:bg-white/5 transition-colors relative overflow-hidden">
                  <div className="absolute inset-0 bg-emerald/5 z-0 pointer-events-none"></div>
                  <div className="mt-0.5 z-10"><Users className={`w-5 h-5 ${perms.community ? 'text-emerald' : 'text-muted'}`} /></div>
                  <div className="flex-1 z-10">
                    <div className="text-sm font-semibold text-white flex gap-2 items-center">
                       Crowdsourced Intelligence
                       <span className="text-[9px] bg-emerald/20 text-emerald px-1.5 py-0.5 rounded border border-emerald/30">HACKATHON FEATURE</span>
                    </div>
                    <div className="text-[10px] text-muted leading-relaxed">Share anonymous tags to build our Community Verified Merchant database.</div>
                  </div>
                  <input type="checkbox" className="accent-emerald w-4 h-4 mt-1 z-10" checked={perms.community} onChange={e => setPerms({...perms, community: e.target.checked})} />
                </label>
             </div>

             <div className="flex gap-3 mt-2">
               <button onClick={() => setStep(1)} className="px-5 py-3 bg-surface border border-border text-white font-bold font-head rounded-xl hover:bg-white/10 transition-colors">
                 Back
               </button>
               <button onClick={completeOnboarding} className="flex-1 py-3 bg-emerald flex items-center justify-center gap-2 text-bg font-bold font-head rounded-xl hover:bg-white transition-colors">
                 Complete Setup <CheckCircle className="w-4 h-4" />
               </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
