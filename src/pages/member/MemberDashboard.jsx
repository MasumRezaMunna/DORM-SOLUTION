import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Receipt, DoorOpen, UtensilsCrossed, Bell, TrendingDown } from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import StatusBadge from '../../components/shared/StatusBadge';
import CommunitySummary from '../../components/shared/CommunitySummary';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency, formatDate, getMonthName } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/axios';
import { QUERY_KEYS } from '../../utils/constants';

export default function MemberDashboard() {
  const { isDark } = useTheme();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.DASHBOARD_MEMBER,
    queryFn: async () => {
      const { data } = await api.get('/dashboard/member');
      return data.data;
    },
    placeholderData: {
      currentBill: null,
      room: null,
      mealThisMonth: 0,
      recentNotices: [],
    }
  });

  const stats = [
    {
      title: 'Current Bill',
      value: isLoading ? '...' : formatCurrency(data?.currentBill?.totalAmount || 0),
      icon: Receipt,
      gradient: 'from-purple-500 to-indigo-600',
      change: data?.currentBill ? `Due: ${formatDate(data?.currentBill?.dueDate)}` : 'No active bill',
      changePositive: !data?.currentBill,
    },
    {
      title: 'Amount Paid',
      value: isLoading ? '...' : formatCurrency(data?.currentBill?.paidAmount || 0),
      icon: TrendingDown,
      gradient: 'from-emerald-500 to-teal-600',
      change: data?.currentBill?.status ? `Status: ${data?.currentBill?.status}` : '—',
      changePositive: data?.currentBill?.status === 'paid',
    },
    {
      title: 'My Room',
      value: isLoading ? '...' : data?.room ? `Room ${data?.room?.roomNumber}` : 'Not Assigned',
      icon: DoorOpen,
      gradient: 'from-blue-500 to-cyan-600',
      change: data?.room ? `${data?.room?.type || 'Standard'} · Floor ${data?.room?.floor || 1}` : '—',
      changePositive: !!data?.room,
    },
    {
      title: 'Meals This Month',
      value: isLoading ? '...' : data?.mealThisMonth ?? 0,
      icon: UtensilsCrossed,
      gradient: 'from-amber-500 to-orange-600',
      change: 'Total meals taken',
      changePositive: true,
    },
  ];

  const cardBg = isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200 shadow-sm';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hello, ${user?.name?.split(' ')[0] || 'there'}! 👋`}
        subtitle={`Welcome to 4/67 Home. Here's your summary.`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={s.title} {...s} index={i} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Current Bill Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`rounded-2xl border p-5 ${cardBg}`}
        >
          <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Current Bill Breakdown</h3>
          {!data?.currentBill ? (
            <div className={`text-center py-8 ${textMuted}`}>
              <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No bill generated yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Rent', value: data.currentBill.rentAmount },
                { label: 'Meal Charge', value: data.currentBill.mealAmount },
                { label: 'Other Charges', value: data.currentBill.otherCharges },
              ].map(item => item.value > 0 && (
                <div key={item.label} className={`flex justify-between items-center py-2 border-b last:border-0 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  <span className={`text-sm ${textMuted}`}>{item.label}</span>
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{formatCurrency(item.value)}</span>
                </div>
              ))}
              <div className={`flex justify-between items-center pt-2`}>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Total</span>
                <span className="font-bold text-purple-400 text-lg">{formatCurrency(data.currentBill.totalAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${textMuted}`}>Status</span>
                <StatusBadge status={data.currentBill.status} />
              </div>
            </div>
          )}
        </motion.div>

        {/* Recent Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`rounded-2xl border p-5 ${cardBg}`}
        >
          <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Recent Notifications</h3>
          {(data?.recentNotifications || []).length === 0 ? (
            <div className={`text-center py-8 ${textMuted}`}>
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No notifications yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(data?.recentNotifications || []).slice(0, 4).map((n, i) => (
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
      </div>

      <CommunitySummary />
    </div>
  );
}
