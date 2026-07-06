import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Clock, LogOut, Phone, RefreshCw } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function PendingPage() {
  const { logout, user, isPending, isAuthenticated, loading, refreshPendingStatus } = useAuth();
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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-slate-900 border border-white/10 rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
        
        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-amber-500" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Account Pending</h1>
        <p className="text-slate-400 mb-8 text-sm leading-relaxed">
          Hello <strong>{user?.displayName}</strong>, your account has been successfully created but is currently pending manager approval. You will gain full access once a manager activates your membership.
        </p>

        <div className="bg-slate-800/50 rounded-2xl p-5 mb-6 text-left border border-white/5">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-400" />
            Next Steps
          </h3>
          <ul className="text-sm text-slate-400 space-y-2 list-disc pl-4 marker:text-slate-600">
            <li>Contact the dormitory manager to approve your account.</li>
            <li>Provide them with your registered email: <br/><strong className="text-slate-300">{user?.email}</strong></li>
            <li>Once approved, click the button below to gain access.</li>
          </ul>
        </div>

        <button 
          onClick={handleRefresh}
          disabled={checking}
          className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-white font-medium transition-all mb-3 disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
          {checking ? 'Checking...' : "I've been approved — Check now"}
        </button>

        <button 
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors border border-white/10"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </motion.div>
    </div>
  );
}

