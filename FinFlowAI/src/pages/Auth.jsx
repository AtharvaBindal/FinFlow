import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Lock, Mail, ShieldAlert, User, Eye, EyeOff, CheckCircle, XCircle, Clock } from 'lucide-react';

// ─── Password Strength Helpers ────────────────────────────────────────────────
function getPasswordStrength(pwd) {
  let score = 0;
  const checks = {
    length:    pwd.length >= 8,
    uppercase: /[A-Z]/.test(pwd),
    lowercase: /[a-z]/.test(pwd),
    number:    /[0-9]/.test(pwd),
    special:   /[^A-Za-z0-9]/.test(pwd),
  };
  Object.values(checks).forEach(v => { if (v) score += 1; });
  return { score, checks };
}

const strengthLabels = ['', 'Weak', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColors = ['', '#ff6b6b', '#ff6b6b', '#ffa94d', '#6af0d8', '#c8f135'];

// ─── Name Validation ─────────────────────────────────────────────────────────
// Allows alphabets and spaces (for first + middle + last name), trims extra spaces on submit
function isValidName(name) {
  return /^[A-Za-z]+(\s[A-Za-z]+)*$/.test(name.trim()) && name.trim().length >= 2;
}

export default function Auth() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  
  // Shared fields
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);

  // Signup-only fields
  const [fullName, setFullName]     = useState('');
  const [nameError, setNameError]   = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const [error, setError] = useState('');
  
  const { user, setUser } = useAppContext();
  const accentColor = user?.accentColor || '#c8f135';
  const navigate = useNavigate();

  // Password strength (shown only during signup)
  const { score: pwdScore, checks: pwdChecks } = useMemo(() => getPasswordStrength(password), [password]);

  // ─── Pull login history from localStorage ────────────────────────────────
  const getLoginHistory = (userEmail) => {
    const raw = localStorage.getItem(`finflow_login_history_${userEmail}`);
    return raw ? JSON.parse(raw) : [];
  };
  
  const saveLoginEvent = (userEmail) => {
    const history = getLoginHistory(userEmail);
    const event = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent.split(') ')[0].split('(')[1] || 'Unknown Device',
    };
    // Keep only latest 20 events
    const updated = [event, ...history].slice(0, 20);
    localStorage.setItem(`finflow_login_history_${userEmail}`, JSON.stringify(updated));
  };

  const handleNameChange = (val) => {
    setFullName(val);
    if (val && !/^[A-Za-z\s]*$/.test(val)) {
      setNameError('Name can only contain letters and spaces.');
    } else if (val.trim().split(/\s+/).some(word => /\d/.test(word))) {
      setNameError('Numbers are not allowed in names.');
    } else {
      setNameError('');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    
    // Check if user exists
    const stored = localStorage.getItem(`finflow_account_${email}`);
    if (!stored) { setError('No account found. Please sign up first.'); return; }
    
    const account = JSON.parse(stored);
    if (account.password !== password) { setError('Incorrect password. Please try again.'); return; }
    
    saveLoginEvent(email);
    setUser(prev => ({
      ...prev,
      isAuthenticated: true,
      email,
      name: account.name || prev.name || email.split('@')[0],
    }));
    navigate('/dashboard');
  };

  const handleSignup = (e) => {
    e.preventDefault();
    setError('');
    
    if (!fullName.trim()) { setError('Please enter your full name.'); return; }
    if (!isValidName(fullName)) { setError('Name must contain only letters (first, middle, or last name).'); return; }
    if (!email) { setError('Please enter an email address.'); return; }
    if (pwdScore < 3) { setError('Please use a stronger password (at least Fair).'); return; }
    if (password !== confirmPwd) { setError('Passwords do not match.'); return; }
    
    // Save account
    const account = { name: fullName.trim(), email, password };
    localStorage.setItem(`finflow_account_${email}`, JSON.stringify(account));
    
    saveLoginEvent(email);
    setUser(prev => ({
      ...prev,
      isAuthenticated: true,
      email,
      name: fullName.trim(),
      hasCompletedOnboarding: false,
    }));
    navigate('/dashboard');
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center relative p-4 bg-bg text-text font-mono z-50">
      
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-50 z-0"></div>
      <div className="absolute overflow-hidden inset-0 pointer-events-none z-0">
        <div 
          className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full blur-[100px] opacity-20 animate-[pulse_6s_ease-in-out_infinite]"
          style={{ backgroundColor: accentColor }}
        ></div>
        <div 
          className="absolute top-[40%] -right-[10%] w-[60vw] h-[60vw] rounded-full blur-[120px] opacity-20 animate-[pulse_8s_ease-in-out_infinite]"
          style={{ backgroundColor: accentColor, animationDelay: '2s' }}
        ></div>
        <div 
          className="absolute -bottom-[20%] left-[20%] w-[40vw] h-[40vw] rounded-full blur-[90px] opacity-10 animate-[pulse_7s_ease-in-out_infinite]"
          style={{ backgroundColor: accentColor, animationDelay: '4s' }}
        ></div>
      </div>

      <div className="glass w-full max-w-sm p-8 rounded-3xl shadow-2xl z-10 animate-in zoom-in-95 duration-500">
        
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-accent mx-auto flex items-center justify-center font-head font-bold text-bg text-3xl accent-glow mb-4">F</div>
          <h1 className="font-head font-bold text-3xl tracking-tight text-text mb-1">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-sm text-muted">{mode === 'login' ? 'Sign in to FinFlow AI' : 'Start your financial journey'}</p>
        </div>

        {/* Mode Tabs */}
        <div className="flex bg-surface border border-border rounded-xl p-1 mb-6">
          {['login', 'signup'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-bold font-head capitalize transition-all ${mode === m ? 'bg-accent text-bg shadow' : 'text-muted hover:text-text'}`}>
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-rose/10 border border-rose/30 text-rose text-xs rounded-xl flex items-center gap-2">
            <XCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="flex flex-col gap-4">
          
          {/* Full Name — Sign Up only */}
          {mode === 'signup' && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-muted uppercase tracking-widest pl-1 font-semibold">Full Name</label>
              <div className="relative flex items-center">
                <User className="absolute left-3 w-4 h-4 text-muted" />
                <input
                  type="text"
                  required
                  maxLength={60}
                  className={`w-full bg-surface/50 border p-3 pl-10 rounded-xl outline-none transition-all text-sm placeholder-muted ${nameError ? 'border-rose focus:border-rose' : 'border-border focus:border-accent focus:ring-1 ring-accent'}`}
                  placeholder="John Michael Doe"
                  value={fullName}
                  onChange={e => handleNameChange(e.target.value)}
                />
              </div>
              {nameError && <p className="text-[10px] text-rose pl-1">{nameError}</p>}
              {!nameError && fullName.trim().length > 0 && isValidName(fullName) && (
                <p className="text-[10px] text-accent pl-1 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Looks good!</p>
              )}
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-muted uppercase tracking-widest pl-1 font-semibold">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-4 h-4 text-muted" />
              <input
                type="email"
                required
                className="w-full bg-surface/50 border border-border p-3 pl-10 rounded-xl outline-none focus:border-accent focus:ring-1 ring-accent transition-all placeholder-muted text-sm"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-end pl-1">
              <label className="text-[10px] text-muted uppercase tracking-widest font-semibold">Password</label>
              {mode === 'login' && <a href="#" className="text-[10px] text-accent hover:underline">Forgot?</a>}
            </div>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-4 h-4 text-muted" />
              <input
                type={showPwd ? 'text' : 'password'}
                required
                className="w-full bg-surface/50 border border-border p-3 pl-10 pr-10 rounded-xl outline-none focus:border-accent focus:ring-1 ring-accent transition-all placeholder-muted text-sm tracking-widest"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 text-muted hover:text-text transition-colors">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength (SignUp only) */}
            {mode === 'signup' && password.length > 0 && (
              <div className="mt-1 flex flex-col gap-1.5">
                <div className="flex gap-1 h-1.5">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="flex-1 rounded-full transition-all duration-300"
                      style={{ backgroundColor: i <= pwdScore ? strengthColors[pwdScore] : '#ffffff15' }}></div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  {[
                    { key: 'length',    label: '8+ chars' },
                    { key: 'uppercase', label: 'Uppercase' },
                    { key: 'lowercase', label: 'Lowercase' },
                    { key: 'number',    label: 'Number'    },
                    { key: 'special',   label: 'Special (!@#)' },
                  ].map(({ key, label }) => (
                    <span key={key} className={`flex items-center gap-1 ${pwdChecks[key] ? 'text-accent' : 'text-muted'}`}>
                      {pwdChecks[key] ? <CheckCircle className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                      {label}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] font-bold" style={{ color: strengthColors[pwdScore] }}>
                  Strength: {strengthLabels[pwdScore]}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password — Sign Up only */}
          {mode === 'signup' && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-muted uppercase tracking-widest pl-1 font-semibold">Confirm Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-4 h-4 text-muted" />
                <input
                  type={showConfirmPwd ? 'text' : 'password'}
                  required
                  className={`w-full bg-surface/50 border p-3 pl-10 pr-10 rounded-xl outline-none transition-all placeholder-muted text-sm tracking-widest ${confirmPwd && confirmPwd !== password ? 'border-rose' : 'border-border focus:border-accent focus:ring-1 ring-accent'}`}
                  placeholder="••••••••"
                  value={confirmPwd}
                  onChange={e => setConfirmPwd(e.target.value)}
                />
                <button type="button" onClick={() => setShowConfirmPwd(v => !v)} className="absolute right-3 text-muted hover:text-text transition-colors">
                  {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPwd && confirmPwd !== password && (
                <p className="text-[10px] text-rose pl-1 flex items-center gap-1"><XCircle className="w-3 h-3" /> Passwords do not match</p>
              )}
              {confirmPwd && confirmPwd === password && (
                <p className="text-[10px] text-accent pl-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Passwords match!</p>
              )}
            </div>
          )}

          <button
            type="submit"
            className="mt-2 w-full bg-accent text-bg font-head font-bold text-base py-3.5 rounded-xl hover:opacity-80 hover:-translate-y-0.5 accent-glow transition-all active:translate-y-0"
          >
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <div className="text-center">
            <p className="text-xs text-muted flex items-center justify-center gap-1.5">
              <ShieldAlert className="w-3 h-3 text-accent" /> Secure Encrypted Connection
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
