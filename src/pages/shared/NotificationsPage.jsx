import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatRelativeTime } from '../../utils/helpers';
import api from '../../config/axios';
import PageHeader from '../../components/shared/PageHeader';
import { io } from 'socket.io-client';

const TYPE_COLORS = {
  bill:      'text-[#0D9488] bg-[#0D9488]/10 dark:text-[#2DD4BF]',
  payment:   'text-[#526B52] bg-[#E8EDE3] dark:text-[#A3B18A] dark:bg-[#303A30]',
  notice:    'text-amber-500 bg-amber-500/10 dark:text-amber-400',
  complaint: 'text-rose-500 bg-rose-500/10 dark:text-rose-400',
  room:      'text-[#748D6B] bg-[#E8EDE3] dark:text-[#A3B18A] dark:bg-[#303A30]',
};

export default function NotificationsPage() {
  const { isDark } = useTheme();
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');

  // Real-time: new notifications via socket
  useEffect(() => {
    if (!token || !user) return;
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socket.on('notification', () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-page'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });
    return () => socket.disconnect();
  }, [token, user, queryClient]);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications-page', filter],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: 50 });
      if (filter === 'unread') params.set('unread', 'true');
      const res = await api.get(`/notifications?${params}`);
      return res.data.data;
    },
  });

  const notifications = data?.notifications || [];
  const unreadCount   = data?.unreadCount   || 0;

  const markRead = useMutation({
    mutationFn: (id) => api.put(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-page'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: () => api.put('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-page'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteOne = useMutation({
    mutationFn: (id) => api.delete(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-page'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const cardBg  = isDark ? 'bg-[#202720] border-[#394239]' : 'bg-white border-[#DDE1D8] shadow-sm';
  const textMuted = isDark ? 'text-[#B1B8AC]' : 'text-[#687168]';

  const displayed = filter === 'unread' ? notifications.filter(n => !n.isRead) : notifications;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
        action={
          unreadCount > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#526B52] hover:bg-[#405640] dark:bg-[#A3B18A] dark:hover:bg-[#BAC7A8] text-white dark:text-[#171C18] text-sm font-bold shadow-sm transition-all disabled:opacity-50"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )
        }
      />

      {/* Filter tabs */}
      <div className={`flex gap-3 border-b ${isDark ? 'border-[#394239]' : 'border-[#DDE1D8]'}`}>
        {['all', 'unread'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`pb-3 text-sm font-bold border-b-2 capitalize transition-colors ${
              filter === f
                ? 'border-[#526B52] dark:border-[#A3B18A] text-[#526B52] dark:text-[#A3B18A]'
                : 'border-transparent text-[#687168] dark:text-[#B1B8AC] hover:text-[#202720] dark:hover:text-[#F0F1E9]'
            }`}
          >
            {f}{f === 'unread' && unreadCount > 0 && <span className="ml-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold">{unreadCount}</span>}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`h-20 rounded-2xl border animate-pulse ${cardBg}`} />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className={`rounded-2xl border py-20 text-center ${cardBg} ${textMuted}`}>
          <Bell className="w-10 h-10 mx-auto mb-3 opacity-20 text-[#687168] dark:text-[#B1B8AC]" />
          <p className="font-bold text-[#202720] dark:text-[#F0F1E9]">{filter === 'unread' ? 'No unread notifications' : "You're all caught up!"}</p>
          <p className="text-sm mt-1 opacity-70">New notifications will appear here in real time</p>
        </div>
      ) : (
        <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
          <AnimatePresence initial={false}>
            {displayed.map((n, i) => (
              <motion.div
                key={n._id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18, delay: i * 0.03 }}
                className={`flex items-start gap-4 p-4 border-b last:border-0 transition-colors ${
                  isDark ? 'border-[#394239]' : 'border-[#DDE1D8]'
                } ${!n.isRead ? (isDark ? 'bg-[#303A30]/30' : 'bg-[#E8EDE3]/40') : ''}`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[n.type] || 'text-[#687168] bg-[#ECECE4] dark:text-[#B1B8AC] dark:bg-[#292F29]'}`}>
                  <Bell className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <p className={`text-sm font-bold ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'} ${!n.isRead ? '' : 'opacity-70'}`}>
                      {n.title}
                    </p>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#526B52] dark:bg-[#A3B18A] mt-1.5 flex-shrink-0" />}
                  </div>
                  <p className={`text-sm mb-1 leading-relaxed ${textMuted} ${!n.isRead ? '' : 'opacity-70'}`}>{n.message}</p>
                  <p className={`text-[11px] uppercase font-bold tracking-wider opacity-60 ${textMuted}`}>
                    {formatRelativeTime(n.createdAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!n.isRead && (
                    <button
                      onClick={() => markRead.mutate(n._id)}
                      title="Mark as read"
                      className={`p-1.5 rounded-lg transition-colors text-[#526B52] dark:text-[#A3B18A] hover:bg-[#E8EDE3] dark:hover:bg-[#303A30]`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteOne.mutate(n._id)}
                    title="Delete"
                    className="p-1.5 rounded-lg transition-colors text-rose-500 hover:bg-rose-500/10 dark:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
