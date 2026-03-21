import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { User, Calendar, Mail, MapPin, Save, ShieldCheck } from 'lucide-react';
import { showToast } from '../components/ToastContainer';

export default function Profile() {
  const { user, setUser } = useAppContext();
  
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    birthday: user.birthday || '',
    location: user.location || '',
    gender: user.gender || '',
  });

  const calculateAge = (bday) => {
    if (!bday) return null;
    const diff = Date.now() - new Date(bday).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };
  const age = calculateAge(formData.birthday);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setUser(prev => ({ ...prev, ...formData }));
    showToast('Profile updated successfully!', 'success');
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col gap-2 pt-4">
        <h1 className="text-3xl font-black font-head tracking-tighter text-text">
          User <span style={{ color: 'var(--color-accent)' }}>Profile</span>
        </h1>
        <p className="text-muted text-sm font-medium">Manage your personal details and account info.</p>
      </header>

      <div className="glass p-8 rounded-2xl max-w-2xl relative overflow-hidden border border-border">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
          <User className="w-64 h-64" style={{ color: 'var(--color-accent)' }} />
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-6 relative z-10">
          
          <div className="flex items-center gap-6 mb-4">
            <div 
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-black font-head text-bg shadow-2xl"
              style={{ backgroundColor: 'var(--color-accent)', boxShadow: '0 0 30px var(--color-accent-glow)' }}
            >
              {formData.name ? formData.name.substring(0, 2).toUpperCase() : 'AI'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text tracking-tight">{formData.name || 'Anonymous Hacker'}</h2>
              <div className="flex items-center gap-2 mt-1">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span className="text-xs uppercase tracking-widest text-accent font-bold">Pro Member</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted flex items-center gap-2">
                <User className="w-4 h-4" /> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="bg-surface border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-accent transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email <span className="text-[10px] text-accent">(Read Only)</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="bg-surface/50 border border-border rounded-xl px-4 py-3 text-muted cursor-not-allowed"
                placeholder="john@example.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted flex items-center justify-between">
                <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Birthday</span>
                {age !== null && !isNaN(age) && <span className="text-accent font-black tracking-widest">{age} YRS OLD</span>}
              </label>
              <input
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                className="bg-surface border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-accent transition-colors"
                style={{ colorScheme: 'dark' }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted flex items-center gap-2">
                <User className="w-4 h-4" /> Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="bg-surface border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-accent transition-colors appearance-none"
              >
                <option value="" disabled>Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Location
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="bg-surface border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-accent transition-colors appearance-none"
              >
                <option value="" disabled>Select Region</option>
                <optgroup label="North America">
                  <option value="New York, USA">New York, USA</option>
                  <option value="San Francisco, USA">San Francisco, USA</option>
                  <option value="Toronto, Canada">Toronto, Canada</option>
                </optgroup>
                <optgroup label="Europe">
                  <option value="London, UK">London, UK</option>
                  <option value="Paris, France">Paris, France</option>
                  <option value="Berlin, Germany">Berlin, Germany</option>
                </optgroup>
                <optgroup label="Asia-Pacific">
                  <option value="Tokyo, Japan">Tokyo, Japan</option>
                  <option value="Mumbai, India">Mumbai, India</option>
                  <option value="Bangalore, India">Bangalore, India</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Sydney, Australia">Sydney, Australia</option>
                </optgroup>
              </select>
            </div>
          </div>

          <div className="pt-6 mt-2 border-t border-border flex justify-end">
            <button
              type="submit"
              className="px-8 py-3 rounded-xl font-bold text-bg transition-all flex items-center gap-2 hover:-translate-y-1 hover:shadow-[0_0_20px_var(--color-accent-glow)]"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
