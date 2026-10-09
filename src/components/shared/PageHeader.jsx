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
        <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>{title}</h1>
        {subtitle && (
          <p className={`text-sm font-medium mt-1 ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </motion.div>
  );
}
