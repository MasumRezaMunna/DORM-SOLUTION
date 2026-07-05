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
  const { i18n, t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    toast.success('Logged out successfully.');
  };

  const cardBg = isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200 shadow-sm';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-5 max-w-2xl">
      <PageHeader title="Settings" subtitle="Manage your account and preferences" />

      {/* Profile */}
      <div className={`rounded-2xl border p-5 ${cardBg}`}>
        <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Profile</h3>
        <div className="flex items-center gap-4">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-purple-500/40" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
          <div>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{user?.name}</p>
            <p className={`text-sm ${textMuted}`}>{user?.email}</p>
            <span className={`text-xs capitalize px-2 py-0.5 rounded-full mt-1 inline-block ${
              user?.role === 'manager'
                ? 'bg-purple-500/15 text-purple-400'
                : 'bg-blue-500/15 text-blue-400'
            }`}>{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className={`rounded-2xl border p-5 ${cardBg}`}>
        <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Appearance</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDark ? <Moon className="w-5 h-5 text-purple-400" /> : <Sun className="w-5 h-5 text-amber-400" />}
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{isDark ? 'Dark Mode' : 'Light Mode'}</p>
              <p className={`text-xs ${textMuted}`}>Toggle between dark and light themes</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className={`relative w-12 h-6 rounded-full transition-colors ${isDark ? 'bg-purple-600' : 'bg-slate-300'}`}
          >
            <motion.div
              animate={{ x: isDark ? 24 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
            />
          </motion.button>
        </div>
      </div>

      {/* Language */}
      <div className={`rounded-2xl border p-5 ${cardBg}`}>
        <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Language</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-blue-400" />
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>Interface Language</p>
              <p className={`text-xs ${textMuted}`}>Choose between English and Bengali</p>
            </div>
          </div>
          <div className={`inline-flex items-center gap-1 p-1 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
            {[{ code: 'en', label: 'EN' }, { code: 'bn', label: 'বাং' }].map(lang => (
              <button
                key={lang.code}
                onClick={() => i18n.changeLanguage(lang.code)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  i18n.language === lang.code
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Danger */}
      <div className={`rounded-2xl border border-red-500/20 p-5 ${isDark ? 'bg-red-950/20' : 'bg-red-50'}`}>
        <h3 className="font-semibold text-red-400 mb-4">Account</h3>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-semibold transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </motion.button>
      </div>
    </div>
  );
}
