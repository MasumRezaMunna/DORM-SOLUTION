import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Receipt, UtensilsCrossed, TrendingDown, TrendingUp, ShoppingCart, Calendar, Users } from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import StatusBadge from '../../components/shared/StatusBadge';
import CommunitySummary from '../../components/shared/CommunitySummary';
import WeeklyMealPlan from '../../components/shared/WeeklyMealPlan';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency, formatDate, getMonthName } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/axios';
import { QUERY_KEYS } from '../../utils/constants';
import { useMySchedules } from '../../features/market/hooks/useMarketSchedules';

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

  const { data: myMarketData, isLoading: marketLoading } = useMySchedules();
  const mySummary = myMarketData?.summary || {};

  const paidAmount     = data?.memberPaidThisMonth || 0;
  
  // Total expenses for the member this month
  const mealThisMonth = data?.mealThisMonth ?? 0;
  const mealRate = data?.mealRate ?? 0;
  const foodCost = (mealThisMonth * mealRate);
  const commonExpense = data?.commonCostPerMember ?? 0;
  const totalPayable = foodCost + commonExpense;
  
  // Member's balance for this month
  const myBalance = paidAmount - totalPayable;

  const stats = [
    {
      title: 'Total Meals',
      value: isLoading ? '...' : mealThisMonth,
      icon: UtensilsCrossed,
      gradient: 'from-amber-500 to-orange-600',
      change: 'Your meals this month',
      changePositive: true,
    },
    {
      title: 'Food Cost',
      value: isLoading ? '...' : formatCurrency(foodCost),
      icon: ShoppingCart,
      gradient: 'from-green-500 to-emerald-600',
      change: `At ${formatCurrency(mealRate)} per meal`,
      changePositive: false,
    },
    {
      title: 'Common Expense',
      value: isLoading ? '...' : formatCurrency(commonExpense),
      icon: Users,
      gradient: 'from-blue-500 to-cyan-600',
      change: 'Your share for the month',
      changePositive: false,
    },
    {
      title: 'Total Payable',
      value: isLoading ? '...' : formatCurrency(totalPayable),
      icon: Receipt,
      gradient: 'from-purple-500 to-indigo-600',
      change: 'Calculated for this month',
      changePositive: false,
    },
    {
      title: 'Amount Paid',
      value: isLoading ? '...' : formatCurrency(paidAmount),
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-teal-600',
      change: 'Payments made this month',
      changePositive: true,
    },
    {
      title: 'My Balance',
      value: isLoading ? '...' : formatCurrency(Math.abs(myBalance)),
      icon: ShoppingCart,
      gradient: myBalance >= 0 ? 'from-emerald-500 to-teal-600' : 'from-red-500 to-rose-600',
      change: myBalance >= 0 ? 'Advance' : 'Due',
      changeColor: myBalance >= 0 ? 'text-emerald-400' : 'text-red-400',
    },
  ];

  const marketStats = [
    {
      title: 'My Next Market Duty',
      value: marketLoading ? '...' : mySummary.nextAssignedDate ? formatDate(mySummary.nextAssignedDate) : 'None Assigned',
      icon: Calendar,
      gradient: 'from-purple-500 to-indigo-600',
      change: 'Check Market Schedule for details',
      changePositive: true,
    },
    {
      title: 'Total Market Duties',
      value: marketLoading ? '...' : mySummary.totalDuties || 0,
      icon: ShoppingCart,
      gradient: 'from-blue-500 to-cyan-600',
      change: `Last duty: ${mySummary.lastMarketDate ? formatDate(mySummary.lastMarketDate) : 'Never'}`,
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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {stats.map((s, i) => <StatCard key={s.title} {...s} index={i} />)}
      </div>

      <h3 className={`font-semibold text-lg mt-6 mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Market Schedule Overview</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {marketStats.map((s, i) => <StatCard key={s.title} {...s} index={i} />)}
      </div>

      <WeeklyMealPlan isManager={false} />

      <CommunitySummary />
    </div>
  );
}
