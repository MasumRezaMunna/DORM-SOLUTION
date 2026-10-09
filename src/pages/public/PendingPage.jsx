import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { Clock, LogOut, Phone, RefreshCw, Sun, Moon } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function PendingPage() {
  const { logout, user, isPending, isAuthenticated, loading, refreshPendingStatus } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [checking, setChecking] = useState(false);

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isPending) return <Navigate to="/dashboard" replace />;

  const handleRefresh = async () => {
    setChecking(true);
    await refreshPendingStatus();
    setChecking(false);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200 ${
      isDark ? 'bg-[#171C18] text-[#F0F1E9]' : 'bg-[#F5F4EE] text-[#202720]'
    }`}>
      <div className="absolute inset-0 scandi-grid-pattern opacity-40 pointer-events-none" />

      {/* Theme toggle in top right */}
      <div className="absolute top-5 right-5 z-20">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className={`p-2.5 rounded-xl border transition-all ${
            isDark
              ? 'bg-[#202720] border-[#394239] text-[#A3B18A] hover:bg-[#292F29]'
              : 'bg-white border-[#DDE1D8] text-[#526B52] hover:bg-[#ECECE4]'
          }`}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`max-w-md w-full rounded-3xl p-8 text-center relative overflow-hidden shadow-xl border ${
          isDark
            ? 'bg-[#202720] border-[#394239]'
            : 'bg-white border-[#DDE1D8]'
        }`}
      >
        <div className="w-16 h-16 bg-[#FEF3C7] dark:bg-[#78350F]/30 rounded-2xl border border-[#FCD34D] dark:border-[#F59E0B]/40 flex items-center justify-center mx-auto mb-5">
          <Clock className="w-8 h-8 text-[#D97706] dark:text-[#F59E0B]" />
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight mb-2">Account Pending</h1>
        <p className={`mb-6 text-sm leading-relaxed ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>
          Hello <strong>{user?.displayName}</strong>, your account has been successfully created but is currently pending manager approval. You will gain full access once a manager activates your membership.
        </p>

        <div className={`rounded-2xl p-5 mb-6 text-left border ${
          isDark
            ? 'bg-[#292F29] border-[#394239]'
            : 'bg-[#ECECE4]/60 border-[#DDE1D8]'
        }`}>
          <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>
            <Phone className="w-4 h-4 text-[#526B52] dark:text-[#A3B18A]" />
            Next Steps
          </h3>
          <ul className={`text-xs space-y-2 list-disc pl-4 font-medium ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>
            <li>Contact the dormitory manager to approve your account.</li>
            <li>Provide them with your registered email: <br/><strong className={isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}>{user?.email}</strong></li>
            <li>Once approved, click the button below to gain access.</li>
          </ul>
        </div>

        <button 
          onClick={handleRefresh}
          disabled={checking}
          className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl bg-[#526B52] hover:bg-[#405640] dark:bg-[#A3B18A] dark:hover:bg-[#BAC7A8] text-white dark:text-[#171C18] font-bold text-sm transition-all mb-3 disabled:opacity-60 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
          {checking ? 'Checking...' : "I've been approved — Check now"}
        </button>

        <button 
          onClick={logout}
          className={`flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl font-semibold text-sm transition-colors border ${
            isDark
              ? 'border-[#394239] text-[#B1B8AC] hover:bg-[#292F29]'
              : 'border-[#DDE1D8] text-[#687168] hover:bg-[#ECECE4]'
          }`}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </motion.div>
    </div>
  );
}

