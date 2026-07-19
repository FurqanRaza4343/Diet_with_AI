import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Sparkles, MessageCircle, ShoppingCart, User } from 'lucide-react';

const tabs = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { path: '/ai-planner', icon: Sparkles, label: 'Plans' },
  { path: '/chat', icon: MessageCircle, label: 'Chat' },
  { path: '/grocery', icon: ShoppingCart, label: 'List' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const MobileBottomNav = () => (
  <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-xl border-t border-[#e5e1e3] flex md:hidden items-center justify-around py-2 safe-area-bottom">
    {tabs.map((tab) => (
      <NavLink
        key={tab.path}
        to={tab.path}
        className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
            isActive ? 'text-primary-600' : 'text-on-surface-variant'
          }`
        }
      >
        <tab.icon size={20} />
        <span className="text-[10px] font-medium">{tab.label}</span>
      </NavLink>
    ))}
  </nav>
);

export default MobileBottomNav;
