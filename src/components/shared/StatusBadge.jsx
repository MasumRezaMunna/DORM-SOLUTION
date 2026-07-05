import { useTheme } from '../../contexts/ThemeContext';

const STATUS_STYLES = {
  pending:   'bg-amber-500/15 text-amber-400 border-amber-500/30',
  partial:   'bg-orange-500/15 text-orange-400 border-orange-500/30',
  paid:      'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  active:    'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  inactive:  'bg-slate-500/15 text-slate-400 border-slate-500/30',
  open:      'bg-blue-500/15 text-blue-400 border-blue-500/30',
  resolved:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  closed:    'bg-slate-500/15 text-slate-400 border-slate-500/30',
  occupied:  'bg-red-500/15 text-red-400 border-red-500/30',
  available: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  manager:   'bg-purple-500/15 text-purple-400 border-purple-500/30',
  member:    'bg-blue-500/15 text-blue-400 border-blue-500/30',
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status?.toLowerCase()] || 'bg-slate-500/15 text-slate-400 border-slate-500/30';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${style}`}>
      {status || '—'}
    </span>
  );
}
