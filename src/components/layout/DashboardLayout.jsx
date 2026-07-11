import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import Sidebar from './Sidebar';
import NotificationDropdown from './NotificationDropdown';
import UserDropdown from './UserDropdown';
import { motion } from 'framer-motion';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-slate-100'}`}>
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className={`flex items-center justify-between px-4 sm:px-6 h-16 border-b flex-shrink-0 ${
          isDark
            ? 'bg-slate-900 border-white/10'
            : 'bg-white border-slate-200'
        }`}>
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(true)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setSidebarCollapsed(prev => !prev)}
            className={`hidden lg:flex p-2 rounded-lg transition-colors ${
              isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>

          {/* Page title area (empty — pages set their own titles) */}
          <div className="flex-1 lg:ml-0 ml-3" />

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-colors ${
                isDark ? 'text-slate-400 hover:bg-white/5 hover:text-yellow-400' : 'text-slate-600 hover:bg-slate-100 hover:text-purple-600'
              }`}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>

            {/* Notifications */}
            <NotificationDropdown />

            {/* User Dropdown */}
            <UserDropdown />
          </div>
        </header>

        {/* Page content */}
        <main className={`flex-1 overflow-y-auto p-4 sm:p-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
