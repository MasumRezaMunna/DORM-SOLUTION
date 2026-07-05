import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Reusable stat card for dashboards
 * @param {string} title
 * @param {string|number} value
 * @param {ReactNode} icon
 * @param {string} color - tailwind gradient string
 * @param {string} change - e.g. "+5% this month"
 * @param {number} index - for stagger animation
 */
export default function StatCard({ title, value, icon: Icon, gradient, change, changePositive, index = 0 }) {
  const { isDark } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className={`relative rounded-2xl p-5 overflow-hidden border ${
        isDark
          ? 'bg-slate-900 border-white/10'
          : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      {/* Gradient accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-2xl -translate-y-8 translate-x-8 bg-gradient-to-br ${gradient}`} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{title}</p>
          <p className={`text-2xl font-bold mt-1.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>{value}</p>
          {change && (
            <p className={`text-xs mt-2 font-medium ${changePositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </motion.div>
  );
}
