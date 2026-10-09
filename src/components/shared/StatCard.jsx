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
export default function StatCard({ title, value, icon: Icon, gradient, change, changePositive, index = 0, isLoading = false }) {
  const { isDark } = useTheme();
  const showSkeleton = isLoading || value === '...';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className={`relative rounded-2xl p-5 overflow-hidden border ${
        isDark
          ? 'bg-[#202720] border-[#394239]'
          : 'bg-white border-[#DDE1D8] shadow-sm'
      }`}
    >
      <div className="relative flex items-start justify-between">
        <div className="flex-1 pr-3">
          <p className={`text-xs uppercase font-bold tracking-wider ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>{title}</p>
          {showSkeleton ? (
            <div className={`mt-2.5 h-8 w-28 rounded-lg animate-pulse ${isDark ? 'bg-[#292F29]' : 'bg-[#ECECE4]'}`} />
          ) : (
            <p className={`text-3xl font-extrabold tracking-tight mt-1.5 ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>{value}</p>
          )}
          {change && (
            showSkeleton ? (
              <div className={`mt-2 h-3.5 w-16 rounded animate-pulse ${isDark ? 'bg-[#292F29]' : 'bg-[#ECECE4]'}`} />
            ) : (
              <p className={`text-xs mt-2 font-semibold ${changePositive ? 'text-[#16A34A] dark:text-[#22C55E]' : 'text-[#DC2626] dark:text-[#EF4444]'}`}>
                {change}
              </p>
            )
          )}
        </div>
        <div className={`p-3 rounded-2xl flex-shrink-0 ${
          isDark
            ? 'bg-[#303A30] text-[#A3B18A] border border-[#394239]'
            : 'bg-[#E8EDE3] text-[#526B52] border border-[#DDE1D8]'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}
