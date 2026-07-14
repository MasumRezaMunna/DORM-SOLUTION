import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  LayoutDashboard, Users, DoorOpen, Receipt, Wallet,
  ShoppingBag, UtensilsCrossed, Bell, MessageSquareWarning,
  Building2, ChevronRight, X, PanelLeftClose, PanelLeftOpen,
  ShoppingCart,
} from 'lucide-react';

const managerNav = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/manager' },
  { label: 'Expenses', icon: ShoppingBag, to: '/manager/expenses' },
  { label: 'Payments', icon: Wallet, to: '/manager/payments' },
  { label: 'Meals', icon: UtensilsCrossed, to: '/manager/meals' },
  { label: 'Notices', icon: Bell, to: '/manager/notices' },
  { label: 'Market Team', icon: ShoppingCart, to: '/manager/market' },
  { label: 'Complaints', icon: MessageSquareWarning, to: '/manager/complaints' },
  { label: 'Members', icon: Users, to: '/manager/members' },
  { label: 'Rooms', icon: DoorOpen, to: '/manager/rooms' },
  { label: 'MY PORTAL', icon: null, divider: true },
  { label: 'My Meals', icon: UtensilsCrossed, to: '/dashboard/meals' },
  { label: 'Notifications', icon: Bell, to: '/manager/notifications' },
  { label: 'Community', icon: Users, to: '/dashboard/community' },
];

const memberNav = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Meal Summary', icon: UtensilsCrossed, to: '/dashboard/meals' },
  { label: 'Market Schedule', icon: ShoppingCart, to: '/dashboard/market' },
  { label: 'Notices', icon: Bell, to: '/dashboard/notices' },
  { label: 'Complaints', icon: MessageSquareWarning, to: '/dashboard/complaints' },
  { label: 'Notifications', icon: Bell, to: '/dashboard/notifications' },
  { label: 'Community', icon: Users, to: '/dashboard/community' },
];

export default function Sidebar({ mobileOpen, onClose, collapsed, onToggleCollapse }) {
  const { isManager } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const navItems = isManager ? managerNav : memberNav;
  const dashboardRoot = isManager ? '/manager' : '/dashboard';

  // Theme-aware colours
  const sideBg = isDark ? 'bg-slate-900' : 'bg-white';
  const borderCol = isDark ? 'border-white/10' : 'border-slate-200';
  const textCol = isDark ? 'text-white' : 'text-slate-800';
  const mutedCol = isDark ? 'text-slate-400' : 'text-slate-500';
  const dividerCol = isDark ? 'text-slate-600' : 'text-slate-400';
  const hoverCls = isDark
    ? 'text-slate-400 hover:text-white hover:bg-white/5'
    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100';

  const renderSidebarContent = (isMobile) => {
    const effectiveCollapsed = isMobile ? false : collapsed;

    return (
      <div className={`flex flex-col h-full ${sideBg} ${textCol} border-r ${borderCol} transition-colors duration-200`}>

      {/* ── Logo ─────────────────────────────────────── */}
      <div className={`flex items-center justify-between px-4 py-4 border-b ${borderCol}`} style={{ minHeight: 64 }}>
        <button
          onClick={() => { navigate(dashboardRoot); if (onClose) onClose(); }}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity min-w-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>

          {!effectiveCollapsed && (
            <div className="overflow-hidden text-left">
              <p className="font-bold text-sm leading-none truncate">4/67 Home</p>
              <p className={`text-xs mt-0.5 truncate ${mutedCol}`}>
                {isManager ? 'Manager Portal' : 'Member Portal'}
              </p>
            </div>
          )}
        </button>

        <div className="flex items-center gap-1 ml-1 flex-shrink-0">
          {/* Mobile close — visible on mobile, hidden on desktop */}
          {!effectiveCollapsed && onClose && (
            <button onClick={onClose} className={`flex lg:hidden p-1.5 rounded-lg transition-colors ${hoverCls}`}>
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Navigation ───────────────────────────────── */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
        {navItems.map((item) => {
          if (item.divider) {
            return effectiveCollapsed ? null : (
              <div key={item.label} className="px-3 py-2 mt-2">
                <p className={`text-[10px] font-semibold uppercase tracking-widest ${dividerCol}`}>
                  {item.label}
                </p>
              </div>
            );
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/manager' || item.to === '/dashboard'}
              onClick={onClose}
              title={effectiveCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                ${effectiveCollapsed ? 'justify-center' : ''}
                ${isActive
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-900/30'
                  : hoverCls
                }`
              }
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!effectiveCollapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
  };

  return (
    <>
      {/* ── Desktop Sidebar (animated width) ──────────────── */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 256 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="hidden lg:block flex-shrink-0 h-screen sticky top-0 overflow-hidden"
      >
        {renderSidebarContent(false)}
      </motion.aside>

      {/* ── Mobile Sidebar Overlay ─────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-64 z-50 lg:hidden"
            >
              {renderSidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
