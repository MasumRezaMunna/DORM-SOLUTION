import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Users, DoorOpen, Receipt, TrendingUp, TrendingDown,
  AlertCircle, Clock
} from 'lucide-react';
import StatCard from '../../components/shared/StatCard';
import PageHeader from '../../components/shared/PageHeader';
import CommunitySummary from '../../components/shared/CommunitySummary';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import api from '../../config/axios';
import { QUERY_KEYS } from '../../utils/constants';



export default function ManagerDashboard() {
  const { isDark } = useTheme();

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.DASHBOARD_MANAGER,
    queryFn: async () => {
      const { data } = await api.get('/dashboard/manager');
      return data.data;
    },
    // Use demo data if backend is not connected yet
    placeholderData: {
      overview: {
        totalMembers: 28,
        activeMembers: 26,
        occupiedRooms: 14,
        totalRooms: 16,
        monthlyIncome: 55000,
        monthlyExpenses: 26000,
        pendingBills: 6,
      },
      recentPayments: [],
      recentComplaints: [],
    }
  });

  const stats = [
    {
      title: 'Total Members',
      value: isLoading ? '...' : data?.overview?.totalMembers ?? '—',
      icon: Users,
      gradient: 'from-purple-500 to-indigo-600',
      change: `${data?.overview?.activeMembers ?? 0} active`,
      changePositive: true,
    },
    {
      title: 'Occupied Rooms',
      value: isLoading ? '...' : `${data?.overview?.occupiedRooms ?? 0}/${data?.overview?.totalRooms ?? 0}`,
      icon: DoorOpen,
      gradient: 'from-blue-500 to-cyan-600',
      change: `${(data?.overview?.totalRooms ?? 0) - (data?.overview?.occupiedRooms ?? 0)} available`,
      changePositive: true,
    },
    {
      title: 'Monthly Income',
      value: isLoading ? '...' : formatCurrency(data?.overview?.monthlyIncome ?? 0),
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-teal-600',
      change: `Expenses: ${formatCurrency(data?.overview?.monthlyExpenses ?? 0)}`,
      changePositive: true,
    },
    {
      title: 'Pending Bills',
      value: isLoading ? '...' : data?.overview?.pendingBills ?? 0,
      icon: Receipt,
      gradient: 'from-amber-500 to-orange-600',
      change: data?.overview?.pendingBills > 0 ? 'Needs attention' : 'All cleared!',
      changePositive: (data?.overview?.pendingBills ?? 0) === 0,
    },
  ];

  const cardBg = isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200 shadow-sm';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manager Dashboard"
        subtitle={`Welcome back! Here's what's happening at 4/67 Home.`}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={s.title} {...s} index={i} />)}
      </div>



      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-4">
        {/* Open Complaints */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`rounded-2xl border p-5 ${cardBg}`}
        >
          <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Open Complaints</h3>
          {(data?.recentComplaints || []).length === 0 ? (
            <div className={`text-center py-8 ${textMuted}`}>
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No open complaints — all good! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(data?.recentComplaints || []).slice(0, 5).map((c, i) => (
                <div key={i} className={`flex items-start gap-3 py-2 border-b last:border-0 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  <Clock className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{c.title}</p>
                    <p className={`text-xs ${textMuted}`}>{c.memberId?.userId?.displayName || 'Unknown'} · {c.type}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <CommunitySummary />
    </div>
  );
}
