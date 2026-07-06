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
  bill:      'text-purple-500 bg-purple-500/10',
  payment:   'text-emerald-500 bg-emerald-500/10',
  notice:    'text-amber-500 bg-amber-500/10',
  complaint: 'text-red-500 bg-red-500/10',
  room:      'text-blue-500 bg-blue-500/10',
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

  const cardBg  = isDark ? 'bg-slate-900 border-white/10'     : 'bg-white border-slate-200 shadow-sm';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';

  const displayed = filter === 'unread' ? notifications.filter(n => !n.isRead) : notifications;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
        action={
          unreadCount > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )
        }
      />

      {/* Filter tabs */}
      <div className={`flex gap-3 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
        {['all', 'unread'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`pb-3 text-sm font-semibold border-b-2 capitalize transition-colors ${
              filter === f
                ? 'border-purple-500 text-purple-500'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {f}{f === 'unread' && unreadCount > 0 && <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px]">{unreadCount}</span>}
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
          <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="font-medium">{filter === 'unread' ? 'No unread notifications' : "You're all caught up!"}</p>
          <p className="text-sm mt-1 opacity-60">New notifications will appear here in real time</p>
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
                  isDark ? 'border-white/5' : 'border-slate-100'
                } ${!n.isRead ? (isDark ? 'bg-purple-500/5' : 'bg-purple-50/50') : ''}`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[n.type] || 'text-slate-500 bg-slate-500/10'}`}>
                  <Bell className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'} ${!n.isRead ? '' : 'opacity-70'}`}>
                      {n.title}
                    </p>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />}
                  </div>
                  <p className={`text-sm mb-1 ${textMuted} ${!n.isRead ? '' : 'opacity-70'}`}>{n.message}</p>
                  <p className={`text-[11px] uppercase font-medium tracking-wider opacity-50 ${textMuted}`}>
                    {formatRelativeTime(n.createdAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!n.isRead && (
                    <button
                      onClick={() => markRead.mutate(n._id)}
                      title="Mark as read"
                      className={`p-1.5 rounded-lg transition-colors text-emerald-500 hover:bg-emerald-500/10`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteOne.mutate(n._id)}
                    title="Delete"
                    className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
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
