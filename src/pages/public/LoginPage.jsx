import { motion } from 'framer-motion';
import { Building2, Shield, Users, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const { isDark, toggleTheme } = useTheme();
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
    { icon: Building2, label: 'Rooms', desc: 'Allocation & tracking' },
    { icon: Users, label: 'Meals & Bazar', desc: 'Schedules & duties' },
    { icon: Shield, label: 'Secured', desc: 'Firebase + JWT Auth' },
  ];

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200 ${
      isDark ? 'bg-[#171C18] text-[#F0F1E9]' : 'bg-[#F5F4EE] text-[#202720]'
    }`}>
      {/* Background subtle scandi grid pattern */}
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

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`rounded-3xl border p-8 sm:p-9 shadow-xl transition-colors duration-200 ${
            isDark
              ? 'bg-[#202720] border-[#394239] shadow-2xl'
              : 'bg-white border-[#DDE1D8] shadow-sm'
          }`}
        >
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 220 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#526B52] dark:bg-[#A3B18A] text-white dark:text-[#171C18] shadow-md mb-4"
            >
              <Building2 className="w-8 h-8" />
            </motion.div>
            <h1 className="text-3xl font-extrabold tracking-tight">Home</h1>
            <p className={`mt-1.5 text-sm font-medium ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>
              Scandinavian Calm × Bold Futuristic Dorm Management
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-3 gap-2.5 mb-8">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.08 }}
                className={`flex flex-col items-center text-center p-3 rounded-2xl border transition-colors ${
                  isDark
                    ? 'bg-[#292F29] border-[#394239]'
                    : 'bg-[#ECECE4]/60 border-[#DDE1D8]'
                }`}
              >
                <f.icon className="w-5 h-5 text-[#526B52] dark:text-[#A3B18A] mb-1.5" />
                <span className="text-xs font-bold leading-tight">{f.label}</span>
                <span className={`text-[11px] font-medium mt-0.5 leading-tight ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>{f.desc}</span>
              </motion.div>
            ))}
          </div>

          {/* Login Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogin}
            className={`w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 border ${
              isDark
                ? 'bg-[#292F29] hover:bg-[#303A30] text-[#F0F1E9] border-[#394239]'
                : 'bg-white hover:bg-[#ECECE4] text-[#202720] border-[#DDE1D8] shadow-sm'
            }`}
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
          <p className={`text-center text-xs mt-6 font-medium ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>
            Access is controlled by the dormitory manager.<br />
            Only registered members can sign in.
          </p>
        </motion.div>

        <p className={`text-center text-xs mt-6 font-medium ${isDark ? 'text-[#B1B8AC]/60' : 'text-[#687168]/70'}`}>
          © {new Date().getFullYear()} Home. All rights reserved.
        </p>
      </div>
    </div>
  );
}
