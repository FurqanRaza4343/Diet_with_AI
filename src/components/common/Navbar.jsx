import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Avatar from './Avatar';
import { FaBell, FaSignOutAlt, FaUser, FaCog, FaThLarge } from 'react-icons/fa';
import { Leaf } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dropdownItems = [
    { label: 'Dashboard', icon: FaThLarge, path: '/dashboard' },
    { label: 'Profile', icon: FaUser, path: '/profile' },
    { label: 'Settings', icon: FaCog, path: '/settings' },
    { divider: true },
    { label: 'Logout', icon: FaSignOutAlt, onClick: handleLogout, danger: true },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      isScrolled ? 'glass shadow-sm border-b border-[#e5e1e3]' : 'bg-transparent'
    }`} style={{ paddingLeft: '72px' }}>
      <div className="flex items-center justify-between h-16 px-6">
        <Link to="/dashboard" className="flex items-center gap-2 lg:hidden">
          <Leaf className="text-primary-600" size={24} />
          <span className="font-bold text-lg text-on-surface">DietAI</span>
        </Link>

        <div className="hidden lg:block" />

        <div className="flex items-center gap-3 ml-auto">
          <button className="relative p-2 rounded-xl hover:bg-[#f1edee] transition-colors">
            <FaBell className="text-lg text-on-surface-variant" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 cursor-pointer hover:bg-[#f1edee] rounded-xl p-2 transition-colors"
            >
              <Avatar name={user?.name} size="small" />
              <span className="hidden md:block text-sm font-medium text-on-surface">{user?.name}</span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-[#e5e1e3] shadow-lg py-2 z-50">
                {dropdownItems.map((item, index) => (
                  item.divider ? (
                    <hr key={index} className="border-[#e5e1e3] my-2" />
                  ) : (
                    <button
                      key={index}
                      onClick={() => {
                        if (item.path) navigate(item.path);
                        if (item.onClick) item.onClick();
                        setShowDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-[#f1edee] transition-colors ${
                        item.danger ? 'text-red-600' : 'text-on-surface'
                      }`}
                    >
                      <item.icon className="text-base" />
                      {item.label}
                    </button>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
