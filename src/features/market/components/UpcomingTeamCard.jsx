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
    ? 'bg-[#202720] border-[#394239] hover:border-[#A3B18A]/50'
    : 'bg-white border-[#DDE1D8] hover:border-[#748D6B] shadow-sm';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
      className={`rounded-2xl border p-4 transition-all duration-200 ${cardBg}`}
    >
      {/* Date row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${isDark ? 'bg-[#303A30] text-[#A3B18A]' : 'bg-[#E8EDE3] text-[#526B52]'}`}>
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <p className={`text-sm font-bold tracking-tight ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>
              {formatDate(schedule.marketDate)}
            </p>
            {schedule.createdBy?.name && (
              <p className={`text-xs ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>
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
              <div className="rounded-full ring-2 ring-white dark:ring-[#202720] relative">
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
              className={`text-xs font-medium ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}
            >
              {m.name}{i < schedule.members.length - 1 ? ',' : ''}
            </span>
          ))}
        </div>
      </div>

      {/* Note */}
      {schedule.note && (
        <p className={`text-xs mt-3 pt-3 border-t line-clamp-2 ${isDark ? 'border-[#394239] text-[#B1B8AC]' : 'border-[#DDE1D8] text-[#687168]'}`}>
          {schedule.note}
        </p>
      )}
    </motion.div>
  );
}
