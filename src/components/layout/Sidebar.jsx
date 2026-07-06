import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Users, DoorOpen, Receipt, Wallet,
  ShoppingBag, UtensilsCrossed, Bell, MessageSquareWarning,
  Settings, UserCircle, LogOut, Building2, ChevronRight, X
} from 'lucide-react';

const managerNav = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/manager' },
  { label: 'Members', icon: Users, to: '/manager/members' },
  { label: 'Rooms', icon: DoorOpen, to: '/manager/rooms' },
  { label: 'Bills', icon: Receipt, to: '/manager/bills' },
  { label: 'Payments', icon: Wallet, to: '/manager/payments' },
  { label: 'Expenses', icon: ShoppingBag, to: '/manager/expenses' },
  { label: 'Meals', icon: UtensilsCrossed, to: '/manager/meals' },
  { label: 'Notices', icon: Bell, to: '/manager/notices' },
  { label: 'Complaints', icon: MessageSquareWarning, to: '/manager/complaints' },
  // Member-equivalent links for the manager
  { label: '─── My Portal ───', icon: null, divider: true },
  { label: 'My Bills', icon: Receipt, to: '/dashboard/bills' },
  { label: 'My Meals', icon: UtensilsCrossed, to: '/dashboard/meals' },
  { label: 'Notifications', icon: Bell, to: '/dashboard/notifications' },
  { label: 'Community', icon: Users, to: '/dashboard/community' },
];

const memberNav = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'My Bills', icon: Receipt, to: '/dashboard/bills' },
  { label: 'Meal Summary', icon: UtensilsCrossed, to: '/dashboard/meals' },
  { label: 'Notices', icon: Bell, to: '/dashboard/notices' },
  { label: 'Complaints', icon: MessageSquareWarning, to: '/dashboard/complaints' },
  { label: 'Notifications', icon: Bell, to: '/dashboard/notifications' },
  { label: 'Community', icon: Users, to: '/dashboard/community' },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout, isManager } = useAuth();
  const navigate = useNavigate();
  const navItems = isManager ? managerNav : memberNav;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-none">4/67 Home</p>
            <p className="text-slate-400 text-xs mt-0.5">
              {isManager ? 'Manager Portal' : 'Member Portal'}
            </p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="px-4 py-3 mx-4 mt-4 rounded-xl bg-white/5 border border-white/5">
        <div className="flex items-center gap-3">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">{user?.name || 'User'}</p>
            <p className="text-slate-400 text-xs truncate capitalize">{user?.role || 'member'}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {navItems.map((item) => (
          item.divider ? (
            <div key={item.label} className="px-3 py-2 mt-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">{item.label}</p>
            </div>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/manager' || item.to === '/dashboard'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-900/40'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />
            </NavLink>
          )
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
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
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
