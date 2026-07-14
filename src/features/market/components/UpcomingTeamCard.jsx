import { Avatar, Skeleton, Tooltip } from '@heroui/react';
import { motion } from 'framer-motion';
import { Calendar, Users } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { formatDate } from '../../../utils/helpers';
import { getMemberInitials } from '../utils/marketHelpers';
import CountdownBadge from './CountdownBadge';

/**
 * UpcomingTeamCard — displays one upcoming market schedule.
 * Shows date, countdown badge, and member avatars.
 *
 * Props:
 *  schedule  {object}
 *  index     {number}  for stagger animation
 */
export default function UpcomingTeamCard({ schedule, index = 0 }) {
  const { isDark } = useTheme();

  const cardBg  = isDark
    ? 'bg-slate-900 border-white/10 hover:border-blue-500/30'
    : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-md';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
      className={`rounded-2xl border p-4 transition-all duration-200 ${cardBg}`}
    >
      {/* Date row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${isDark ? 'bg-blue-500/15' : 'bg-blue-50'}`}>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {formatDate(schedule.marketDate)}
            </p>
            {schedule.createdBy?.name && (
              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                by {schedule.createdBy.name}
              </p>
            )}
          </div>
        </div>
        <CountdownBadge marketDate={schedule.marketDate} />
      </div>

      {/* Members */}
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {(schedule.members || []).map((m, i) => (
            <Tooltip key={i} content={m.name} placement="top">
              <div className="rounded-full ring-2 ring-white dark:ring-slate-900 relative">
                <Avatar
                  src={m.photo}
                  name={getMemberInitials(m.name)}
                  size="sm"
                />
              </div>
            </Tooltip>
          ))}
        </div>
        <div className="flex flex-wrap gap-0.5">
          {(schedule.members || []).map((m, i) => (
            <span
              key={i}
              className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
            >
              {m.name}{i < schedule.members.length - 1 ? ',' : ''}
            </span>
          ))}
        </div>
      </div>

      {/* Note */}
      {schedule.note && (
        <p className={`text-xs mt-3 pt-3 border-t line-clamp-2 ${isDark ? 'border-white/5 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
          {schedule.note}
        </p>
      )}
    </motion.div>
  );
}
