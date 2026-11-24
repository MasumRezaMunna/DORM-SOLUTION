import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Sun, Moon, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import Sidebar from './Sidebar';
import NotificationDropdown from './NotificationDropdown';
import UserDropdown from './UserDropdown';
import ChatWidget from './ChatWidget';
import SoundToggle from './SoundToggle';
import DigitalClock from '../shared/DigitalClock';
import DormMascot from '../shared/DormMascot';
import QuickAccessPanel from './QuickAccessPanel';
import { motion } from 'framer-motion';

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="relative h-screen w-screen overflow-hidden gta6-bg">
      {/* 3 Columns ONLY: 1. Sidebar, 2. Main content, 3. Quick Access Panel */}
      <div className="flex h-full w-full overflow-hidden relative z-[1]">
        {/* 1st Bar: Sidebar */}
        <Sidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
        />

        {/* 2nd Bar: Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top header */}
          <header className="relative z-40 flex items-center justify-between px-4 sm:px-6 h-16 border-b flex-shrink-0 transition-colors backdrop-blur-md bg-[#0d0220]/65 border-[#e060c0]/20">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg transition-colors text-[#e0b3f0] hover:bg-white/10"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop collapse toggle */}
            <button
              onClick={() => setSidebarCollapsed(prev => !prev)}
              className="hidden lg:flex p-2 rounded-lg transition-colors text-[#e0b3f0] hover:bg-white/10"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>

            {/* Page title area (empty — pages set their own titles) */}
            <div className="flex-1 lg:ml-0 ml-3" />

            {/* Right actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Live Asia/Dhaka Digital Clock – hidden on mobile, visible sm+ */}
              <span className="hidden sm:flex">
                <DigitalClock />
              </span>

              {/* Sound toggle */}
              <SoundToggle />

              {/* Theme toggle */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="p-2 rounded-xl transition-colors text-[#e0b3f0] hover:bg-white/10 hover:text-amber-300"
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
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 text-[#F0F1E9]">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>

        {/* 3rd Bar: Right Quick Access Panel — sticky, xl+ only */}
        <QuickAccessPanel />
      </div>

      {/* Sleeping Dorm Mascot — with 1st sidebar (bottom-left) */}
      <DormMascot />

      {/* Floating AI Chat Widget — with 3rd bar (bottom-right) */}
      <ChatWidget />
    </div>
  );
}
