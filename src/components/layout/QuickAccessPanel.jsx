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
 *
 * Collapsed mode: panel shrinks to icon-only strip showing Market Schedule &
 * Meal Plan logos. A toggle button on the left edge expands / collapses.
 */
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ShoppingCart, ChevronRight, CalendarDays, PanelRightClose, PanelRightOpen } from 'lucide-react';
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
            ? 'bg-[#ff3cb4]/20 border-[#ff3cb4]/50 text-[#ff3cb4] shadow-[0_0_14px_rgba(255,60,180,0.3)]'
            : 'bg-white/5 border-white/10 text-[#F0F1E9] hover:bg-white/10 hover:border-[#ff3cb4]/30'
        }`
      }
    >
      {/* Icon badge */}
      <span className="p-2 rounded-lg flex-shrink-0 transition-colors bg-[#ff3cb4]/15 text-[#ff3cb4]">
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

// ─── Collapsed icon-only strip ─────────────────────────────────────────────────
function CollapsedStrip({ isDark, onExpand }) {
  const { isManager } = useAuth();
  const marketRoute = isManager ? '/manager/market' : '/dashboard/market';

  const bg       = 'bg-black/40 backdrop-blur-xl border-[#ff3cb4]/25';
  const iconBase = 'text-[#e0b3f0] hover:bg-white/10';
  const toggleClr = 'text-[#e0b3f0] hover:text-white hover:bg-white/10';

  return (
    <aside
      aria-label="Quick Access Panel (collapsed)"
      className={`hidden xl:flex flex-col items-center w-[52px] flex-shrink-0 h-screen sticky top-0 border-l transition-all duration-300 bg-black/40 backdrop-blur-xl border-[#ff3cb4]/25`}
    >
      {/* Toggle button aligned with header height */}
      <div className="flex items-center justify-center flex-shrink-0" style={{ minHeight: 64 }}>
        <button
          onClick={onExpand}
          aria-label="Expand Quick Access Panel"
          title="Expand panel"
          className={`p-1.5 rounded-lg transition-colors ${toggleClr}`}
        >
          <PanelRightOpen className="w-4 h-4" />
        </button>
      </div>

      {/* Icons */}
      <div className="flex flex-col items-center gap-3 pt-2">
        {/* Market Schedule */}
        <NavLink
          to={marketRoute}
          aria-label="Market Schedule"
          title="Market Schedule"
          className={({ isActive }) =>
            `p-2.5 rounded-xl border transition-colors ${
              isActive
                ? 'bg-[#ff3cb4]/20 border-[#ff3cb4]/50 text-[#ff3cb4] shadow-[0_0_10px_rgba(255,60,180,0.3)]'
                : 'border-white/10 text-[#e0b3f0] hover:bg-white/10'
            }`
          }
        >
          <ShoppingCart className="w-4 h-4" />
        </NavLink>

        {/* Meal Plan */}
        <div
          title="Weekly Meal Plan"
          className="p-2.5 rounded-xl border border-white/10 text-[#c084f0]"
        >
          <CalendarDays className="w-4 h-4" />
        </div>
      </div>
    </aside>
  );
}

// ─── Panel shell ───────────────────────────────────────────────────────────────
export default function QuickAccessPanel() {
  const { isDark } = useTheme();
  const { isManager } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return <CollapsedStrip isDark={isDark} onExpand={() => setCollapsed(false)} />;
  }

  const panelBg    = 'bg-black/40 backdrop-blur-xl border-[#ff3cb4]/25';
  const headerBord = 'border-[#ff3cb4]/20';
  const divCol     = 'border-white/10';
  const textMuted  = 'text-[#e0b3f0]';
  const textMain   = 'text-white';
  const toggleClr  = 'text-[#e0b3f0] hover:text-white hover:bg-white/10';

  return (
    <aside
      aria-label="Quick Access Panel"
      className={`
        hidden xl:flex flex-col
        w-[260px] flex-shrink-0
        h-screen sticky top-0
        border-l overflow-hidden
        transition-all duration-300
        bg-black/40 backdrop-blur-xl border-[#ff3cb4]/25
      `}
    >
      {/* ── Header (height mirrors the top nav bar: 64px) ───────────────────── */}
      <div
        className={`flex items-center justify-between px-4 border-b flex-shrink-0 ${headerBord}`}
        style={{ minHeight: 64 }}
      >
        <p className={`text-[10px] font-black uppercase tracking-widest ${textMuted}`}>
          Quick Access
        </p>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(true)}
          aria-label="Collapse Quick Access Panel"
          title="Hide panel"
          className={`p-1.5 rounded-lg transition-colors ${toggleClr}`}
        >
          <PanelRightClose className="w-4 h-4" />
        </button>
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
