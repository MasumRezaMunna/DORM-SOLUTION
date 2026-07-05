import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * A styled table container for data display
 */
export default function DataTable({ columns, data = [], emptyMessage = 'No data found', loading = false }) {
  const { isDark } = useTheme();

  const cardClass = isDark
    ? 'bg-slate-900 border-white/10'
    : 'bg-white border-slate-200 shadow-sm';

  const thClass = isDark
    ? 'text-slate-400 border-white/5'
    : 'text-slate-500 border-slate-100';

  const tdClass = isDark
    ? 'text-slate-200 border-white/5'
    : 'text-slate-700 border-slate-100';

  const trClass = isDark
    ? 'hover:bg-white/3 odd:bg-white/2'
    : 'hover:bg-slate-50 odd:bg-slate-50/50';

  return (
    <div className={`rounded-2xl border overflow-hidden ${cardClass}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={`border-b ${thClass}`}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider ${thClass} border-b`}
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className={`border-b ${tdClass} ${trClass}`}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-3.5">
                      <div className={`h-4 rounded animate-pulse ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} style={{ width: '60%' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={`px-5 py-12 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <motion.tr
                  key={row._id || i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className={`border-b last:border-0 transition-colors ${tdClass} ${trClass}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-3.5">
                      {col.render ? col.render(row) : row[col.key] ?? '—'}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
