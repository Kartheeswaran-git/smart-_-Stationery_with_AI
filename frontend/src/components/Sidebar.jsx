import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
  LogOut,
  PenLine,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/products', icon: <Package size={20} />, label: 'Products' },
    { path: '/admin/categories', icon: <FolderOpen size={20} />, label: 'Categories' },
    { path: '/admin/orders', icon: <ShoppingBag size={20} />, label: 'Orders' },
    { path: '/admin/customers', icon: <Users size={20} />, label: 'Customers' },
    { path: '/admin/analytics', icon: <BarChart3 size={20} />, label: 'Analytics' },
    { path: '/admin/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    lg:translate-x-0 lg:static lg:block
    bg-ink-900 text-white
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={sidebarClasses} style={{ background: 'linear-gradient(180deg, #1a2744 0%, #0f1e3d 100%)' }}>
        {/* Decorative lines overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 29px, rgba(99,102,241,0.07) 29px, rgba(99,102,241,0.07) 30px)'
        }} />

        <div className="flex flex-col h-full border-r border-white/5 relative z-10">

          {/* Brand Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #e8a94a, #c97520)' }}>
                <PenLine size={20} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-white tracking-tight leading-none" style={{ fontFamily: '"Playfair Display", serif' }}>
                  Smart Fancy
                </h1>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(99,102,241,0.8)' }}>Admin Portal</p>
              </div>
            </div>

            {/* Decorative stationery bar */}
            <div className="mt-4 flex gap-1 h-1">
              <div className="flex-1 rounded-full" style={{ background: '#e8a94a' }} />
              <div className="flex-1 rounded-full" style={{ background: '#6366f1' }} />
              <div className="flex-1 rounded-full" style={{ background: '#e8a94a', opacity: 0.5 }} />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(148,163,184,0.6)' }}>
              Navigation
            </p>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
                    ${isActive
                      ? 'text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                  style={isActive ? {
                    background: 'linear-gradient(135deg, rgba(232,169,74,0.25), rgba(201,117,32,0.15))',
                    border: '1px solid rgba(232,169,74,0.3)'
                  } : {}}
                >
                  <div className="flex items-center gap-3">
                    <span className={`transition-colors ${isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-amber-400'}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={14} className="text-amber-400" />}
                </Link>
              );
            })}
          </nav>

          {/* Stationery decoration */}
          <div className="px-4 py-3 mx-3 mb-3 rounded-xl" style={{
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.15)'
          }}>
            <p className="text-xs text-slate-400 leading-relaxed">
              ✏️ <span className="text-slate-300 font-medium">Smart Fancy</span> — Your premium stationery partner.
            </p>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="flex items-center w-full gap-3 px-3 py-2.5 text-sm font-medium text-slate-400 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;