import React from 'react';
import { Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../store/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { LayoutDashboard, Receipt, Settings, LogOut, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '../common/Logo';

export const AppLayout = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: Receipt },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 hidden md:flex flex-col border-r border-border glass relative z-10">
        <div className="p-8">
          <div className="flex flex-col items-start gap-4">
            <Logo size={50} className="drop-shadow-[0_0_10px_rgba(255,0,0,0.1)]" />
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">FinControl</h1>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-0.5">KFIRE GROUPS</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between px-4 py-2 mb-2">
            <span className="text-sm font-medium truncate">Hi, {user?.name?.split(' ')?.[0]}</span>
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-muted transition-colors">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto">
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
