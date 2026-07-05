import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Users, DoorOpen, Receipt, TrendingUp, TrendingDown,
  AlertCircle, CheckCircle2, Clock
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import StatCard from '../../components/shared/StatCard';
import PageHeader from '../../components/shared/PageHeader';
import CommunitySummary from '../../components/shared/CommunitySummary';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import api from '../../config/axios';
import { QUERY_KEYS } from '../../utils/constants';

const DEMO_INCOME = [
  { month: 'Feb', income: 45000, expenses: 22000 },
  { month: 'Mar', income: 48000, expenses: 25000 },
  { month: 'Apr', income: 46000, expenses: 23000 },
  { month: 'May', income: 52000, expenses: 28000 },
  { month: 'Jun', income: 49000, expenses: 24000 },
  { month: 'Jul', income: 55000, expenses: 26000 },
];

const DEMO_BILLS = [
  { month: 'Apr', pending: 8, paid: 20 },
  { month: 'May', pending: 5, paid: 23 },
  { month: 'Jun', pending: 9, paid: 19 },
  { month: 'Jul', pending: 6, paid: 22 },
];

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
  const tooltipStyle = isDark
    ? { backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }
    : { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 12 };

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

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Income vs Expenses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`xl:col-span-2 rounded-2xl border p-5 ${cardBg}`}
        >
          <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={DEMO_INCOME} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'} />
              <XAxis dataKey="month" tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `৳${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(v)} />
              <Area type="monotone" dataKey="income" name="Income" stroke="#8b5cf6" strokeWidth={2} fill="url(#income)" />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f59e0b" strokeWidth={2} fill="url(#expenses)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bill Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`rounded-2xl border p-5 ${cardBg}`}
        >
          <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Bill Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={DEMO_BILLS} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'} />
              <XAxis dataKey="month" tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="paid" name="Paid" fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Recent Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className={`rounded-2xl border p-5 ${cardBg}`}
        >
          <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Recent Notifications</h3>
          {(data?.recentNotifications || []).length === 0 ? (
            <div className={`text-center py-8 ${textMuted}`}>
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No recent notifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(data?.recentNotifications || []).slice(0, 5).map((n, i) => (
                <div key={i} className={`py-2 border-b last:border-0 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  <div className="flex justify-between items-start mb-0.5">
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'} ${!n.isRead ? '' : 'opacity-80'}`}>{n.title}</p>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0 mt-1" />}
                  </div>
                  <p className={`text-xs line-clamp-2 ${textMuted} ${!n.isRead ? '' : 'opacity-80'}`}>{n.message}</p>
                  <p className={`text-[10px] uppercase font-medium tracking-wider mt-1.5 ${textMuted} opacity-60`}>{formatDate(n.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

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
