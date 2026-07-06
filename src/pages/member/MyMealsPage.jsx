import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, BarChart3, TrendingDown, Wallet, ChevronLeft, ChevronRight } from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import { useTheme } from '../../contexts/ThemeContext';
import { formatDate, getInitials } from '../../utils/helpers';
import api from '../../config/axios';

function StatCard({ icon: Icon, label, value, sub, iconColor, isDark }) {
  return (
    <div className={`rounded-2xl border p-4 flex items-start gap-3 ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
      <div className={`p-2.5 rounded-xl ${iconColor} flex-shrink-0`}><Icon className="w-4 h-4" /></div>
      <div>
        <p className={`text-xs font-medium mb-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
        <p className={`text-xl font-bold tabular-nums ${isDark ? 'text-white' : 'text-slate-800'}`}>{value}</p>
        {sub && <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{sub}</p>}
      </div>
    </div>
  );
}

function BalanceBadge({ amount }) {
  if (amount > 0) return <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold tabular-nums">+৳{amount.toFixed(0)}</span>;
  if (amount < 0) return <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-semibold tabular-nums">-৳{Math.abs(amount).toFixed(0)}</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-400 font-semibold">৳0</span>;
}

export default function MyMealsPage() {
  const { isDark } = useTheme();
  const [tab, setTab] = useState('my-meals');

  const now = new Date();
  const [summaryMonth, setSummaryMonth] = useState(now.getMonth() + 1);
  const [summaryYear,  setSummaryYear]  = useState(now.getFullYear());

  const cardBg = isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200 shadow-sm';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';

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
    enabled: tab === 'summary',
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
    { key: 'date', label: 'Date', render: (row) => <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{formatDate(row.date)}</span> },
    { key: 'mealCount', label: 'Meals', render: (row) => (
        <div className="flex items-center gap-1.5">
          <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" />
          <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{row.mealCount}</span>
        </div>
      )
    },
    { key: 'note', label: 'Note', render: (row) => <span className={`text-xs ${textMuted}`}>{row.note || '—'}</span> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Meals" subtitle="Track your daily meals and view monthly summary" />

      {/* Tab switcher */}
      <div className={`inline-flex items-center gap-1 p-1 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
        {[
          { key: 'my-meals', icon: UtensilsCrossed, label: 'My Meals' },
          { key: 'summary', icon: BarChart3, label: 'Community Summary' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'
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
              <div className="p-2.5 rounded-xl bg-amber-500/10">
                <UtensilsCrossed className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className={`text-xs ${textMuted}`}>Total Meals Recorded</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{totalMyMeals}</p>
              </div>
              <div className="ml-auto text-right">
                <p className={`text-xs ${textMuted}`}>{myMeals.length} days recorded</p>
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
              <button onClick={prevMonth} className={`p-2 rounded-xl border transition-colors ${isDark ? 'border-white/10 hover:bg-white/5 text-slate-400' : 'border-slate-200 hover:bg-slate-50 text-slate-500'}`}><ChevronLeft className="w-4 h-4" /></button>
              <span className={`text-sm font-semibold min-w-[110px] text-center ${isDark ? 'text-white' : 'text-slate-800'}`}>{MONTH_NAMES[summaryMonth - 1]} {summaryYear}</span>
              <button onClick={nextMonth} className={`p-2 rounded-xl border transition-colors ${isDark ? 'border-white/10 hover:bg-white/5 text-slate-400' : 'border-slate-200 hover:bg-slate-50 text-slate-500'}`}><ChevronRight className="w-4 h-4" /></button>
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
                    iconColor="bg-emerald-500/15 text-emerald-400" />
                  <StatCard icon={TrendingDown} label="Total Expenses" isDark={isDark}
                    value={`৳${(monthlySummary.totalExpense||0).toFixed(0)}`}
                    sub={`Grocery cost: ৳${(monthlySummary.groceryTotal||0).toFixed(0)}`}
                    iconColor="bg-red-500/15 text-red-400" />
                  <StatCard icon={BarChart3} label="Meal Rate" isDark={isDark}
                    value={`৳${(monthlySummary.mealRate||0).toFixed(2)}`}
                    sub="per meal (total expenses ÷ meals)"
                    iconColor="bg-purple-500/15 text-purple-400" />
                  <StatCard icon={Wallet} label="Members" isDark={isDark}
                    value={monthlySummary.members?.length || 0}
                    sub="active this month"
                    iconColor="bg-blue-500/15 text-blue-400" />
                </div>

                {/* Per-member breakdown table */}
                <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
                  <div className={`px-5 py-3.5 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>Member Meal Breakdown — {MONTH_NAMES[summaryMonth-1]} {summaryYear}</p>
                  </div>
                  <div className={`overflow-x-auto`}>
                    <table className="w-full">
                      <thead>
                        <tr className={`text-xs uppercase tracking-wider ${textMuted} ${isDark ? 'border-white/5' : 'border-slate-100'} border-b`}>
                          <th className="px-5 py-3 text-left font-medium">Member</th>
                          <th className="px-3 py-3 text-center font-medium">Lunch</th>
                          <th className="px-3 py-3 text-center font-medium">Dinner</th>
                          <th className="px-3 py-3 text-center font-medium">Total Meals</th>
                          <th className="px-3 py-3 text-right font-medium">Meal Cost</th>
                          <th className="px-3 py-3 text-right font-medium">Paid</th>
                          <th className="px-3 py-3 text-right font-medium">After Deduction</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                        {(monthlySummary.members || []).map((m) => (
                          <tr key={m.memberId} className={`transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2.5">
                                {m.photoURL
                                  ? <img src={m.photoURL} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                                  : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{getInitials(m.name)}</div>}
                                <div>
                                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{m.name}</p>
                                  {m.roomNumber && <p className={`text-xs ${textMuted}`}>Room {m.roomNumber}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3.5 text-center"><span className="text-sm font-semibold text-amber-400 tabular-nums">{m.totalLunch}</span></td>
                            <td className="px-3 py-3.5 text-center"><span className="text-sm font-semibold text-indigo-400 tabular-nums">{m.totalDinner}</span></td>
                            <td className="px-3 py-3.5 text-center"><span className={`text-sm font-bold tabular-nums ${isDark ? 'text-white' : 'text-slate-800'}`}>{m.totalMeals}</span></td>
                            <td className="px-3 py-3.5 text-right"><span className="text-sm font-semibold text-red-400 tabular-nums">৳{m.mealCost.toFixed(0)}</span></td>
                            <td className="px-3 py-3.5 text-right"><span className={`text-sm tabular-nums ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>৳{m.paidAmount.toFixed(0)}</span></td>
                            <td className="px-3 py-3.5 text-right"><BalanceBadge amount={m.afterMeal} /></td>
                          </tr>
                        ))}
                        {(monthlySummary.members || []).length === 0 && (
                          <tr><td colSpan={7} className={`text-center py-12 text-sm ${textMuted}`}>No meal data for this month.</td></tr>
                        )}
                      </tbody>
                      {(monthlySummary.members || []).length > 0 && (
                        <tfoot>
                          <tr className={`border-t font-semibold ${isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'}`}>
                            <td className={`px-5 py-3 text-xs uppercase tracking-wider ${textMuted}`}>Totals</td>
                            <td className="px-3 py-3 text-center text-sm text-amber-400">{monthlySummary.members.reduce((s,m)=>s+m.totalLunch,0)}</td>
                            <td className="px-3 py-3 text-center text-sm text-indigo-400">{monthlySummary.members.reduce((s,m)=>s+m.totalDinner,0)}</td>
                            <td className={`px-3 py-3 text-center text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{monthlySummary.totalMeals}</td>
                            <td className="px-3 py-3 text-right text-sm text-red-400">৳{monthlySummary.members.reduce((s,m)=>s+m.mealCost,0).toFixed(0)}</td>
                            <td className={`px-3 py-3 text-right text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>৳{monthlySummary.members.reduce((s,m)=>s+m.paidAmount,0).toFixed(0)}</td>
                            <td className="px-3 py-3 text-right"><BalanceBadge amount={monthlySummary.members.reduce((s,m)=>s+m.afterMeal,0)} /></td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className={`text-center py-16 rounded-2xl border ${cardBg} ${textMuted}`}>
                <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No data available for {MONTH_NAMES[summaryMonth-1]} {summaryYear}.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
