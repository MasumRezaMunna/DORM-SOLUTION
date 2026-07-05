import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

export default function PageHeader({ title, subtitle, action }) {
  const { isDark } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
    >
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{title}</h1>
        {subtitle && (
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </motion.div>
  );
}
