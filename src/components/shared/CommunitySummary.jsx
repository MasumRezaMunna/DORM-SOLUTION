import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UtensilsCrossed, BarChart3, TrendingDown, Wallet, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { getInitials } from '../../utils/helpers';
import api from '../../config/axios';

function MiniStatCard({ icon: Icon, label, value, sub, iconColor, isDark }) {
  return (
    <div className={`rounded-2xl border p-4 flex items-start gap-3 ${isDark ? 'bg-[#202720] border-[#394239]' : 'bg-white border-[#DDE1D8] shadow-sm'}`}>
      <div className={`p-2.5 rounded-xl ${iconColor} flex-shrink-0`}><Icon className="w-4 h-4" /></div>
      <div>
        <p className={`text-xs uppercase font-bold tracking-wider mb-0.5 ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>{label}</p>
        <p className={`text-xl font-extrabold tabular-nums tracking-tight ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>{value}</p>
        {sub && <p className={`text-xs mt-0.5 font-medium ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>{sub}</p>}
      </div>
    </div>
  );
}

function BalanceBadge({ amount }) {
  if (amount > 0) return <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] dark:bg-[#14532D]/40 dark:text-[#86EFAC] font-bold tabular-nums">+৳{amount.toFixed(2)}</span>;
  if (amount < 0) return <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FEE2E2] text-[#991B1B] dark:bg-[#7F1D1D]/40 dark:text-[#FCA5A5] font-bold tabular-nums">-৳{Math.abs(amount).toFixed(2)}</span>;
  return <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#ECECE4] text-[#687168] dark:bg-[#292F29] dark:text-[#B1B8AC] font-semibold">৳0</span>;
}

export default function CommunitySummary() {
  const { isDark } = useTheme();
  
  const now = new Date();
  const [summaryMonth, setSummaryMonth] = useState(now.getMonth() + 1);
  const [summaryYear,  setSummaryYear]  = useState(now.getFullYear());

  const cardBg = isDark ? 'bg-[#202720] border-[#394239]' : 'bg-white border-[#DDE1D8] shadow-sm';
  const textMuted = isDark ? 'text-[#B1B8AC]' : 'text-[#687168]';

  const { data: monthlySummary, isLoading } = useQuery({
    queryKey: ['mealMonthlyDetail', summaryMonth, summaryYear],
    queryFn: async () => {
      const { data } = await api.get(`/meals/monthly-detail?month=${summaryMonth}&year=${summaryYear}`);
      return data.data;
    },
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

  return (
    <div className="space-y-5 mt-8 pt-8 border-t border-[#DDE1D8] dark:border-[#394239]">
      
      {/* Header and Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>Community Summary</h2>
          <p className={`text-sm font-medium ${textMuted}`}>Full breakdown of meals, costs, and balances</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className={`p-2 rounded-xl border transition-colors ${isDark ? 'border-[#394239] hover:bg-[#292F29] text-[#B1B8AC]' : 'border-[#DDE1D8] hover:bg-[#ECECE4] text-[#687168]'}`}><ChevronLeft className="w-4 h-4" /></button>
          <span className={`text-sm font-bold min-w-[110px] text-center ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>{MONTH_NAMES[summaryMonth - 1]} {summaryYear}</span>
          <button onClick={nextMonth} className={`p-2 rounded-xl border transition-colors ${isDark ? 'border-[#394239] hover:bg-[#292F29] text-[#B1B8AC]' : 'border-[#DDE1D8] hover:bg-[#ECECE4] text-[#687168]'}`}><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className={`h-24 rounded-2xl border ${cardBg}`} />)}
        </div>
      ) : monthlySummary ? (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MiniStatCard icon={UtensilsCrossed} label="Total Meals" isDark={isDark}
              value={monthlySummary.totalMeals}
              sub={`${monthlySummary.members?.reduce((s,m)=>s+m.totalLunch,0)||0}L + ${monthlySummary.members?.reduce((s,m)=>s+m.totalDinner,0)||0}D`}
              iconColor="bg-[#E8EDE3] text-[#526B52] dark:bg-[#303A30] dark:text-[#A3B18A]" />
            <MiniStatCard icon={TrendingDown} label="Total Expenses" isDark={isDark}
              value={`৳${(monthlySummary.totalExpense||0).toFixed(2)}`}
              sub={`Grocery cost: ৳${(monthlySummary.groceryTotal||0).toFixed(2)}`}
              iconColor="bg-[#FEE2E2] text-[#DC2626] dark:bg-[#7F1D1D]/30 dark:text-[#EF4444]" />
            <MiniStatCard icon={BarChart3} label="Meal Rate" isDark={isDark}
              value={`৳${(monthlySummary.mealRate||0).toFixed(2)}`}
              sub="per meal (grocery cost ÷ total meals)"
              iconColor="bg-[#E8EDE3] text-[#526B52] dark:bg-[#303A30] dark:text-[#A3B18A]" />
            <MiniStatCard icon={Wallet} label="Members" isDark={isDark}
              value={monthlySummary.members?.length || 0}
              sub="active this month"
              iconColor="bg-[#CCFBF1] text-[#0D9488] dark:bg-[#134E4A]/30 dark:text-[#2DD4BF]" />
          </div>

          {/* Per-member breakdown table */}
          <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
            <div className={`px-5 py-3.5 border-b ${isDark ? 'border-[#394239]' : 'border-[#DDE1D8]'}`}>
              <p className={`text-xs font-bold uppercase tracking-wider ${textMuted}`}>Member Meal Breakdown — {MONTH_NAMES[summaryMonth-1]} {summaryYear}</p>
            </div>
            <div className={`overflow-x-auto`}>
              <table className="w-full">
                <thead>
                  <tr className={`text-xs uppercase font-bold tracking-wider ${textMuted} ${isDark ? 'border-[#394239] bg-[#292F29]/60' : 'border-[#DDE1D8] bg-[#ECECE4]/40'} border-b`}>
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
                    <tr key={m.memberId} className={`transition-colors ${isDark ? 'hover:bg-[#292F29]/50' : 'hover:bg-[#ECECE4]/50'}`}>
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
                      <td className="px-3 py-3.5 text-center"><span className="text-sm font-semibold text-[#D97706] dark:text-[#F59E0B] tabular-nums">{m.totalLunch}</span></td>
                      <td className="px-3 py-3.5 text-center"><span className="text-sm font-semibold text-[#0D9488] dark:text-[#2DD4BF] tabular-nums">{m.totalDinner}</span></td>
                      <td className="px-3 py-3.5 text-center"><span className={`text-sm font-bold tabular-nums ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>{m.totalMeals}</span></td>
                      <td className="px-3 py-3.5 text-right"><span className="text-sm font-semibold text-[#DC2626] dark:text-[#EF4444] tabular-nums">৳{m.mealCost.toFixed(2)}</span></td>
                      <td className="px-3 py-3.5 text-right"><span className="text-sm font-semibold text-[#0D9488] dark:text-[#2DD4BF] tabular-nums">৳{(m.commonCostPerMember||0).toFixed(2)}</span></td>
                      <td className="px-3 py-3.5 text-right"><span className="text-sm font-bold text-[#D97706] dark:text-[#F59E0B] tabular-nums">৳{(m.totalCost||m.mealCost).toFixed(2)}</span></td>
                      <td className="px-3 py-3.5 text-right"><span className={`text-sm font-medium tabular-nums ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>৳{m.paidAmount.toFixed(2)}</span></td>
                      <td className="px-3 py-3.5 text-right"><BalanceBadge amount={m.afterMeal} /></td>
                    </tr>
                  ))}
                  {(monthlySummary.members || []).length === 0 && (
                    <tr><td colSpan={9} className={`text-center py-12 text-sm font-medium ${textMuted}`}>No meal data for this month.</td></tr>
                  )}
                </tbody>
                {(monthlySummary.members || []).length > 0 && (
                  <tfoot>
                    <tr className={`border-t font-semibold ${isDark ? 'border-[#394239] bg-[#292F29]/60' : 'border-[#DDE1D8] bg-[#ECECE4]/50'}`}>
                      <td className={`px-5 py-3 text-xs uppercase font-bold tracking-wider ${textMuted}`}>Totals</td>
                      <td className="px-3 py-3 text-center text-sm font-bold text-[#D97706] dark:text-[#F59E0B]">{monthlySummary.members.reduce((s,m)=>s+m.totalLunch,0)}</td>
                      <td className="px-3 py-3 text-center text-sm font-bold text-[#0D9488] dark:text-[#2DD4BF]">{monthlySummary.members.reduce((s,m)=>s+m.totalDinner,0)}</td>
                      <td className={`px-3 py-3 text-center text-sm font-extrabold ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>{monthlySummary.totalMeals}</td>
                      <td className="px-3 py-3 text-right text-sm font-bold text-[#DC2626] dark:text-[#EF4444]">৳{(monthlySummary.groceryTotal || 0).toFixed(2)}</td>
                      <td className="px-3 py-3 text-right text-sm font-bold text-[#0D9488] dark:text-[#2DD4BF]">৳{(monthlySummary.commonTotal || 0).toFixed(2)}</td>
                      <td className="px-3 py-3 text-right text-sm font-bold text-[#D97706] dark:text-[#F59E0B]">৳{(monthlySummary.totalExpense || 0).toFixed(2)}</td>
                      <td className={`px-3 py-3 text-right text-sm font-bold ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>৳{monthlySummary.members.reduce((s,m)=>s+m.paidAmount,0).toFixed(2)}</td>
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
          <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium">No data available for {MONTH_NAMES[summaryMonth-1]} {summaryYear}.</p>
        </div>
      )}
    </div>
  );
}
