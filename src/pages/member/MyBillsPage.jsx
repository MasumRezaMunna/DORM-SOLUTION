import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Receipt, TrendingUp, Clock } from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency, formatDate, getMonthName } from '../../utils/helpers';
import api from '../../config/axios';
import { QUERY_KEYS } from '../../utils/constants';

export default function MyBillsPage() {
  const { isDark } = useTheme();

  const { data: bills = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.MY_BILLS,
    queryFn: async () => {
      const { data } = await api.get('/bills/my');
      return data.data || [];
    },
    placeholderData: [],
  });

  const totalDue = bills.reduce((sum, b) => sum + Math.max(0, (b.totalAmount || 0) - (b.paidAmount || 0)), 0);

  const cardBg = isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200 shadow-sm';

  const columns = [
    {
      key: 'period',
      label: 'Period',
      render: (row) => <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{getMonthName(row.month)} {row.year}</span>
    },
    {
      key: 'total',
      label: 'Total',
      render: (row) => <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{formatCurrency(row.totalAmount)}</span>
    },
    {
      key: 'paid',
      label: 'Paid',
      render: (row) => <span className="text-sm text-emerald-400 font-medium">{formatCurrency(row.paidAmount || 0)}</span>
    },
    {
      key: 'due',
      label: 'Remaining',
      render: (row) => {
        const due = Math.max(0, (row.totalAmount || 0) - (row.paidAmount || 0));
        return <span className={`text-sm font-semibold ${due > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{formatCurrency(due)}</span>;
      }
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (row) => <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{formatDate(row.dueDate)}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="My Bills" subtitle="Your billing history" />

      {/* Summary */}
      {totalDue > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-red-500/30 bg-red-500/5"
        >
          <div className="p-2.5 rounded-xl bg-red-500/10">
            <Clock className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-red-400 text-xs font-medium">Outstanding Balance</p>
            <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{formatCurrency(totalDue)}</p>
          </div>
          <p className={`text-sm ml-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Please pay at your earliest convenience.</p>
        </motion.div>
      )}

      <DataTable
        columns={columns}
        data={bills}
        loading={isLoading}
        emptyMessage="No bills found. Your billing history will appear here."
      />
    </div>
  );
}
