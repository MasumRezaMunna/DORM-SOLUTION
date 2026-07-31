import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Users, DoorOpen, Receipt, TrendingUp, TrendingDown,
  AlertCircle, Clock, ShoppingCart
} from 'lucide-react';
import StatCard from '../../components/shared/StatCard';
import PageHeader from '../../components/shared/PageHeader';
import CommunitySummary from '../../components/shared/CommunitySummary';
import WeeklyMealPlan from '../../components/shared/WeeklyMealPlan';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import api from '../../config/axios';
import { QUERY_KEYS } from '../../utils/constants';
import { useMarketStats } from '../../features/market/hooks/useMarketSchedules';



export default function ManagerDashboard() {
  const { isDark } = useTheme();

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.DASHBOARD_MANAGER,
    queryFn: async () => {
      const now = new Date();
      const { data } = await api.get(`/dashboard/manager?month=${now.getMonth() + 1}&year=${now.getFullYear()}`);
      return data.data;
    },
    // Use demo data if backend is not connected yet
    placeholderData: {
      overview: {
        totalMembers: 0,
        activeMembers: 0,
        occupiedRooms: 0,
        totalRooms: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
      },
      recentPayments: [],
      recentComplaints: [],
    }
  });

  const { data: marketStats, isLoading: marketLoading } = useMarketStats();

  const dormIncome    = isLoading ? 0 : (data?.overview?.monthlyIncome ?? 0);
  const dormExpenses  = isLoading ? 0 : (data?.overview?.monthlyExpenses ?? 0);
  const dormRemaining = Math.max(0, dormIncome - dormExpenses);
  const groceryCost   = isLoading ? 0 : (data?.overview?.groceryCost ?? 0);
  const commonCost    = isLoading ? 0 : (data?.overview?.commonCost ?? 0);
  const totalMeals    = isLoading ? 0 : (data?.overview?.totalMeals ?? 0);
  const mealRate      = isLoading ? 0 : (data?.overview?.mealRate ?? 0);
  const commonCostPerMember = isLoading ? 0 : (data?.overview?.commonCostPerMember ?? 0);

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
      title: 'Grocery Expenses',
      value: isLoading ? '...' : formatCurrency(groceryCost),
      icon: ShoppingCart,
      gradient: 'from-green-500 to-emerald-600',
      change: `${totalMeals} total meals`,
      changePositive: true,
    },
    {
      title: 'Common Expenses',
      value: isLoading ? '...' : formatCurrency(commonCost),
      icon: TrendingUp,
      gradient: 'from-blue-500 to-indigo-600',
      change: `Divided among active members`,
      changePositive: false,
    },
    {
      title: 'Total Expenses',
      value: isLoading ? '...' : formatCurrency(dormExpenses),
      icon: TrendingUp,
      gradient: 'from-pink-500 to-rose-600',
      change: 'Grocery + Common Cost',
      changeColor: 'text-rose-400',
    },
    {
      title: 'Meal Rate',
      value: isLoading ? '...' : formatCurrency(mealRate),
      icon: Receipt,
      gradient: 'from-orange-500 to-amber-600',
      change: 'Per meal calculation',
      changeColor: 'text-emerald-400',
    },
    {
      title: 'Common Cost / Member',
      value: isLoading ? '...' : formatCurrency(commonCostPerMember),
      icon: Users,
      gradient: 'from-blue-500 to-cyan-600',
      change: 'Equal share per member',
      changeColor: 'text-emerald-400',
    },
    {
      title: 'After Deduction (Balance)',
      value: isLoading ? '...' : formatCurrency(data?.overview?.netBalance ?? 0),
      icon: ShoppingCart,
      gradient: 'from-emerald-500 to-teal-600',
      change: 'Total Paid - Total Expenses',
      changeColor: (data?.overview?.netBalance ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400',
    }
  ];

  const marketCards = [
    {
      title: 'Total Schedules',
      value: marketLoading ? '...' : marketStats?.total ?? 0,
      icon: ShoppingCart,
      gradient: 'from-purple-500 to-indigo-600',
    },
    {
      title: 'Upcoming Teams',
      value: marketLoading ? '...' : marketStats?.upcoming ?? 0,
      icon: ShoppingCart,
      gradient: 'from-blue-500 to-cyan-600',
    },
    {
      title: 'Today\'s Team',
      value: marketLoading ? '...' : marketStats?.today ?? 0,
      icon: ShoppingCart,
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Completed Teams',
      value: marketLoading ? '...' : marketStats?.completed ?? 0,
      icon: ShoppingCart,
      gradient: 'from-slate-500 to-slate-700',
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



      {/* Market Stats */}
      <h3 className={`font-semibold text-lg mt-6 mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Market Teams Overview</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {marketCards.map((s, i) => <StatCard key={s.title} {...s} index={i} />)}
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

      <WeeklyMealPlan isManager={true} />

      <CommunitySummary />
    </div>
  );
}
