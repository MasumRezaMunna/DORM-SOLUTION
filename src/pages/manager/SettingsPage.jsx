import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHeader from '../../components/shared/PageHeader';
import { Sun, Moon, LogOut, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    toast.success('Logged out successfully.');
  };

  const cardBg = isDark ? 'bg-[#202720] border-[#394239]' : 'bg-white border-[#DDE1D8] shadow-sm';
  const textMuted = isDark ? 'text-[#B1B8AC]' : 'text-[#687168]';

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Settings" subtitle="Manage your account and preferences" />

      {/* Profile */}
      <div className={`rounded-2xl border p-5 ${cardBg}`}>
        <h3 className={`font-bold mb-4 tracking-tight ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>Profile</h3>
        <div className="flex items-center gap-4">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-[#526B52]/40 dark:ring-[#A3B18A]/40" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#526B52] dark:bg-[#A3B18A] flex items-center justify-center text-white dark:text-[#171C18] text-xl font-extrabold flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
          <div>
            <p className={`font-bold ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>{user?.name}</p>
            <p className={`text-sm ${textMuted}`}>{user?.email}</p>
            <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mt-1.5 inline-block ${
              user?.role === 'manager'
                ? 'bg-[#E8EDE3] dark:bg-[#303A30] text-[#526B52] dark:text-[#A3B18A]'
                : 'bg-[#ECECE4] dark:bg-[#292F29] text-[#687168] dark:text-[#B1B8AC]'
            }`}>{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className={`rounded-2xl border p-5 ${cardBg}`}>
        <h3 className={`font-bold mb-4 tracking-tight ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>Appearance</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDark ? <Moon className="w-5 h-5 text-[#A3B18A]" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <div>
              <p className={`text-sm font-bold ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>{isDark ? 'Dark Mode' : 'Light Mode'}</p>
              <p className={`text-xs ${textMuted}`}>Toggle between dark and light themes</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className={`relative w-12 h-6 rounded-full transition-colors ${isDark ? 'bg-[#A3B18A]' : 'bg-[#DDE1D8]'}`}
          >
            <motion.div
              animate={{ x: isDark ? 26 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`absolute top-1 w-4 h-4 rounded-full shadow ${isDark ? 'bg-[#171C18]' : 'bg-white'}`}
            />
          </motion.button>
        </div>
      </div>

      {/* Language */}
      <div className={`rounded-2xl border p-5 ${cardBg}`}>
        <h3 className={`font-bold mb-4 tracking-tight ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>Language</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-[#526B52] dark:text-[#A3B18A]" />
            <div>
              <p className={`text-sm font-bold ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>Interface Language</p>
              <p className={`text-xs ${textMuted}`}>Choose between English and Bengali</p>
            </div>
          </div>
          <div className={`inline-flex items-center gap-1 p-1 rounded-xl border ${isDark ? 'bg-[#202720] border-[#394239]' : 'bg-[#ECECE4] border-[#DDE1D8]'}`}>
            {[{ code: 'en', label: 'EN' }, { code: 'bn', label: 'বাং' }].map(lang => (
              <button
                key={lang.code}
                onClick={() => i18n.changeLanguage(lang.code)}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  i18n.language === lang.code
                    ? 'bg-[#526B52] dark:bg-[#A3B18A] text-white dark:text-[#171C18] shadow-sm'
                    : isDark ? 'text-[#B1B8AC] hover:text-[#F0F1E9]' : 'text-[#687168] hover:text-[#202720]'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Danger */}
      <div className={`rounded-2xl border border-rose-500/20 p-5 ${isDark ? 'bg-rose-500/5' : 'bg-rose-50/50'}`}>
        <h3 className="font-bold text-rose-600 dark:text-rose-400 mb-4 tracking-tight">Account</h3>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm font-bold transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </motion.button>
      </div>
    </div>
  );
}
