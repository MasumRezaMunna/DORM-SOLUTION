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
  const dims        = { sm: 'w-8 h-8',   md: 'w-12 h-12',   lg: 'w-16 h-16' };
  const borderWidth = { sm: 'border-2',  md: 'border-[3px]', lg: 'border-4' };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${
        fullPage ? 'min-h-screen bg-slate-950' : 'py-16'
      }`}
    >
      <div className="relative">
        {/* Glow behind the ring */}
        <div
          className={`absolute inset-0 rounded-full blur-md opacity-30 bg-gradient-to-tr from-purple-500 to-blue-500 ${dims[size]}`}
        />
        {/* Animated spinner ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
          className={`relative rounded-full ${dims[size]} ${borderWidth[size]} border-transparent border-t-purple-500 border-r-blue-500`}
        />
      </div>

      {message && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-medium text-slate-400 tracking-wide"
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
        isDark ? 'bg-white/[0.08]' : 'bg-slate-200'
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
    ? 'bg-slate-900 border-white/10'
    : 'bg-white border-slate-200 shadow-sm';

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
    ? 'bg-slate-900 border-white/10'
    : 'bg-white border-slate-200 shadow-sm';

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
    ? 'bg-slate-900 border-white/10'
    : 'bg-white border-slate-200 shadow-sm';

  return (
    <div className={`rounded-2xl border p-8 text-center ${cardBg}`}>
      <p className="text-2xl mb-2">\u26a0\ufe0f</p>
      <p className={`text-sm font-medium mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold shadow-lg hover:opacity-90 transition-all"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export default LoadingSpinner;
