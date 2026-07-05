import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, PersonStanding, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import { useTheme } from '../../contexts/ThemeContext';
import { formatDate, formatRelativeTime } from '../../utils/helpers';
import api from '../../config/axios';
import { QUERY_KEYS } from '../../utils/constants';

export default function VisitorsPage() {
  const { isDark } = useTheme();

  const { data: visitors = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.VISITORS,
    queryFn: async () => {
      const { data } = await api.get('/visitors');
      return data.data || [];
    },
    placeholderData: [],
  });

  const columns = [
    {
      key: 'name',
      label: 'Visitor',
      render: (row) => (
        <div>
          <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{row.visitorName}</p>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{row.phone || '—'}</p>
        </div>
      )
    },
    {
      key: 'visiting',
      label: 'Visiting',
      render: (row) => (
        <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          {row.member?.name || '—'}
        </span>
      )
    },
    {
      key: 'purpose',
      label: 'Purpose',
      render: (row) => <span className={`text-sm capitalize ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{row.purpose || '—'}</span>
    },
    {
      key: 'checkIn',
      label: 'Check In',
      render: (row) => <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{formatDate(row.checkIn)}</span>
    },
    {
      key: 'checkOut',
      label: 'Check Out',
      render: (row) => (
        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {row.checkOut ? formatDate(row.checkOut) : (
            <span className="text-amber-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> On-site</span>
          )}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status || 'active'} />
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Visitor Log"
        subtitle={`${visitors.filter(v => !v.checkOut).length} visitors currently on-site`}
        action={
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Log Visitor
          </motion.button>
        }
      />

      <DataTable
        columns={columns}
        data={visitors}
        loading={isLoading}
        emptyMessage="No visitors logged yet."
      />
    </div>
  );
}
