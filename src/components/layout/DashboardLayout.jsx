import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Sun, Moon, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import Sidebar from './Sidebar';
import NotificationDropdown from './NotificationDropdown';
import UserDropdown from './UserDropdown';
import ChatWidget from './ChatWidget';
import DigitalClock from '../shared/DigitalClock';
import DormMascot from '../shared/DormMascot';
import { motion } from 'framer-motion';

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'bg-[#171C18]' : 'bg-[#F5F4EE]'}`}>
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
        <header className={`flex items-center justify-between px-4 sm:px-6 h-16 border-b flex-shrink-0 transition-colors ${
          isDark
            ? 'bg-[#202720] border-[#394239]'
            : 'bg-white border-[#DDE1D8]'
        }`}>
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(true)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              isDark ? 'text-[#B1B8AC] hover:bg-white/5' : 'text-[#687168] hover:bg-[#ECECE4]'
            }`}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setSidebarCollapsed(prev => !prev)}
            className={`hidden lg:flex p-2 rounded-lg transition-colors ${
              isDark ? 'text-[#B1B8AC] hover:bg-white/5' : 'text-[#687168] hover:bg-[#ECECE4]'
            }`}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>

          {/* Page title area (empty — pages set their own titles) */}
          <div className="flex-1 lg:ml-0 ml-3" />

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Asia/Dhaka Digital Clock */}
            <DigitalClock />

            {/* Theme toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className={`p-2 rounded-xl transition-colors ${
                isDark ? 'text-[#B1B8AC] hover:bg-white/5 hover:text-amber-400' : 'text-[#687168] hover:bg-[#ECECE4] hover:text-[#526B52]'
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
        <main className={`flex-1 overflow-y-auto p-4 sm:p-6 scandi-grid-pattern ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Sleeping Dorm Mascot */}
      <DormMascot />

      {/* Floating AI Chat Widget */}
      <ChatWidget />
    </div>
  );
}
