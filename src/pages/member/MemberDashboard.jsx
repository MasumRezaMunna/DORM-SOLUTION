import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Receipt, UtensilsCrossed, TrendingUp,
  ShoppingCart, Calendar, Users, X,
  CalendarDays, ChevronDown,
} from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import CommunitySummary from '../../components/shared/CommunitySummary';
import WeeklyMealPlan from '../../components/shared/WeeklyMealPlan';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/axios';
import { QUERY_KEYS } from '../../utils/constants';
import { useMySchedules } from '../../features/market/hooks/useMarketSchedules';

/**
 * Mobile-only expandable section button + panel.
 * On desktop (sm+) the caller hides this entire element with CSS.
 */
function MobileSection({ id, icon: Icon, label, isOpen, onToggle, onClose, isDark, children }) {
  const cardBg = isDark ? 'bg-[#202720] border-[#394239]' : 'bg-white border-[#DDE1D8] shadow-sm';
  const btnBase = isDark
    ? 'bg-[#202720] border-[#394239] text-[#F0F1E9] hover:bg-[#292F29] hover:border-[#526B52]'
    : 'bg-white border-[#DDE1D8] text-[#202720] hover:bg-[#E8EDE3] hover:border-[#526B52] shadow-sm';

  return (
    <div className="sm:hidden">
      {/* Toggle button */}
      <button
        id={`${id}-btn`}
        aria-expanded={isOpen}
        aria-controls={`${id}-panel`}
        onClick={onToggle}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl border font-semibold text-sm transition-all duration-200 active:scale-[0.98] ${btnBase} ${
          isOpen
            ? isDark
              ? 'border-[#A3B18A] bg-[#292F29]'
              : 'border-[#526B52] bg-[#E8EDE3]'
            : ''
        }`}
      >
        <span className="flex items-center gap-2.5">
          <span
            className={`p-1.5 rounded-lg transition-colors ${
              isOpen
                ? 'bg-[#526B52] dark:bg-[#A3B18A] text-white dark:text-[#171C18]'
                : isDark
                ? 'bg-[#292F29] text-[#A3B18A]'
                : 'bg-[#E8EDE3] text-[#526B52]'
            }`}
          >
            <Icon className="w-4 h-4" />
          </span>
          {label}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className={isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>

      {/* Expandable panel */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`${id}-panel`}
            role="region"
            aria-labelledby={`${id}-btn`}
            key="panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            {/* Close bar */}
            <div className={`flex items-center justify-between px-4 py-2 mt-2 rounded-t-xl border-b ${isDark ? 'bg-[#202720] border-[#394239]' : 'bg-white border-[#DDE1D8]'}`}>
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>
                {label}
              </span>
              <button
                onClick={onClose}
                aria-label={`Close ${label}`}
                className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-[#292F29] text-[#B1B8AC]' : 'hover:bg-[#ECECE4] text-[#687168]'}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="mt-0">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MemberDashboard() {
  const { isDark } = useTheme();
  const { user } = useAuth();

  // Mobile panel state — only one open at a time
  const [mobileSection, setMobileSection] = useState(null); // 'market' | 'meal' | null

  const toggleSection = (name) =>
    setMobileSection((prev) => (prev === name ? null : name));

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.DASHBOARD_MEMBER,
    queryFn: async () => {
      const now = new Date();
      const { data } = await api.get(`/dashboard/member?month=${now.getMonth() + 1}&year=${now.getFullYear()}`);
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

  const paidAmount      = data?.memberPaidThisMonth || 0;
  const mealThisMonth   = data?.mealThisMonth ?? 0;
  const mealRate        = data?.mealRate ?? 0;
  const foodCost        = mealThisMonth * mealRate;
  const commonExpense   = data?.commonCostPerMember ?? 0;
  const totalPayable    = foodCost + commonExpense;
  const myBalance       = paidAmount - totalPayable;

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
      gradient: 'from-teal-600 to-emerald-700',
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
      gradient: 'from-emerald-600 to-teal-700',
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

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hello, ${user?.name?.split(' ')[0] || 'there'}! 👋`}
        subtitle="Welcome to Home. Here's your summary."
      />

      {/* ─── Stat cards ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {stats.map((s, i) => <StatCard key={s.title} {...s} index={i} />)}
      </div>

      {/* ─── Market Schedule Overview ─────────────────────────────────────────── */}

      {/* Desktop / tablet (sm–xl): always visible. On xl+ the right panel shows these. */}
      <div className="hidden sm:block xl:hidden">
        <h3 className={`font-bold text-lg tracking-tight mt-6 mb-2 ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>
          Market Schedule Overview
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {marketStats.map((s, i) => <StatCard key={s.title} {...s} index={i} />)}
        </div>
      </div>

      {/* Mobile: collapsible */}
      <MobileSection
        id="market-schedule"
        icon={Calendar}
        label="Market Schedule"
        isOpen={mobileSection === 'market'}
        onToggle={() => toggleSection('market')}
        onClose={() => setMobileSection(null)}
        isDark={isDark}
      >
        <div className="grid grid-cols-1 gap-3 px-1 pt-2 pb-1">
          {marketStats.map((s, i) => <StatCard key={s.title} {...s} index={i} />)}
        </div>
      </MobileSection>

      {/* ─── Weekly Meal Plan ─────────────────────────────────────────────────── */}

      {/* Desktop / tablet (sm–xl): always visible. On xl+ the right panel shows this. */}
      <div className="hidden sm:block xl:hidden">
        <WeeklyMealPlan isManager={false} />
      </div>

      {/* Mobile: collapsible */}
      <MobileSection
        id="weekly-meal-plan"
        icon={CalendarDays}
        label="Weekly Meal Plan"
        isOpen={mobileSection === 'meal'}
        onToggle={() => toggleSection('meal')}
        onClose={() => setMobileSection(null)}
        isDark={isDark}
      >
        <WeeklyMealPlan isManager={false} />
      </MobileSection>

      {/* ─── Community Summary (always visible) ───────────────────────────────── */}
      <CommunitySummary />
    </div>
  );
}
