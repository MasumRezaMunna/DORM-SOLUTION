import { useState } from 'react';
import { motion } from 'framer-motion';
import { Avatar, Skeleton, Tooltip, Chip, Button, Input } from '@heroui/react';
import { Edit2, Trash2, Search, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useMarketSchedules } from '../hooks/useMarketSchedules';
import { formatDate } from '../../../utils/helpers';
import MarketStatusBadge from './MarketStatusBadge';
import CountdownBadge from './CountdownBadge';
import { getMemberInitials } from '../utils/marketHelpers';

export default function MarketScheduleTable({ onEdit, onDelete }) {
  const { isDark } = useTheme();
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('all');
  const [page, setPage]           = useState(1);
  const LIMIT = 10;

  const apiStatus = statusFilter === 'all' ? undefined : statusFilter;

  const { data, isLoading } = useMarketSchedules({
    status: apiStatus,
    search: search || undefined,
    page,
    limit: LIMIT,
  });

  const schedules  = data?.data || [];
  const pagination = data?.pagination;

  const cardBg   = isDark ? 'bg-[#202720] border-[#394239]' : 'bg-white border-[#DDE1D8] shadow-sm';
  const textCol  = isDark ? 'text-[#F0F1E9]' : 'text-[#202720]';
  const mutedCol = isDark ? 'text-[#B1B8AC]' : 'text-[#687168]';
  const thCls    = isDark
    ? 'bg-[#292F29] text-[#B1B8AC] text-xs uppercase tracking-wider font-bold px-4 py-3 text-left border-b border-[#394239]'
    : 'bg-[#ECECE4]/60 text-[#687168] text-xs uppercase tracking-wider font-bold px-4 py-3 text-left border-b border-[#DDE1D8]';
  const tdCls    = isDark
    ? 'px-4 py-3 border-b border-[#394239] text-[#B1B8AC]'
    : 'px-4 py-3 border-b border-[#DDE1D8] text-[#202720]';

  const FILTERS = [
    { key: 'all',       label: 'All' },
    { key: 'upcoming',  label: 'Upcoming' },
    { key: 'today',     label: 'Today' },
    { key: 'completed', label: 'Completed' },
    { key: 'thisMonth', label: 'This Month' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className={`rounded-2xl border ${cardBg}`}
    >
      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between p-4 border-b border-[#DDE1D8] dark:border-[#394239]">
        {/* Filter tabs */}
        <div className={`inline-flex items-center gap-1 p-1 rounded-xl border ${isDark ? 'bg-[#202720] border-[#394239]' : 'bg-[#ECECE4] border-[#DDE1D8]'}`}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => { setStatus(f.key); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                statusFilter === f.key
                  ? 'bg-[#526B52] dark:bg-[#A3B18A] text-white dark:text-[#171C18] shadow-sm'
                  : (isDark ? 'text-[#B1B8AC] hover:text-[#F0F1E9]' : 'text-[#687168] hover:text-[#202720]')
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <Input
          size="sm"
          placeholder="Search by member name…"
          value={search}
          onValueChange={(v) => { setSearch(v); setPage(1); }}
          startContent={<Search className="w-4 h-4 text-[#687168] dark:text-[#B1B8AC]" />}
          className="w-full sm:w-60"
          variant="bordered"
          classNames={{
            input: isDark ? 'text-[#F0F1E9] placeholder:text-[#B1B8AC]/60' : 'text-[#202720] placeholder:text-[#687168]/60',
            inputWrapper: isDark ? 'border-[#394239] bg-[#202720] hover:border-[#A3B18A]' : 'border-[#DDE1D8] bg-white hover:border-[#748D6B]',
          }}
        />
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : schedules.length === 0 ? (
          <div className={`flex flex-col items-center py-16 gap-3 ${mutedCol}`}>
            <ShoppingCart className="w-12 h-12 opacity-30" />
            <p className="font-medium">No market schedules found</p>
            <p className="text-sm">Create your first schedule using the button above</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className={thCls}>Date</th>
                <th className={thCls}>Team Members</th>
                <th className={thCls}>Created By</th>
                <th className={thCls}>Status</th>
                <th className={thCls}>Note</th>
                <th className={`${thCls} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr
                  key={s._id}
                  className={`transition-colors ${isDark ? 'hover:bg-[#292F29]/60' : 'hover:bg-[#F5F4EE]'}`}
                >
                  {/* Date */}
                  <td className={tdCls}>
                    <div>
                      <p className={`text-sm font-bold ${textCol}`}>{formatDate(s.marketDate)}</p>
                      <CountdownBadge marketDate={s.marketDate} />
                    </div>
                  </td>

                  {/* Members */}
                  <td className={tdCls}>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {(s.members || []).map((m, i) => (
                          <Tooltip key={i} content={m.name} placement="top">
                            <div className="rounded-full ring-2 ring-white dark:ring-[#202720]">
                              <Avatar
                                src={m.photo}
                                name={getMemberInitials(m.name)}
                                size="sm"
                              />
                            </div>
                          </Tooltip>
                        ))}
                      </div>
                      <div className="hidden sm:flex flex-wrap gap-x-1">
                        {(s.members || []).map((m, i) => (
                          <span key={i} className={`text-xs font-medium ${mutedCol}`}>
                            {m.name}{i < s.members.length - 1 ? ',' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>

                  {/* Created by */}
                  <td className={tdCls}>
                    <p className={`text-sm font-medium ${mutedCol}`}>{s.createdBy?.name || '—'}</p>
                  </td>

                  {/* Status */}
                  <td className={tdCls}>
                    <MarketStatusBadge marketDate={s.marketDate} />
                  </td>

                  {/* Note */}
                  <td className={tdCls}>
                    {s.note
                      ? <p className={`text-xs max-w-[160px] truncate ${mutedCol}`} title={s.note}>{s.note}</p>
                      : <span className={`text-xs ${mutedCol} opacity-40`}>—</span>
                    }
                  </td>

                  {/* Actions */}
                  <td className={`${tdCls} text-right`}>
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip content="Edit" placement="left">
                        <button
                          onClick={() => onEdit(s)}
                          className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-[#303A30] text-[#A3B18A]' : 'hover:bg-[#E8EDE3] text-[#526B52]'}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Delete" placement="left" color="danger">
                        <button
                          onClick={() => onDelete(s)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-rose-500/10 text-rose-500 dark:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ── */}
      {pagination && pagination.totalPages > 1 && (
        <div className={`flex items-center justify-center gap-2 p-4 border-t ${isDark ? 'border-[#394239]' : 'border-[#DDE1D8]'}`}>
          <Button
            isIconOnly size="sm" variant="flat"
            isDisabled={page <= 1}
            onPress={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className={`text-sm font-medium ${mutedCol}`}>
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            isIconOnly size="sm" variant="flat"
            isDisabled={page >= pagination.totalPages}
            onPress={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </motion.div>
  );
}
