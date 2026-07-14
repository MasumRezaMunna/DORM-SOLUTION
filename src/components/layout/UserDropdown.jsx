import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { UserCircle, LogOut, Settings } from 'lucide-react';

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout, isManager } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate('/login');
  };

  const bgClasses = isDark ? 'bg-slate-900 border-white/10 shadow-black/50' : 'bg-white border-slate-200 shadow-slate-200/50';
  const itemHover = isDark ? 'hover:bg-white/5 text-slate-300 hover:text-white' : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900';

  return (
    <div className="relative ml-1" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-slate-500/10 transition-colors focus:outline-none"
      >
        {user?.photoURL ? (
          <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-500/40" onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'U')}&background=8b5cf6&color=fff`; }} />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
            {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        )}
        <div className="hidden sm:block text-left">
          <p className={`text-sm font-semibold leading-none ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {user?.displayName?.split(' ')[0] || 'User'}
          </p>
          <p className={`text-xs capitalize mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {user?.role || 'member'}
          </p>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute right-0 top-full mt-2 w-48 rounded-2xl border shadow-xl z-50 overflow-hidden py-2 ${bgClasses}`}
          >
            <div className="px-4 py-2 border-b mb-2 border-slate-500/10 sm:hidden">
               <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                 {user?.displayName || 'User'}
               </p>
               <p className={`text-xs capitalize ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                 {user?.role || 'member'}
               </p>
            </div>
            
            <Link
              to={isManager ? '/manager/profile' : '/dashboard/profile'}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${itemHover}`}
            >
              <UserCircle className="w-4 h-4" />
              My Profile
            </Link>

            <Link
              to={isManager ? '/manager/settings' : '/dashboard/settings'}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${itemHover}`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 px-4 py-2 text-sm w-full text-left transition-colors mt-1 border-t border-slate-500/10 pt-2 ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50'}`}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
