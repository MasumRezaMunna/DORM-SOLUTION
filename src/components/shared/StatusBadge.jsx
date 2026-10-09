import { useTheme } from '../../contexts/ThemeContext';

const STATUS_STYLES = {
  pending:   'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D] dark:bg-[#78350F]/30 dark:text-[#FCD34D] dark:border-[#F59E0B]/40',
  partial:   'bg-[#FFEDD5] text-[#9A3412] border-[#FDBA74] dark:bg-[#7C2D12]/30 dark:text-[#FDBA74] dark:border-[#EA580C]/40',
  paid:      'bg-[#DCFCE7] text-[#166534] border-[#86EFAC] dark:bg-[#14532D]/30 dark:text-[#86EFAC] dark:border-[#22C55E]/40',
  active:    'bg-[#E8EDE3] text-[#526B52] border-[#A3B18A]/50 dark:bg-[#303A30] dark:text-[#A3B18A] dark:border-[#748D6B]/40',
  inactive:  'bg-[#ECECE4] text-[#687168] border-[#DDE1D8] dark:bg-[#292F29] dark:text-[#B1B8AC] dark:border-[#394239]',
  open:      'bg-[#CCFBF1] text-[#115E59] border-[#5EEAD4] dark:bg-[#134E4A]/30 dark:text-[#5EEAD4] dark:border-[#14B8A6]/40',
  resolved:  'bg-[#DCFCE7] text-[#166534] border-[#86EFAC] dark:bg-[#14532D]/30 dark:text-[#86EFAC] dark:border-[#22C55E]/40',
  closed:    'bg-[#ECECE4] text-[#687168] border-[#DDE1D8] dark:bg-[#292F29] dark:text-[#B1B8AC] dark:border-[#394239]',
  occupied:  'bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5] dark:bg-[#7F1D1D]/30 dark:text-[#FCA5A5] dark:border-[#EF4444]/40',
  available: 'bg-[#E8EDE3] text-[#526B52] border-[#A3B18A]/50 dark:bg-[#303A30] dark:text-[#A3B18A] dark:border-[#748D6B]/40',
  manager:   'bg-[#526B52] text-white border-transparent dark:bg-[#A3B18A] dark:text-[#171C18]',
  member:    'bg-[#ECECE4] text-[#202720] border-[#DDE1D8] dark:bg-[#292F29] dark:text-[#F0F1E9] dark:border-[#394239]',
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status?.toLowerCase()] || 'bg-[#ECECE4] text-[#687168] border-[#DDE1D8] dark:bg-[#292F29] dark:text-[#B1B8AC] dark:border-[#394239]';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${style}`}>
      {status || '—'}
    </span>
  );
}
