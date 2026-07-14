import { motion } from 'framer-motion';
import { Avatar, Skeleton, Tooltip } from '@heroui/react';
import { ShoppingCart, Calendar, Target } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import TodayMarketCard from '../../features/market/components/TodayMarketCard';
import UpcomingTeamCard from '../../features/market/components/UpcomingTeamCard';
import MarketStatusBadge from '../../features/market/components/MarketStatusBadge';
import {
  useUpcomingSchedules,
  useScheduleHistory,
  useMySchedules,
} from '../../features/market/hooks/useMarketSchedules';
import { formatDate } from '../../utils/helpers';
import { getMemberInitials } from '../../features/market/utils/marketHelpers';

export default function MarketSchedulePage() {
  const { isDark } = useTheme();

  const { data: upcoming = [], isLoading: upcomingLoading } = useUpcomingSchedules();
  const { data: historyData, isLoading: historyLoading } = useScheduleHistory({ limit: 5 });
  const { data: myData, isLoading: myLoading } = useMySchedules();

  const history    = historyData?.data || [];
  const mySchedules = myData?.schedules || [];
  const mySummary  = myData?.summary || {};

  const cardBg   = isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200 shadow-sm';
  const textCol  = isDark ? 'text-white' : 'text-slate-800';
  const mutedCol = isDark ? 'text-slate-400' : 'text-slate-500';

  const thCls = isDark
    ? 'bg-slate-800/80 text-slate-400 text-xs uppercase tracking-wide font-semibold px-4 py-3 text-left border-b border-white/5'
    : 'bg-slate-50 text-slate-500 text-xs uppercase tracking-wide font-semibold px-4 py-3 text-left';
  const tdCls = isDark
    ? 'px-4 py-3 border-b border-white/5 last:border-0 text-slate-300'
    : 'px-4 py-3 border-b border-slate-100 last:border-0 text-slate-700';

  const myStats = [
    {
      title: 'Total Market Duties',
      value: myLoading ? '...' : (mySummary.totalDuties ?? 0),
      icon: ShoppingCart,
      gradient: 'from-purple-500 to-indigo-600',
    },
    {
      title: 'Last Market Date',
      value: myLoading ? '...' : (mySummary.lastMarketDate ? formatDate(mySummary.lastMarketDate) : 'Never'),
      icon: Calendar,
      gradient: 'from-blue-500 to-cyan-600',
    },
    {
      title: 'Next Assigned Date',
      value: myLoading ? '...' : (mySummary.nextAssignedDate ? formatDate(mySummary.nextAssignedDate) : 'None'),
      icon: Target,
      gradient: 'from-amber-500 to-orange-600',
    },
  ];

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title="Market Schedule"
        subtitle="View today's team, upcoming assignments, and your duty history"
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left Column */}
        <div className="xl:col-span-2 space-y-6">

          {/* Today's Market */}
          <section>
            <h3 className={`text-lg font-semibold mb-4 ${textCol}`}>Today's Market</h3>
            <TodayMarketCard />
          </section>

          {/* Upcoming Teams */}
          <section>
            <h3 className={`text-lg font-semibold mb-4 ${textCol}`}>Upcoming Teams</h3>
            {upcomingLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
              </div>
            ) : upcoming.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {upcoming.map((schedule, i) => (
                  <UpcomingTeamCard key={schedule._id} schedule={schedule} index={i} />
                ))}
              </div>
            ) : (
              <div className={`p-8 text-center rounded-2xl border ${cardBg}`}>
                <Calendar className={`w-8 h-8 mx-auto mb-2 opacity-30 ${mutedCol}`} />
                <p className={`text-sm ${mutedCol}`}>No upcoming schedules assigned yet.</p>
              </div>
            )}
          </section>

          {/* Recent History */}
          <section>
            <h3 className={`text-lg font-semibold mb-4 ${textCol}`}>Recent History</h3>
            <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
              {historyLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
                </div>
              ) : history.length === 0 ? (
                <p className={`py-8 text-center text-sm ${mutedCol}`}>No history found.</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className={thCls}>Date</th>
                      <th className={thCls}>Team Members</th>
                      <th className={thCls}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((s) => (
                      <tr
                        key={s._id}
                        className={`transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}
                      >
                        <td className={tdCls}>
                          <span className="font-medium text-sm">{formatDate(s.marketDate)}</span>
                        </td>
                        <td className={tdCls}>
                          <div className="flex -space-x-2">
                            {(s.members || []).map((m, i) => (
                              <Tooltip key={i} content={m.name} placement="top">
                                <div className="rounded-full ring-2 ring-white dark:ring-slate-900">
                                  <Avatar src={m.photo} name={getMemberInitials(m.name)} size="sm" />
                                </div>
                              </Tooltip>
                            ))}
                          </div>
                        </td>
                        <td className={tdCls}>
                          <MarketStatusBadge marketDate={s.marketDate} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

        </div>

        {/* Right Column: My Duty */}
        <div className="space-y-6">
          <section>
            <h3 className={`text-lg font-semibold mb-4 ${textCol}`}>My Market Duty</h3>

            <div className="space-y-4 mb-6">
              {myStats.map((s, i) => (
                <StatCard key={s.title} {...s} index={i} />
              ))}
            </div>

            <h4 className={`text-sm font-semibold mb-3 ${textCol}`}>My History Log</h4>
            <div className={`rounded-2xl border p-4 ${cardBg}`}>
              {myLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
                </div>
              ) : mySchedules.length > 0 ? (
                <div className="space-y-3">
                  {mySchedules.map((s, i) => (
                    <motion.div
                      key={s._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-center justify-between p-3 rounded-xl border ${
                        isDark ? 'border-white/5 bg-slate-800/40' : 'border-slate-100 bg-slate-50'
                      }`}
                    >
                      <div>
                        <p className={`text-sm font-semibold ${textCol}`}>{formatDate(s.marketDate)}</p>
                        <p className={`text-xs ${mutedCol}`}>
                          with {(s.members || []).filter((m) => m.name !== mySummary.name).length} others
                        </p>
                      </div>
                      <MarketStatusBadge marketDate={s.marketDate} size="sm" />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-6 ${mutedCol}`}>
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">You haven't been assigned to any market duties yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
