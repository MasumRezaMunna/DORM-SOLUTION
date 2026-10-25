/**
 * QuickAccessPanel — Persistent right sidebar on xl+ screens.
 *
 * Contains:
 *  1. A NavLink to the Market Schedule page (routes differ for manager vs member).
 *  2. The WeeklyMealPlan component (data is already cached by React Query under
 *     queryKey: ['weeklyMealPlan'], so this renders without any extra network call).
 *
 * Hidden below xl breakpoint (< 1280 px).  Mobile/tablet access is handled by
 * the accordion buttons in MemberDashboard / ManagerDashboard.
 */
import { NavLink } from 'react-router-dom';
import { ShoppingCart, ChevronRight, CalendarDays } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import WeeklyMealPlan from '../shared/WeeklyMealPlan';
import { useMySchedules, useMarketStats } from '../../features/market/hooks/useMarketSchedules';
import { formatDate } from '../../utils/helpers';

// ─── Market quick-link card ────────────────────────────────────────────────────
function MarketLink({ isDark }) {
  const { isManager } = useAuth();
  const route = isManager ? '/manager/market' : '/dashboard/market';

  // Both hooks are always called (Rules of Hooks).
  // React Query deduplicates—if the dashboard already fetched these, there's no
  // second request. If not yet fetched, the appropriate one fires.
  const { data: myData,  isLoading: myLoading  } = useMySchedules();
  const { data: mgrData, isLoading: mgrLoading } = useMarketStats();

  const textMuted = isDark ? 'text-[#B1B8AC]' : 'text-[#687168]';

  let sub;
  if (isManager) {
    sub = mgrLoading ? '...' : `${mgrData?.upcoming ?? 0} upcoming · ${mgrData?.today ?? 0} today`;
  } else {
    const next = myData?.summary?.nextAssignedDate;
    sub = myLoading ? '...' : (next ? `Next: ${formatDate(next)}` : 'No duty scheduled');
  }

  return (
    <NavLink
      to={route}
      aria-label="Open Market Schedule"
      className={({ isActive }) =>
        `group flex items-center gap-3 px-3 py-3 rounded-xl border transition-all duration-200 ${
          isActive
            ? isDark
              ? 'bg-[#303A30] border-[#A3B18A]/50 text-[#A3B18A]'
              : 'bg-[#E8EDE3] border-[#526B52]/50 text-[#526B52]'
            : isDark
            ? 'bg-[#292F29]/50 border-[#394239] text-[#F0F1E9] hover:bg-[#292F29] hover:border-[#526B52]/60'
            : 'bg-white border-[#DDE1D8] text-[#202720] hover:bg-[#E8EDE3]/80 hover:border-[#526B52]/40 shadow-sm'
        }`
      }
    >
      {/* Icon badge */}
      <span className={`p-2 rounded-lg flex-shrink-0 transition-colors ${
        isDark ? 'bg-[#303A30] text-[#A3B18A]' : 'bg-[#E8EDE3] text-[#526B52]'
      }`}>
        <ShoppingCart className="w-4 h-4" />
      </span>

      {/* Label + sub-text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-snug">Market Schedule</p>
        <p className={`text-[11px] mt-0.5 truncate font-medium ${textMuted}`}>{sub}</p>
      </div>

      {/* Arrow — appears on hover/active */}
      <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-50 transition-opacity ${textMuted}`} />
    </NavLink>
  );
}

// ─── Panel shell ───────────────────────────────────────────────────────────────
export default function QuickAccessPanel() {
  const { isDark } = useTheme();
  const { isManager } = useAuth();

  const panelBg    = isDark ? 'bg-[#202720] border-[#394239]' : 'bg-[#FDFCFA] border-[#DDE1D8]';
  const headerBord = isDark ? 'border-[#394239]' : 'border-[#DDE1D8]';
  const divCol     = isDark ? 'border-[#394239]' : 'border-[#DDE1D8]';
  const textMuted  = isDark ? 'text-[#B1B8AC]' : 'text-[#687168]';
  const textMain   = isDark ? 'text-[#F0F1E9]' : 'text-[#202720]';

  return (
    <aside
      aria-label="Quick Access Panel"
      className={`
        hidden xl:flex flex-col
        w-[260px] flex-shrink-0
        h-screen sticky top-0
        border-l overflow-hidden
        transition-colors duration-200
        ${panelBg}
      `}
    >
      {/* ── Header (height mirrors the top nav bar: 64px) ───────────────────── */}
      <div
        className={`flex items-center px-4 border-b flex-shrink-0 ${headerBord}`}
        style={{ minHeight: 64 }}
      >
        <p className={`text-[10px] font-black uppercase tracking-widest ${textMuted}`}>
          Quick Access
        </p>
      </div>

      {/* ── Scrollable body ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">

        {/* ── Market Schedule section ──────────────────────────────────────── */}
        <section aria-labelledby="qap-market-label">
          <p
            id="qap-market-label"
            className={`text-[10px] font-bold uppercase tracking-widest mb-2 px-1 ${textMuted}`}
          >
            Market Schedule
          </p>
          <MarketLink isDark={isDark} />
        </section>

        {/* Divider */}
        <div className={`border-t ${divCol}`} aria-hidden="true" />

        {/* ── Weekly Meal Plan section ─────────────────────────────────────── */}
        <section aria-labelledby="qap-meal-label">
          <div className="flex items-center gap-2 mb-2 px-1">
            <CalendarDays className={`w-3 h-3 flex-shrink-0 ${textMuted}`} />
            <p
              id="qap-meal-label"
              className={`text-[10px] font-bold uppercase tracking-widest ${textMuted}`}
            >
              Weekly Meal Plan
            </p>
          </div>
          {/* WeeklyMealPlan fetches via queryKey ['weeklyMealPlan'].
              React Query returns cached data instantly if already loaded by
              the main content — zero extra network calls.               */}
          <WeeklyMealPlan isManager={isManager} compact />
        </section>

      </div>
    </aside>
  );
}
