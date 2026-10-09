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

  const cardBg   = isDark ? 'bg-[#202720] border-[#394239]' : 'bg-white border-[#DDE1D8] shadow-sm';
  const textCol  = isDark ? 'text-[#F0F1E9]' : 'text-[#202720]';
  const mutedCol = isDark ? 'text-[#B1B8AC]' : 'text-[#687168]';

  const thCls = isDark
    ? 'bg-[#292F29] text-[#B1B8AC] text-xs uppercase tracking-wider font-bold px-4 py-3 text-left border-b border-[#394239]'
    : 'bg-[#ECECE4]/60 text-[#687168] text-xs uppercase tracking-wider font-bold px-4 py-3 text-left border-b border-[#DDE1D8]';
  const tdCls = isDark
    ? 'px-4 py-3 border-b border-[#394239] last:border-0 text-[#B1B8AC]'
    : 'px-4 py-3 border-b border-[#DDE1D8] last:border-0 text-[#202720]';

  const myStats = [
    {
      title: 'Total Market Duties',
      value: myLoading ? '...' : (mySummary.totalDuties ?? 0),
      icon: ShoppingCart,
      gradient: 'from-[#526B52] to-[#405640]',
    },
    {
      title: 'Last Market Date',
      value: myLoading ? '...' : (mySummary.lastMarketDate ? formatDate(mySummary.lastMarketDate) : 'Never'),
      icon: Calendar,
      gradient: 'from-[#748D6B] to-[#526B52]',
    },
    {
      title: 'Next Assigned Date',
      value: myLoading ? '...' : (mySummary.nextAssignedDate ? formatDate(mySummary.nextAssignedDate) : 'None'),
      icon: Target,
      gradient: 'from-[#A3B18A] to-[#748D6B]',
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
            <h3 className={`text-lg font-bold tracking-tight mb-4 ${textCol}`}>Today's Market</h3>
            <TodayMarketCard />
          </section>

          {/* Upcoming Teams */}
          <section>
            <h3 className={`text-lg font-bold tracking-tight mb-4 ${textCol}`}>Upcoming Teams</h3>
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
                <p className={`text-sm font-medium ${mutedCol}`}>No upcoming schedules assigned yet.</p>
              </div>
            )}
          </section>

          {/* Recent History */}
          <section>
            <h3 className={`text-lg font-bold tracking-tight mb-4 ${textCol}`}>Recent History</h3>
            <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
              {historyLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
                </div>
              ) : history.length === 0 ? (
                <p className={`py-8 text-center text-sm font-medium ${mutedCol}`}>No history found.</p>
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
                        className={`transition-colors ${isDark ? 'hover:bg-[#292F29]/60' : 'hover:bg-[#F5F4EE]'}`}
                      >
                        <td className={tdCls}>
                          <span className="font-semibold text-sm">{formatDate(s.marketDate)}</span>
                        </td>
                        <td className={tdCls}>
                          <div className="flex -space-x-2">
                            {(s.members || []).map((m, i) => (
                              <Tooltip key={i} content={m.name} placement="top">
                                <div className="rounded-full ring-2 ring-white dark:ring-[#202720]">
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
            <h3 className={`text-lg font-bold tracking-tight mb-4 ${textCol}`}>My Market Duty</h3>

            <div className="space-y-4 mb-6">
              {myStats.map((s, i) => (
                <StatCard key={s.title} {...s} index={i} />
              ))}
            </div>

            <h4 className={`text-sm font-bold tracking-tight mb-3 ${textCol}`}>My History Log</h4>
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
                        isDark ? 'border-[#394239] bg-[#292F29]/60' : 'border-[#DDE1D8] bg-[#ECECE4]/40'
                      }`}
                    >
                      <div>
                        <p className={`text-sm font-bold ${textCol}`}>{formatDate(s.marketDate)}</p>
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
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#526B52] dark:text-[#A3B18A]" />
                  <p className="text-sm font-medium">You haven't been assigned to any market duties yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
