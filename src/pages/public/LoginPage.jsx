import { motion } from 'framer-motion';
import { Building2, Shield, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { loginWithGoogle, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const userData = await loginWithGoogle();
      toast.success(`Welcome back, ${userData?.name?.split(' ')[0] || 'User'}!`);
      if (userData?.role === 'manager') {
        navigate('/manager');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error('Login failed. Please try again.');
      }
    }
  };

  const features = [
    { icon: Building2, label: 'Room Management', desc: 'Manage rooms & assignments' },
    { icon: Users, label: 'Member Portal', desc: 'Track all residents easily' },
    { icon: Shield, label: 'Secure & Private', desc: 'Firebase-powered auth' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8"
        >
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg mb-4"
            >
              <Building2 className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white tracking-tight">4/67 Home</h1>
            <p className="text-slate-400 mt-1 text-sm">Smart Dormitory Management System</p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/5 border border-white/5"
              >
                <f.icon className="w-5 h-5 text-purple-400 mb-1.5" />
                <span className="text-white text-xs font-medium">{f.label}</span>
                <span className="text-slate-500 text-xs mt-0.5 leading-tight">{f.desc}</span>
              </motion.div>
            ))}
          </div>

          {/* Login Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-semibold shadow-lg transition-all duration-200"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </motion.button>

          {/* Footer note */}
          <p className="text-center text-slate-500 text-xs mt-6">
            Access is controlled by the dormitory manager.<br />
            Only registered members can sign in.
          </p>
        </motion.div>

        <p className="text-center text-slate-600 text-xs mt-6">
          © {new Date().getFullYear()} 4/67 Home. All rights reserved.
        </p>
      </div>
    </div>
  );
}
