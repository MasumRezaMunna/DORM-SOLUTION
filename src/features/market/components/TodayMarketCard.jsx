import { Avatar, Chip, Skeleton } from '@heroui/react';
import { motion } from 'framer-motion';
import { ShoppingCart, StickyNote, Users, CalendarCheck } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useTodaySchedule } from '../hooks/useMarketSchedules';
import { formatDate } from '../../../utils/helpers';
import { getMemberInitials } from '../utils/marketHelpers';

/**
 * TodayMarketCard — highlighted card showing today's market team.
 * If no schedule exists today, shows an empty state message.
 */
export default function TodayMarketCard() {
  const { isDark } = useTheme();
  const { data: schedule, isLoading } = useTodaySchedule();

  if (isLoading) {
    return (
      <div className="rounded-2xl overflow-hidden">
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  const mutedCol = isDark ? 'text-emerald-200/70' : 'text-emerald-700/70';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-6 shadow-xl shadow-emerald-900/20"
    >
      {/* Decorative circle */}
      <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5 blur-xl pointer-events-none" />

      {/* Header */}
      <div className="relative flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur">
          <ShoppingCart className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white/80 text-sm font-medium">Today's Market</p>
          <p className="text-white font-bold text-xl">
            {schedule ? formatDate(schedule.marketDate) : 'No Team Assigned'}
          </p>
        </div>

        <Chip
          size="sm"
          className="ml-auto bg-white/20 text-white font-semibold backdrop-blur"
        >
          <CalendarCheck className="w-3 h-3 inline mr-1" />
          Today
        </Chip>
      </div>

      {schedule ? (
        <>
          <div className="h-px bg-white/20 mb-5 w-full" />

          {/* Team members */}
          <div className="relative space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-white/80" />
              <p className="text-white/80 text-sm font-medium">Market Team</p>
            </div>

            <div className="flex flex-wrap gap-3">
              {(schedule.members || []).map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-2.5 bg-white/15 backdrop-blur rounded-2xl px-3 py-2"
                >
                  <Avatar
                    src={m.photo}
                    name={getMemberInitials(m.name)}
                    size="sm"
                    className="ring-2 ring-white/30"
                  />
                  <div>
                    <p className="text-white text-sm font-semibold leading-tight">{m.name}</p>
                    {m.email && (
                      <p className="text-white/60 text-xs leading-tight">{m.email}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Note */}
            {schedule.note && (
              <div className="flex items-start gap-2 mt-4 bg-white/10 rounded-xl px-3 py-2.5">
                <StickyNote className="w-4 h-4 text-white/70 mt-0.5 flex-shrink-0" />
                <p className="text-white/80 text-sm">{schedule.note}</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="relative text-center py-4">
          <Users className="w-10 h-10 text-white/30 mx-auto mb-2" />
          <p className="text-white/80 font-medium">No market team assigned today.</p>
          <p className="text-white/50 text-sm mt-1">Ask the manager to create today's schedule.</p>
        </div>
      )}
    </motion.div>
  );
}
