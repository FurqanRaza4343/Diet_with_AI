import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { Leaf, Bot, Calendar, ShoppingCart, Heart, User, LayoutDashboard, Camera, LineChart, Sparkles, MessageCircle } from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/ai-planner', icon: Sparkles, label: 'AI Planner' },
  { path: '/food-scanner', icon: Camera, label: 'Scanner' },
  { path: '/chat', icon: MessageCircle, label: 'Chat' },
  { path: '/nutrition', icon: Bot, label: 'AI Nutrition' },
  { path: '/weekly-planner', icon: Calendar, label: 'Planner' },
  { path: '/grocery', icon: ShoppingCart, label: 'Grocery' },
  { path: '/health-tracker', icon: Heart, label: 'Tracker' },
  { path: '/meal-history', icon: LineChart, label: 'History' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const adminItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Admin' },
  { path: '/admin/users', icon: User, label: 'Users' },
  { path: '/admin/food-database', icon: Camera, label: 'Food DB' },
];

const Sidebar = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const items = isAdmin ? [...navItems, ...adminItems] : navItems;

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[72px] z-30 bg-white/80 backdrop-blur-xl border-r border-[#e5e1e3] flex flex-col items-center py-4 gap-1 overflow-y-auto">
      <div className="mb-6 mt-2">
        <NavLink to="/dashboard" className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50 text-primary-600">
          <Leaf size={22} />
        </NavLink>
      </div>

      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-primary-100 text-primary-700 shadow-sm'
                : 'text-on-surface-variant hover:bg-[#f1edee] hover:text-on-surface'
            }`
          }
        >
          <item.icon size={20} />
        </NavLink>
      ))}

      <div className="mt-auto mb-4">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-primary-100 text-primary-700 shadow-sm'
                : 'text-on-surface-variant hover:bg-[#f1edee] hover:text-on-surface'
            }`
          }
        >
          <User size={20} />
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
