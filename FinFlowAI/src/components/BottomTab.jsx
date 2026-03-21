import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, PieChart, Settings } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', path: '/transactions', icon: Receipt },
  { name: 'Budgeting', path: '/budgeting', icon: PieChart },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function BottomTab() {
  return (
    <div className="glass w-full rounded-2xl flex items-center justify-around py-3 px-2 shadow-2xl border-t border-white/5">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'text-emerald' 
                  : 'text-muted hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] tracking-wide font-medium">{item.name}</span>
          </NavLink>
        );
      })}
    </div>
  );
}
