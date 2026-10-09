import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * A styled table container for data display
 */
export default function DataTable({ columns, data = [], emptyMessage = 'No data found', loading = false }) {
  const { isDark } = useTheme();

  const cardClass = isDark
    ? 'bg-[#202720] border-[#394239]'
    : 'bg-white border-[#DDE1D8] shadow-sm';

  const thClass = isDark
    ? 'text-[#B1B8AC] bg-[#292F29]/60 border-[#394239]'
    : 'text-[#687168] bg-[#ECECE4]/50 border-[#DDE1D8]';

  const tdClass = isDark
    ? 'text-[#F0F1E9] border-[#394239]/60'
    : 'text-[#202720] border-[#DDE1D8]/60';

  const trClass = isDark
    ? 'hover:bg-[#292F29]/60 transition-colors'
    : 'hover:bg-[#ECECE4]/40 transition-colors';

  return (
    <div className={`rounded-2xl border overflow-hidden ${cardClass}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={`border-b ${thClass}`}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider ${thClass}`}
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
                      <div className={`h-4 rounded-md animate-pulse ${isDark ? 'bg-[#292F29]' : 'bg-[#ECECE4]'}`} style={{ width: '60%' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={`px-5 py-12 text-center text-sm font-medium ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>
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
