import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, Bell, PenLine, User } from 'lucide-react';
import { auth } from '../firebase';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const user = auth.currentUser;

  return (
    <div className="flex h-screen overflow-hidden bg-paper">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b z-10" style={{ borderColor: '#f4e8cc', boxShadow: '0 4px 12px -2px rgba(132,74,30,0.08)' }}>
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl transition-all hover:bg-amber-50 active:scale-95"
                style={{ color: '#c97520' }}
              >
                <Menu size={22} />
              </button>

              {/* Breadcrumb area */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50/50 border border-amber-100/50">
                <PenLine size={14} className="text-amber-500" />
                <span className="text-xs font-bold tracking-wide uppercase text-amber-900/60" style={{ fontFamily: '"Inter", sans-serif' }}>Smart Fancy</span>
                <span className="text-amber-200">/</span>
                <span className="text-xs font-semibold text-slate-500">Admin</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notification bell */}
              <button className="relative p-2 rounded-xl transition-all hover:bg-amber-50 active:scale-95 group">
                <Bell size={20} className="text-amber-600 group-hover:rotate-12 transition-transform" />
                <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              </button>

              {/* User info */}
              <div className="flex items-center gap-3 pl-3 border-l" style={{ borderColor: '#f4e8cc' }}>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-bold text-slate-800 truncate max-w-[150px]" style={{ fontFamily: '"Inter", sans-serif' }}>
                    {user?.displayName || 'Admin'}
                  </p>
                  <p className="text-[10px] uppercase font-bold text-amber-600/60 tracking-tighter truncate max-w-[150px]">
                    {user?.email || 'Store Manager'}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-md transition-transform hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #e8a94a, #c97520)' }}>
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="User" className="h-10 w-10 rounded-xl object-cover ring-2 ring-white" />
                  ) : (
                    <User size={18} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-dots-paper relative">
          {/* Subtle paper grain overlay for depth */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]"></div>

          <div className="mx-auto max-w-7xl relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;