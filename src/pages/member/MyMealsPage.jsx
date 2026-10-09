import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, BarChart3, TrendingDown, Wallet, ChevronLeft, ChevronRight, Table } from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import { useTheme } from '../../contexts/ThemeContext';
import { formatDate, getInitials } from '../../utils/helpers';
import api from '../../config/axios';

function StatCard({ icon: Icon, label, value, sub, iconColor, isDark }) {
  return (
    <div className={`rounded-2xl border p-4 flex items-start gap-3.5 ${isDark ? 'bg-[#202720] border-[#394239]' : 'bg-white border-[#DDE1D8] shadow-sm'}`}>
      <div className={`p-2.5 rounded-xl ${iconColor} flex-shrink-0`}><Icon className="w-4 h-4" /></div>
      <div>
        <p className={`text-xs font-semibold mb-0.5 ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>{label}</p>
        <p className={`text-xl font-extrabold tracking-tight tabular-nums ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>{value}</p>
        {sub && <p className={`text-xs mt-0.5 ${isDark ? 'text-[#B1B8AC]/70' : 'text-[#687168]/80'}`}>{sub}</p>}
      </div>
    </div>
  );
}

function BalanceBadge({ amount }) {
  if (amount > 0) return <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E8EDE3] dark:bg-[#303A30] text-[#526B52] dark:text-[#A3B18A] font-bold tabular-nums">+৳{amount.toFixed(2)}</span>;
  if (amount < 0) return <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold tabular-nums">-৳{Math.abs(amount).toFixed(2)}</span>;
  return <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#ECECE4] dark:bg-[#292F29] text-[#687168] dark:text-[#B1B8AC] font-bold">৳0</span>;
}

export default function MyMealsPage() {
  const { isDark } = useTheme();
  const [tab, setTab] = useState('my-meals');

  const now = new Date();
  const [summaryMonth, setSummaryMonth] = useState(now.getMonth() + 1);
  const [summaryYear,  setSummaryYear]  = useState(now.getFullYear());

  const cardBg = isDark ? 'bg-[#202720] border-[#394239]' : 'bg-white border-[#DDE1D8] shadow-sm';
  const textMuted = isDark ? 'text-[#B1B8AC]' : 'text-[#687168]';

  // 1. Fetch member's daily meals
  const { data: myMeals = [], isLoading: myMealsLoading } = useQuery({
    queryKey: ['meals', 'my'],
    queryFn: async () => {
      const { data } = await api.get('/meals/my');
      return data.data || [];
    },
    enabled: tab === 'my-meals',
  });

  // 2. Fetch monthly summary for all members
  const { data: monthlySummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['mealMonthlyDetail', summaryMonth, summaryYear],
    queryFn: async () => {
      const { data } = await api.get(`/meals/monthly-detail?month=${summaryMonth}&year=${summaryYear}`);
      return data.data;
    },
    enabled: tab === 'summary' || tab === 'breakdown',
    staleTime: 30_000,
  });

  // 3. Fetch all daily meal entries for the selected month (for breakdown tab)
  const { data: monthMeals = [], isLoading: monthMealsLoading } = useQuery({
    queryKey: ['mealEntriesMonth', summaryMonth, summaryYear],
    queryFn: async () => {
      const { data } = await api.get(`/meals?month=${summaryMonth}&year=${summaryYear}&limit=2000`);
      return data.data || [];
    },
    enabled: tab === 'breakdown',
    staleTime: 30_000,
  });

  const totalMyMeals = myMeals.reduce((sum, m) => sum + (m.mealCount || 0), 0);

  const prevMonth = () => {
    if (summaryMonth === 1) { setSummaryMonth(12); setSummaryYear(y => y - 1); }
    else setSummaryMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (summaryMonth === 12) { setSummaryMonth(1); setSummaryYear(y => y + 1); }
    else setSummaryMonth(m => m + 1);
  };
  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const columns = [
    { key: 'date', label: 'Date', render: (row) => <span className={`text-sm font-medium ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>{formatDate(row.date)}</span> },
    { key: 'mealCount', label: 'Meals', render: (row) => (
        <div className="flex items-center gap-1.5">
          <UtensilsCrossed className="w-3.5 h-3.5 text-amber-500" />
          <span className={`font-bold text-sm ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>{row.mealCount}</span>
        </div>
      )
    },
    { key: 'note', label: 'Note', render: (row) => <span className={`text-xs ${textMuted}`}>{row.note || '—'}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Meals" subtitle="Track your daily meals and view monthly summary" />

      {/* Tab switcher */}
      <div className={`inline-flex items-center gap-1 p-1 rounded-xl border ${isDark ? 'bg-[#202720] border-[#394239]' : 'bg-[#ECECE4] border-[#DDE1D8]'}`}>
        {[
          { key: 'my-meals',  icon: UtensilsCrossed, label: 'My Meals' },
          { key: 'summary',   icon: BarChart3,        label: 'Community Summary' },
          { key: 'breakdown', icon: Table,            label: 'Detailed Breakdown' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === t.key
                ? 'bg-[#526B52] dark:bg-[#A3B18A] text-white dark:text-[#171C18] shadow-sm'
                : isDark ? 'text-[#B1B8AC] hover:text-[#F0F1E9]' : 'text-[#687168] hover:text-[#202720]'
            }`}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ══════════════════ MY MEALS TAB ══════════════════ */}
        {tab === 'my-meals' && (
          <motion.div key="my-meals" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl border ${cardBg}`}>
              <div className="p-2.5 rounded-xl bg-[#E8EDE3] dark:bg-[#303A30]">
                <UtensilsCrossed className="w-5 h-5 text-[#526B52] dark:text-[#A3B18A]" />
              </div>
              <div>
                <p className={`text-xs font-semibold ${textMuted}`}>Total Meals Recorded</p>
                <p className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>{totalMyMeals}</p>
              </div>
              <div className="ml-auto text-right">
                <p className={`text-xs font-medium ${textMuted}`}>{myMeals.length} days recorded</p>
              </div>
            </div>

            <DataTable columns={columns} data={myMeals} loading={myMealsLoading} emptyMessage="No meal entries yet." />
          </motion.div>
        )}

        {/* ══════════════════ SUMMARY TAB ══════════════════ */}
        {tab === 'summary' && (
          <motion.div key="summary" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            {/* Month navigator */}
            <div className="flex items-center gap-3">
              <button onClick={prevMonth} className={`p-2 rounded-xl border transition-colors ${isDark ? 'border-[#394239] hover:bg-[#292F29] text-[#B1B8AC]' : 'border-[#DDE1D8] hover:bg-[#ECECE4] text-[#687168]'}`}><ChevronLeft className="w-4 h-4" /></button>
              <span className={`text-sm font-bold min-w-[110px] text-center ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>{MONTH_NAMES[summaryMonth - 1]} {summaryYear}</span>
              <button onClick={nextMonth} className={`p-2 rounded-xl border transition-colors ${isDark ? 'border-[#394239] hover:bg-[#292F29] text-[#B1B8AC]' : 'border-[#DDE1D8] hover:bg-[#ECECE4] text-[#687168]'}`}><ChevronRight className="w-4 h-4" /></button>
            </div>

            {summaryLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-pulse">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className={`h-24 rounded-2xl border ${cardBg}`} />)}
              </div>
            ) : monthlySummary ? (
              <>
                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <StatCard icon={UtensilsCrossed} label="Total Meals" isDark={isDark}
                    value={monthlySummary.totalMeals}
                    sub={`${monthlySummary.members?.reduce((s,m)=>s+m.totalLunch,0)||0}L + ${monthlySummary.members?.reduce((s,m)=>s+m.totalDinner,0)||0}D`}
                    iconColor="bg-[#E8EDE3] dark:bg-[#303A30] text-[#526B52] dark:text-[#A3B18A]" />
                  <StatCard icon={TrendingDown} label="Total Expenses" isDark={isDark}
                    value={`৳${(monthlySummary.totalExpense||0).toFixed(2)}`}
                    sub={`Grocery cost: ৳${(monthlySummary.groceryTotal||0).toFixed(2)}`}
                    iconColor="bg-rose-500/10 text-rose-600 dark:text-rose-400" />
                  <StatCard icon={BarChart3} label="Meal Rate" isDark={isDark}
                    value={`৳${(monthlySummary.mealRate||0).toFixed(2)}`}
                    sub="per meal (grocery cost ÷ total meals)"
                    iconColor="bg-[#E8EDE3] dark:bg-[#303A30] text-[#526B52] dark:text-[#A3B18A]" />
                  <StatCard icon={Wallet} label="Members" isDark={isDark}
                    value={monthlySummary.members?.length || 0}
                    sub="active this month"
                    iconColor="bg-[#ECECE4] dark:bg-[#292F29] text-[#687168] dark:text-[#B1B8AC]" />
                </div>

                {/* Per-member breakdown table */}
                <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
                  <div className={`px-5 py-3.5 border-b ${isDark ? 'border-[#394239]' : 'border-[#DDE1D8]'}`}>
                    <p className={`text-xs font-bold uppercase tracking-wider ${textMuted}`}>Member Meal Breakdown — {MONTH_NAMES[summaryMonth-1]} {summaryYear}</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`text-xs uppercase tracking-wider font-bold ${textMuted} ${isDark ? 'border-[#394239] bg-[#292F29]' : 'border-[#DDE1D8] bg-[#ECECE4]/60'} border-b`}>
                          <th className="px-5 py-3 text-left">Member</th>
                          <th className="px-3 py-3 text-center">Lunch</th>
                          <th className="px-3 py-3 text-center">Dinner</th>
                          <th className="px-3 py-3 text-center">Total Meals</th>
                          <th className="px-3 py-3 text-right">Meal Cost</th>
                          <th className="px-3 py-3 text-right">Common Cost</th>
                          <th className="px-3 py-3 text-right">Total Cost</th>
                          <th className="px-3 py-3 text-right">Paid</th>
                          <th className="px-3 py-3 text-right">After Deduction</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDark ? 'divide-[#394239]' : 'divide-[#DDE1D8]'}`}>
                        {(monthlySummary.members || []).map((m) => (
                          <tr key={m.memberId} className={`transition-colors ${isDark ? 'hover:bg-[#292F29]/60' : 'hover:bg-[#F5F4EE]'}`}>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2.5">
                                {m.photoURL
                                  ? <img src={m.photoURL} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                                  : <div className="w-8 h-8 rounded-full bg-[#526B52] dark:bg-[#A3B18A] flex items-center justify-center text-white dark:text-[#171C18] text-xs font-bold flex-shrink-0">{getInitials(m.name)}</div>}
                                <div>
                                  <p className={`text-sm font-semibold ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>{m.name}</p>
                                  {m.roomNumber && <p className={`text-xs ${textMuted}`}>Room {m.roomNumber}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3.5 text-center"><span className="text-sm font-semibold text-amber-500 tabular-nums">{m.totalLunch}</span></td>
                            <td className="px-3 py-3.5 text-center"><span className="text-sm font-semibold text-[#526B52] dark:text-[#A3B18A] tabular-nums">{m.totalDinner}</span></td>
                            <td className="px-3 py-3.5 text-center"><span className={`text-sm font-bold tabular-nums ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>{m.totalMeals}</span></td>
                            <td className="px-3 py-3.5 text-right"><span className="text-sm font-semibold text-rose-500 dark:text-rose-400 tabular-nums">৳{m.mealCost.toFixed(2)}</span></td>
                            <td className="px-3 py-3.5 text-right"><span className="text-sm font-semibold text-[#0D9488] dark:text-[#2DD4BF] tabular-nums">৳{(m.commonCostPerMember||0).toFixed(2)}</span></td>
                            <td className="px-3 py-3.5 text-right"><span className="text-sm font-bold text-amber-600 dark:text-amber-400 tabular-nums">৳{(m.totalCost||m.mealCost).toFixed(2)}</span></td>
                            <td className="px-3 py-3.5 text-right"><span className={`text-sm font-medium tabular-nums ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>৳{m.paidAmount.toFixed(2)}</span></td>
                            <td className="px-3 py-3.5 text-right"><BalanceBadge amount={m.afterMeal} /></td>
                          </tr>
                        ))}
                        {(monthlySummary.members || []).length === 0 && (
                          <tr><td colSpan={9} className={`text-center py-12 text-sm ${textMuted}`}>No meal data for this month.</td></tr>
                        )}
                      </tbody>
                      {(monthlySummary.members || []).length > 0 && (
                        <tfoot>
                          <tr className={`border-t font-bold ${isDark ? 'border-[#394239] bg-[#292F29]' : 'border-[#DDE1D8] bg-[#ECECE4]/60'}`}>
                            <td className={`px-5 py-3 text-xs uppercase tracking-wider ${textMuted}`}>Totals</td>
                            <td className="px-3 py-3 text-center text-sm text-amber-500">{monthlySummary.members.reduce((s,m)=>s+m.totalLunch,0)}</td>
                            <td className="px-3 py-3 text-center text-sm text-[#526B52] dark:text-[#A3B18A]">{monthlySummary.members.reduce((s,m)=>s+m.totalDinner,0)}</td>
                            <td className={`px-3 py-3 text-center text-sm ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>{monthlySummary.totalMeals}</td>
                            <td className="px-3 py-3 text-right text-sm text-rose-500 dark:text-rose-400">৳{(monthlySummary.groceryTotal || 0).toFixed(2)}</td>
                            <td className="px-3 py-3 text-right text-sm text-[#0D9488] dark:text-[#2DD4BF]">৳{(monthlySummary.commonTotal || 0).toFixed(2)}</td>
                            <td className="px-3 py-3 text-right text-sm text-amber-600 dark:text-amber-400">৳{(monthlySummary.totalExpense || 0).toFixed(2)}</td>
                            <td className={`px-3 py-3 text-right text-sm ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>৳{monthlySummary.members.reduce((s,m)=>s+m.paidAmount,0).toFixed(2)}</td>
                            <td className="px-3 py-3 text-right"><BalanceBadge amount={monthlySummary.members.reduce((s,m)=>s+m.paidAmount,0) - (monthlySummary.totalExpense||0)} /></td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className={`text-center py-16 rounded-2xl border ${cardBg} ${textMuted}`}>
                <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#526B52] dark:text-[#A3B18A]" />
                <p className="text-sm font-medium">No data available for {MONTH_NAMES[summaryMonth-1]} {summaryYear}.</p>
              </div>
            )}
          </motion.div>
        )}
        {/* ══════════════════ DETAILED BREAKDOWN TAB ══════════════════ */}
        {tab === 'breakdown' && (
          <motion.div key="breakdown" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            {/* Month navigator */}
            <div className="flex items-center gap-3">
              <button onClick={prevMonth} className={`p-2 rounded-xl border transition-colors ${isDark ? 'border-[#394239] hover:bg-[#292F29] text-[#B1B8AC]' : 'border-[#DDE1D8] hover:bg-[#ECECE4] text-[#687168]'}`}><ChevronLeft className="w-4 h-4" /></button>
              <span className={`text-sm font-bold min-w-[110px] text-center ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>{MONTH_NAMES[summaryMonth - 1]} {summaryYear}</span>
              <button onClick={nextMonth} className={`p-2 rounded-xl border transition-colors ${isDark ? 'border-[#394239] hover:bg-[#292F29] text-[#B1B8AC]' : 'border-[#DDE1D8] hover:bg-[#ECECE4] text-[#687168]'}`}><ChevronRight className="w-4 h-4" /></button>
            </div>

            {monthMealsLoading || summaryLoading ? (
              <div className={`h-96 rounded-2xl border ${cardBg} animate-pulse`} />
            ) : (
              <div className={`rounded-2xl border overflow-x-auto ${cardBg}`}>
                <div className={`px-5 py-3.5 border-b ${isDark ? 'border-[#394239]' : 'border-[#DDE1D8]'}`}>
                  <p className={`text-xs font-bold uppercase tracking-wider ${textMuted}`}>Daily Meal Breakdown — {MONTH_NAMES[summaryMonth-1]} {summaryYear}</p>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className={`text-[11px] uppercase tracking-wider font-bold ${textMuted} ${isDark ? 'border-[#394239] bg-[#292F29]' : 'border-[#DDE1D8] bg-[#ECECE4]/60'} border-b`}>
                      <th className="px-4 py-3 text-left sticky left-0 bg-inherit z-10">Date</th>
                      {(monthlySummary?.members || []).map(m => (
                        <th key={m.memberId} className="px-2 py-3 text-center min-w-[70px]">
                          <div className="flex flex-col items-center gap-1">
                            {m.photoURL
                              ? <img src={m.photoURL} alt="" className="w-6 h-6 rounded-full object-cover" />
                              : <div className="w-6 h-6 rounded-full bg-[#526B52] dark:bg-[#A3B18A] flex items-center justify-center text-white dark:text-[#171C18] text-[9px] font-bold">{getInitials(m.name)}</div>}
                            <span className="truncate w-full font-medium">{m.name.split(' ')[0]}</span>
                          </div>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-center bg-[#E8EDE3]/50 dark:bg-[#303A30]/50 text-[#526B52] dark:text-[#A3B18A]">Total</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-[#394239]' : 'divide-[#DDE1D8]'}`}>
                    {(() => {
                      const daysInMonth = new Date(summaryYear, summaryMonth, 0).getDate();
                      const rows = [];
                      const monthTotals = {};
                      let superTotal = 0;

                      for (let d = 1; d <= daysInMonth; d++) {
                        const dateStr = `${summaryYear}-${String(summaryMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                        const dayMeals = monthMeals.filter(m => m.date.startsWith(dateStr));

                        let dayTotal = 0;
                        const memberCells = (monthlySummary?.members || []).map(m => {
                          const meal = dayMeals.find(dm => (dm.memberId?._id || dm.memberId) === m.memberId);
                          const count = meal ? meal.mealCount : 0;
                          dayTotal += count;
                          monthTotals[m.memberId] = (monthTotals[m.memberId] || 0) + count;
                          return (
                            <td key={m.memberId} className="px-2 py-2.5 text-center">
                              {count > 0 ? (
                                <span className={`text-sm font-semibold tabular-nums ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>{count}</span>
                              ) : (
                                <span className={`text-sm ${isDark ? 'text-[#394239]' : 'text-[#DDE1D8]'}`}>-</span>
                              )}
                            </td>
                          );
                        });

                        superTotal += dayTotal;

                        rows.push(
                          <tr key={d} className={`transition-colors ${isDark ? 'hover:bg-[#292F29]/60' : 'hover:bg-[#F5F4EE]'}`}>
                            <td className={`px-4 py-2.5 text-sm font-semibold sticky left-0 ${isDark ? 'bg-[#202720] text-[#B1B8AC]' : 'bg-white text-[#687168]'}`}>
                              {d} {MONTH_NAMES[summaryMonth-1]}
                            </td>
                            {memberCells}
                            <td className="px-4 py-2.5 text-center bg-[#E8EDE3]/30 dark:bg-[#303A30]/30">
                              <span className="text-sm font-bold text-[#526B52] dark:text-[#A3B18A] tabular-nums">{dayTotal}</span>
                            </td>
                          </tr>
                        );
                      }

                      // Totals footer row
                      rows.push(
                        <tr key="totals" className={`border-t-2 font-bold ${isDark ? 'border-[#394239] bg-[#292F29]' : 'border-[#DDE1D8] bg-[#ECECE4]/60'}`}>
                          <td className={`px-4 py-3 text-xs uppercase tracking-wider sticky left-0 ${isDark ? 'bg-[#202720] text-[#B1B8AC]' : 'bg-white text-[#687168]'}`}>Totals</td>
                          {(monthlySummary?.members || []).map(m => (
                            <td key={m.memberId} className={`px-2 py-3 text-center text-sm tabular-nums ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>
                              {monthTotals[m.memberId] || 0}
                            </td>
                          ))}
                          <td className="px-4 py-3 text-center bg-[#E8EDE3]/60 dark:bg-[#303A30]/60">
                            <span className="text-sm font-extrabold text-[#526B52] dark:text-[#A3B18A] tabular-nums">{superTotal}</span>
                          </td>
                        </tr>
                      );

                      return rows;
                    })()}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
