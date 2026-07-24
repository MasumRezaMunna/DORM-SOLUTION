import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Calendar, UtensilsCrossed, Sun, Moon, Users,
  Minus, Plus, BarChart3, TrendingDown, Wallet, ChevronLeft, ChevronRight, Table,
} from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import { useTheme } from '../../contexts/ThemeContext';
import { formatDate, getInitials } from '../../utils/helpers';
import api from '../../config/axios';
import { QUERY_KEYS } from '../../utils/constants';
import toast from 'react-hot-toast';
import { triggerConfetti } from '../../utils/confetti';

/* ─── Meal +/- Counter ──────────────────────────────────────────────── */
function MealCounter({ value, onChange, label, icon: Icon, color, disabled }) {
  const styles = {
    amber:  { badge: 'bg-amber-500/15 border-amber-500/40',  text: 'text-amber-300',  btn: 'hover:bg-amber-500/20 text-amber-400' },
    indigo: { badge: 'bg-indigo-500/15 border-indigo-500/40', text: 'text-indigo-300', btn: 'hover:bg-indigo-500/20 text-indigo-400' },
  }[color];

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider ${value > 0 ? styles.text : 'text-slate-600'}`}>
        <Icon className="w-3 h-3" /><span>{label}</span>
      </div>
      <div className={`flex items-center gap-1 px-1.5 py-1 rounded-xl border ${styles.badge} ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))}
          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${styles.btn}`}>
          <Minus className="w-3 h-3" />
        </button>
        <span className="w-5 text-center text-sm font-bold tabular-nums">{value}</span>
        <button type="button" onClick={() => onChange(value + 1)}
          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${styles.btn}`}>
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

/* ─── Stat Card ─────────────────────────────────────────────────────── */
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

/* ─── Balance chip ──────────────────────────────────────────────────── */
function BalanceBadge({ amount }) {
  if (amount > 0) return <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold tabular-nums">+৳{amount.toFixed(0)}</span>;
  if (amount < 0) return <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-semibold tabular-nums">-৳{Math.abs(amount).toFixed(0)}</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-400 font-semibold">৳0</span>;
}

/* ═══════════════════════════════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════════════════════════════ */
export default function MealsPage() {
  const { isDark } = useTheme();
  const [tab, setTab] = useState('daily');

  // ── Daily tab state ──
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealData, setMealData]         = useState({});   // { [memberId]: { lunch, dinner } }
  const [initialised, setInitialised]   = useState('');   // tracks which date was last loaded

  // ── Summary tab state ──
  const now = new Date();
  const [summaryMonth, setSummaryMonth] = useState(now.getMonth() + 1);
  const [summaryYear,  setSummaryYear]  = useState(now.getFullYear());

  const cardBg    = isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200 shadow-sm';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';

  /* ── Members list ─────────────────────────────────────────────────── */
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: QUERY_KEYS.MEMBERS,
    queryFn: async () => {
      const { data } = await api.get('/members');
      return (data.data || []).filter(m => m.status === 'active');
    },
    placeholderData: [],
  });

  /* ── Load existing entries for the selected date ───────────────────── */
  const { data: existingEntries = [], isFetching: entriesFetching } = useQuery({
    queryKey: ['mealEntries', selectedDate],
    queryFn: async () => {
      const { data } = await api.get(`/meals?date=${selectedDate}&limit=200`);
      return data.data || [];
    },
    enabled: tab === 'daily',
    staleTime: 0,
  });

  // Hydrate mealData whenever the existing entries change (date switches)
  useEffect(() => {
    if (entriesFetching) return;
    if (initialised === selectedDate) return;
    const hydrated = {};
    existingEntries.forEach(entry => {
      const mid = entry.memberId?._id?.toString() || entry.memberId?.toString();
      if (mid) hydrated[mid] = { lunch: entry.lunch ?? 0, dinner: entry.dinner ?? 0 };
    });
    setMealData(hydrated);
    setInitialised(selectedDate);
  }, [existingEntries, entriesFetching, selectedDate]);

  // Reset initialised flag when date changes so we reload
  useEffect(() => { setInitialised(''); }, [selectedDate]);

  /* ── Save bulk entries ──────────────────────────────────────────────── */
  const saveMutation = useMutation({
    mutationFn: async () => {
      const entries = members.map(member => ({
        member: member._id,
        date:   selectedDate,
        lunch:  getMeal(member._id, 'lunch'),
        dinner: getMeal(member._id, 'dinner'),
      }));
      await api.post('/meals/bulk', { entries });
    },
    onSuccess: () => {
      toast.success('Meal entries saved!');
      triggerConfetti('meal');
      setInitialised(selectedDate); // prevent re-hydration overwriting fresh data
    },
    onError: () => toast.error('Failed to save meal entries.'),
  });

  const getMeal = (id, field) => mealData[id]?.[field] ?? 1;

  const setMeal = (id, field, val) =>
    setMealData(prev => ({
      ...prev,
      [id]: { lunch: getMeal(id, 'lunch'), dinner: getMeal(id, 'dinner'), [field]: val },
    }));

  const setAll = (field, val) =>
    setMealData(prev => {
      const next = { ...prev };
      members.forEach(m => {
        next[m._id] = { lunch: getMeal(m._id, 'lunch'), dinner: getMeal(m._id, 'dinner'), [field]: val };
      });
      return next;
    });

  const totalLunch  = members.reduce((s, m) => s + getMeal(m._id, 'lunch'),  0);
  const totalDinner = members.reduce((s, m) => s + getMeal(m._id, 'dinner'), 0);

  /* ── Monthly summary ────────────────────────────────────────────────── */
  const { data: monthlySummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['mealMonthlyDetail', summaryMonth, summaryYear],
    queryFn: async () => {
      const { data } = await api.get(`/meals/monthly-detail?month=${summaryMonth}&year=${summaryYear}`);
      return data.data;
    },
    enabled: tab === 'summary' || tab === 'breakdown',
    staleTime: 30_000,
  });

  /* ── Detailed breakdown ─────────────────────────────────────────────── */
  const { data: monthMeals = [], isLoading: monthMealsLoading } = useQuery({
    queryKey: ['mealEntriesMonth', summaryMonth, summaryYear],
    queryFn: async () => {
      const { data } = await api.get(`/meals?month=${summaryMonth}&year=${summaryYear}&limit=2000`);
      return data.data || [];
    },
    enabled: tab === 'breakdown',
    staleTime: 30_000,
  });

  const prevMonth = () => {
    if (summaryMonth === 1) { setSummaryMonth(12); setSummaryYear(y => y - 1); }
    else setSummaryMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (summaryMonth === 12) { setSummaryMonth(1); setSummaryYear(y => y + 1); }
    else setSummaryMonth(m => m + 1);
  };

  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-5">
      <PageHeader
        title="Meal Management"
        subtitle="Record daily meals and track monthly financial breakdown"
        action={
          tab === 'daily' ? (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || entriesFetching}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold shadow-lg shadow-emerald-900/30 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saveMutation.isPending ? 'Saving...' : 'Save Entries'}
            </motion.button>
          ) : null
        }
      />

      {/* Tab switcher */}
      <div className={`inline-flex items-center gap-1 p-1 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
        {[
          { key: 'daily',   icon: Calendar,  label: 'Daily Entry' },
          { key: 'summary', icon: BarChart3,  label: 'Monthly Summary' },
          { key: 'breakdown', icon: Table, label: 'Detailed Breakdown' },
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
        {/* ══════════════════ DAILY TAB ══════════════════ */}
        {tab === 'daily' && (
          <motion.div key="daily" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

            {/* Date + totals bar */}
            <div className="flex flex-wrap gap-3">
              <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${cardBg}`}>
                <Calendar className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <input type="date" value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className={`bg-transparent text-sm outline-none ${isDark ? 'text-white' : 'text-slate-800'}`} />
              </div>
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${cardBg}`}>
                <Sun className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className={`text-sm ${textMuted}`}>Lunch: <strong className={isDark ? 'text-white' : 'text-slate-800'}>{totalLunch}</strong></span>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${cardBg}`}>
                <Moon className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span className={`text-sm ${textMuted}`}>Dinner: <strong className={isDark ? 'text-white' : 'text-slate-800'}>{totalDinner}</strong></span>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${cardBg}`}>
                <UtensilsCrossed className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className={`text-sm ${textMuted}`}>Total: <strong className={isDark ? 'text-white' : 'text-slate-800'}>{totalLunch + totalDinner}</strong></span>
              </div>
              {entriesFetching && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${cardBg} ${textMuted} text-xs`}>
                  Loading saved…
                </div>
              )}
            </div>

            {/* Member list */}
            <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
              {/* Header row */}
              <div className={`px-5 py-3.5 border-b flex flex-wrap items-center justify-between gap-2 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <p className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>{formatDate(selectedDate)}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-xs ${textMuted}`}>Lunch:</span>
                  <button onClick={() => setAll('lunch', 1)} className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-colors font-medium">1 each</button>
                  <button onClick={() => setAll('lunch', 0)} className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-slate-500 border border-white/10 hover:bg-white/10 transition-colors font-medium">0 each</button>
                  <span className={`text-xs ${textMuted} ml-2`}>Dinner:</span>
                  <button onClick={() => setAll('dinner', 1)} className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/25 transition-colors font-medium">1 each</button>
                  <button onClick={() => setAll('dinner', 0)} className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-slate-500 border border-white/10 hover:bg-white/10 transition-colors font-medium">0 each</button>
                </div>
              </div>

              <div className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                {membersLoading || entriesFetching
                  ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-4 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                        <div className={`h-4 w-32 rounded ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                      </div>
                      <div className="flex gap-3">
                        <div className={`w-24 h-12 rounded-xl ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                        <div className={`w-24 h-12 rounded-xl ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                      </div>
                    </div>
                  ))
                  : members.length === 0
                    ? <div className={`text-center py-16 ${textMuted}`}><Users className="w-8 h-8 mx-auto mb-2 opacity-40" /><p className="text-sm">No active members.</p></div>
                    : members.map((member, i) => {
                      const lunch  = getMeal(member._id, 'lunch');
                      const dinner = getMeal(member._id, 'dinner');
                      const total  = lunch + dinner;
                      return (
                        <motion.div key={member._id}
                          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                          className={`flex items-center justify-between px-5 py-3.5 transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}>
                          {/* Avatar */}
                          <div className="flex items-center gap-3 min-w-0">
                            {member.userId?.photoURL
                              ? <img src={member.userId.photoURL} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                              : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{getInitials(member.userId?.displayName || 'U')}</div>}
                            <div className="min-w-0">
                              <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{member.userId?.displayName || 'Unknown'}</p>
                              <p className={`text-xs ${textMuted}`}>Room {member.roomId?.roomNumber || '—'}</p>
                            </div>
                          </div>
                          {/* Counters */}
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <MealCounter value={lunch}  onChange={v => setMeal(member._id, 'lunch',  v)} label="Lunch"  icon={Sun}  color="amber" />
                            <MealCounter value={dinner} onChange={v => setMeal(member._id, 'dinner', v)} label="Dinner" icon={Moon} color="indigo" />
                            <div className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center text-xs font-bold leading-tight ${
                              total === 0 ? 'bg-red-500/15 text-red-400' : total <= 2 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-purple-500/15 text-purple-400'
                            }`}>
                              <span className="text-sm font-bold">{total}</span>
                              <span className="text-[9px] opacity-70">total</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                }
              </div>
            </div>
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
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={`h-24 rounded-2xl border ${cardBg}`} />
                ))}
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
                    sub="per meal (grocery cost ÷ total meals)"
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
                          <th className="px-3 py-3 text-right font-medium">Common Cost</th>
                          <th className="px-3 py-3 text-right font-medium">Total Cost</th>
                          <th className="px-3 py-3 text-right font-medium">Paid</th>
                          <th className="px-3 py-3 text-right font-medium">After Deduction</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                        {(monthlySummary.members || []).map((m, i) => (
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
                            <td className="px-3 py-3.5 text-center">
                              <span className="text-sm font-semibold text-amber-400 tabular-nums">{m.totalLunch}</span>
                            </td>
                            <td className="px-3 py-3.5 text-center">
                              <span className="text-sm font-semibold text-indigo-400 tabular-nums">{m.totalDinner}</span>
                            </td>
                            <td className="px-3 py-3.5 text-center">
                              <span className={`text-sm font-bold tabular-nums ${isDark ? 'text-white' : 'text-slate-800'}`}>{m.totalMeals}</span>
                            </td>
                            <td className="px-3 py-3.5 text-right">
                              <span className="text-sm font-semibold text-red-400 tabular-nums">৳{m.mealCost.toFixed(0)}</span>
                            </td>
                            <td className="px-3 py-3.5 text-right">
                              <span className="text-sm font-semibold text-blue-400 tabular-nums">৳{(m.commonCostPerMember||0).toFixed(0)}</span>
                            </td>
                            <td className="px-3 py-3.5 text-right">
                              <span className="text-sm font-bold text-orange-400 tabular-nums">৳{(m.totalCost||m.mealCost).toFixed(0)}</span>
                            </td>
                            <td className="px-3 py-3.5 text-right">
                              <span className={`text-sm tabular-nums ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>৳{m.paidAmount.toFixed(0)}</span>
                            </td>
                            <td className="px-3 py-3.5 text-right">
                              <BalanceBadge amount={m.afterMeal} />
                            </td>
                          </tr>
                        ))}
                        {(monthlySummary.members || []).length === 0 && (
                          <tr><td colSpan={7} className={`text-center py-12 text-sm ${textMuted}`}>No meal data for this month.</td></tr>
                        )}
                      </tbody>
                      {/* Totals footer */}
                      {(monthlySummary.members || []).length > 0 && (
                        <tfoot>
                          <tr className={`border-t font-semibold ${isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'}`}>
                          <td className={`px-5 py-3 text-xs uppercase tracking-wider ${textMuted}`}>Totals</td>
                          <td className="px-3 py-3 text-center text-sm text-amber-400">{monthlySummary.members.reduce((s,m)=>s+m.totalLunch,0)}</td>
                          <td className="px-3 py-3 text-center text-sm text-indigo-400">{monthlySummary.members.reduce((s,m)=>s+m.totalDinner,0)}</td>
                          <td className={`px-3 py-3 text-center text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{monthlySummary.totalMeals}</td>
                          <td className="px-3 py-3 text-right text-sm text-red-400">৳{monthlySummary.members.reduce((s,m)=>s+m.mealCost,0).toFixed(0)}</td>
                            <td className="px-3 py-3 text-right text-sm text-blue-400">৳{(monthlySummary.commonCostPerMember||0).toFixed(0)}<span className="text-xs text-slate-500 ml-1">/each</span></td>
                            <td className="px-3 py-3 text-right text-sm text-orange-400">৳{(monthlySummary.totalExpense||0).toFixed(0)}</td>
                            <td className={`px-3 py-3 text-right text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>৳{monthlySummary.members.reduce((s,m)=>s+m.paidAmount,0).toFixed(0)}</td>
                            <td className="px-3 py-3 text-right">
                              <BalanceBadge amount={monthlySummary.members.reduce((s,m)=>s+m.paidAmount,0) - (monthlySummary.totalExpense||0)} />
                            </td>
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

        {/* ══════════════════ DETAILED BREAKDOWN TAB ══════════════════ */}
        {tab === 'breakdown' && (
          <motion.div key="breakdown" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            {/* Month navigator */}
            <div className="flex items-center gap-3">
              <button onClick={prevMonth} className={`p-2 rounded-xl border transition-colors ${isDark ? 'border-white/10 hover:bg-white/5 text-slate-400' : 'border-slate-200 hover:bg-slate-50 text-slate-500'}`}><ChevronLeft className="w-4 h-4" /></button>
              <span className={`text-sm font-semibold min-w-[110px] text-center ${isDark ? 'text-white' : 'text-slate-800'}`}>{MONTH_NAMES[summaryMonth - 1]} {summaryYear}</span>
              <button onClick={nextMonth} className={`p-2 rounded-xl border transition-colors ${isDark ? 'border-white/10 hover:bg-white/5 text-slate-400' : 'border-slate-200 hover:bg-slate-50 text-slate-500'}`}><ChevronRight className="w-4 h-4" /></button>
            </div>

            {monthMealsLoading || summaryLoading ? (
              <div className={`h-96 rounded-2xl border ${cardBg} animate-pulse`} />
            ) : (
              <div className={`rounded-2xl border overflow-x-auto ${cardBg}`}>
                <div className={`px-5 py-3.5 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  <p className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>Daily Meal Breakdown — {MONTH_NAMES[summaryMonth-1]} {summaryYear}</p>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className={`text-[11px] uppercase tracking-wider ${textMuted} ${isDark ? 'border-white/5' : 'border-slate-100'} border-b`}>
                      <th className="px-4 py-3 text-left font-medium sticky left-0 bg-inherit z-10">Date</th>
                      {(monthlySummary?.members || []).map(m => (
                        <th key={m.memberId} className="px-2 py-3 text-center font-medium min-w-[70px]">
                          <div className="flex flex-col items-center gap-1">
                            {m.photoURL
                              ? <img src={m.photoURL} alt="" className="w-6 h-6 rounded-full object-cover" />
                              : <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-[9px] font-bold">{getInitials(m.name)}</div>}
                            <span className="truncate w-full">{m.name.split(' ')[0]}</span>
                          </div>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-center font-medium bg-emerald-500/5 text-emerald-600 dark:text-emerald-400">Total</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
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
                                <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{count}</span>
                              ) : (
                                <span className={`text-sm ${isDark ? 'text-slate-700' : 'text-slate-200'}`}>-</span>
                              )}
                            </td>
                          );
                        });
                        
                        superTotal += dayTotal;

                        // Only show rows up to today if it's the current month, but user might want to see whole month.
                        // Let's just show all days of the month.
                        rows.push(
                          <tr key={d} className={`transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}>
                            <td className={`px-4 py-2.5 text-sm font-medium sticky left-0 ${isDark ? 'bg-slate-900 text-slate-300' : 'bg-white text-slate-600'}`}>
                              {d} {MONTH_NAMES[summaryMonth-1]}
                            </td>
                            {memberCells}
                            <td className="px-4 py-2.5 text-center bg-emerald-500/5">
                              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{dayTotal}</span>
                            </td>
                          </tr>
                        );
                      }
                      
                      // Push footer for totals
                      rows.push(
                        <tr key="totals" className={`border-t-2 font-bold ${isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'}`}>
                          <td className={`px-4 py-3 text-xs uppercase tracking-wider sticky left-0 ${isDark ? 'bg-slate-900 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>Totals</td>
                          {(monthlySummary?.members || []).map(m => (
                            <td key={m.memberId} className={`px-2 py-3 text-center text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
                              {monthTotals[m.memberId] || 0}
                            </td>
                          ))}
                          <td className="px-4 py-3 text-center bg-emerald-500/10">
                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{superTotal}</span>
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
