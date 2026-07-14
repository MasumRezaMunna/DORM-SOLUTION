import { Avatar, Skeleton, Chip, Tooltip } from '@heroui/react';
import { Users, Trophy, Calendar, ArrowRight } from 'lucide-react';
import { useRotationSuggestion } from '../hooks/useMarketSchedules';
import { formatDate } from '../../../utils/helpers';
import { useTheme } from '../../../contexts/ThemeContext';
import { getMemberInitials } from '../utils/marketHelpers';

/**
 * DutyRotationSuggestion — shows a ranked list of members by fairness.
 * Members with fewest duties (and oldest last duty) appear first.
 *
 * Props:
 *  selectedIds   {string[]}  - currently selected member userIds
 *  onSelect      {fn}        - called with full member object to add to selection
 *  maxSelected   {number}    - max allowed selections (default 3)
 */
export default function DutyRotationSuggestion({ selectedIds = [], onSelect, maxSelected = 3 }) {
  const { isDark } = useTheme();
  const { data: suggestions = [], isLoading } = useRotationSuggestion();

  const cardBg  = isDark ? 'bg-slate-800/60 border-white/5' : 'bg-slate-50 border-slate-200';
  const textCol = isDark ? 'text-white' : 'text-slate-800';
  const mutedCol = isDark ? 'text-slate-400' : 'text-slate-500';
  const rowHover = isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100';

  return (
    <div className={`rounded-2xl border p-4 ${cardBg}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
          <Trophy className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className={`text-sm font-semibold ${textCol}`}>Duty Rotation Suggestion</p>
          <p className={`text-xs ${mutedCol}`}>Members with fewest duties appear first</p>
        </div>
      </div>

      {/* List */}
      <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))
          : suggestions.map((member) => {
              const uid      = member.userId?.toString?.() || member.userId;
              const selected = selectedIds.includes(uid);
              const disabled = !selected && selectedIds.length >= maxSelected;

              return (
                <div
                  key={uid}
                  onClick={() => !disabled && onSelect && onSelect(member)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer
                    ${selected ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30' : rowHover}
                    ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  {/* Avatar */}
                  <Avatar
                    src={member.photo}
                    name={getMemberInitials(member.name)}
                    size="sm"
                    className="flex-shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${textCol}`}>{member.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs ${mutedCol}`}>
                        {member.totalDuties} {member.totalDuties === 1 ? 'duty' : 'duties'}
                      </span>
                      {member.lastMarketDate && (
                        <>
                          <span className={`text-xs ${mutedCol}`}>·</span>
                          <span className={`text-xs ${mutedCol}`}>
                            Last: {formatDate(member.lastMarketDate)}
                          </span>
                        </>
                      )}
                      {!member.lastMarketDate && (
                        <Chip size="sm" color="warning" variant="flat" className="text-[10px] h-4">Never</Chip>
                      )}
                    </div>
                  </div>

                  {/* Next duty */}
                  {member.nextAssignedDate && (
                    <Tooltip content={`Next: ${formatDate(member.nextAssignedDate)}`} placement="left">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-blue-400" />
                      </div>
                    </Tooltip>
                  )}

                  {/* Selected indicator */}
                  {selected && (
                    <Chip size="sm" color="success" variant="flat" className="text-[10px] h-4 flex-shrink-0">
                      ✓ Selected
                    </Chip>
                  )}
                  {!selected && !disabled && (
                    <ArrowRight className={`w-3.5 h-3.5 ${mutedCol} opacity-0 group-hover:opacity-100`} />
                  )}
                </div>
              );
            })}

        {!isLoading && suggestions.length === 0 && (
          <div className={`text-center py-6 ${mutedCol}`}>
            <Users className="w-6 h-6 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No active members found</p>
          </div>
        )}
      </div>
    </div>
  );
}
