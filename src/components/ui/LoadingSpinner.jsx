import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Full-page or section loading spinner.
 * Branded gradient ring + optional message.
 *
 * @param {string}  message  - Short text shown below the spinner
 * @param {boolean} fullPage - If true, fills the viewport height
 * @param {string}  size     - 'sm' | 'md' | 'lg'
 */
export function LoadingSpinner({
  message = 'Loading\u2026',
  fullPage = false,
  size = 'md',
}) {
  const { isDark } = useTheme();
  const dims        = { sm: 'w-8 h-8',   md: 'w-12 h-12',   lg: 'w-16 h-16' };
  const borderWidth = { sm: 'border-2',  md: 'border-[3px]', lg: 'border-4' };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${
        fullPage ? (isDark ? 'min-h-screen bg-[#171C18]' : 'min-h-screen bg-[#F5F4EE]') : 'py-16'
      }`}
    >
      <div className="relative">
        {/* Glow behind the ring */}
        <div
          className={`absolute inset-0 rounded-full blur-md opacity-25 ${isDark ? 'bg-[#A3B18A]' : 'bg-[#526B52]'} ${dims[size]}`}
        />
        {/* Animated spinner ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
          className={`relative rounded-full ${dims[size]} ${borderWidth[size]} border-transparent border-t-[#526B52] border-r-[#A3B18A] dark:border-t-[#A3B18A] dark:border-r-[#BAC7A8]`}
        />
      </div>

      {message && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`text-sm font-semibold tracking-wide ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}

/**
 * Single animated shimmer placeholder block.
 * @param {string} className - Extra Tailwind classes (size, rounded, etc.)
 */
export function Skeleton({ className = '' }) {
  const { isDark } = useTheme();
  return (
    <div
      className={`animate-pulse rounded-lg ${
        isDark ? 'bg-[#292F29]' : 'bg-[#ECECE4]'
      } ${className}`}
    />
  );
}

/**
 * Grid of skeleton stat cards that match StatCard layout.
 * @param {number} count - How many skeleton cards to render
 */
export function StatCardSkeleton({ count = 4 }) {
  const { isDark } = useTheme();
  const cardBg = isDark
    ? 'bg-[#202720] border-[#394239]'
    : 'bg-white border-[#DDE1D8] shadow-sm';

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`relative rounded-2xl p-5 border animate-pulse ${cardBg}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-2.5 w-20" />
            </div>
            <Skeleton className="w-11 h-11 rounded-2xl flex-shrink-0" />
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * Generic card skeleton for list / content areas.
 * @param {number} rows - Number of text rows to simulate
 */
export function CardSkeleton({ rows = 3 }) {
  const { isDark } = useTheme();
  const cardBg = isDark
    ? 'bg-[#202720] border-[#394239]'
    : 'bg-white border-[#DDE1D8] shadow-sm';

  return (
    <div className={`rounded-2xl border p-6 animate-pulse ${cardBg}`}>
      <Skeleton className="h-5 w-36 mb-5" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className={`h-4 ${i % 2 === 0 ? 'w-full' : 'w-3/4'}`} />
        ))}
      </div>
    </div>
  );
}

/**
 * User-friendly error state with optional Retry button.
 * @param {string}   message  - Error description shown to the user
 * @param {Function} onRetry  - Called when the Retry button is clicked
 */
export function ErrorCard({ message = 'Something went wrong.', onRetry }) {
  const { isDark } = useTheme();
  const cardBg = isDark
    ? 'bg-[#202720] border-[#394239]'
    : 'bg-white border-[#DDE1D8] shadow-sm';

  return (
    <div className={`rounded-2xl border p-8 text-center ${cardBg}`}>
      <p className="text-2xl mb-2">\u26a0\ufe0f</p>
      <p className={`text-sm font-semibold mb-4 ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2 rounded-xl bg-[#526B52] hover:bg-[#405640] dark:bg-[#A3B18A] dark:hover:bg-[#BAC7A8] text-white dark:text-[#171C18] text-sm font-bold shadow-sm transition-all"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export default LoadingSpinner;
