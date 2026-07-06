import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, Link as LinkIcon, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { formatRelativeTime } from '../../utils/helpers';
import api from '../../config/axios';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { isDark } = useTheme();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications?limit=10');
      return res.data.data; // { notifications, unreadCount }
    },
    refetchInterval: 60000, // Poll every minute
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const markReadMutation = useMutation({
    mutationFn: async (id) => api.put(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => api.put('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  const handleNotificationClick = (n) => {
    if (!n.isRead) markReadMutation.mutate(n._id);
    if (n.link) {
      setIsOpen(false);
      navigate(n.link);
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'bill': return 'text-purple-500 bg-purple-500/10';
      case 'payment': return 'text-emerald-500 bg-emerald-500/10';
      case 'notice': return 'text-amber-500 bg-amber-500/10';
      case 'complaint': return 'text-red-500 bg-red-500/10';
      case 'room': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-slate-500 bg-slate-500/10';
    }
  };

  const bgClasses = isDark ? 'bg-slate-900 border-white/10 shadow-black/50' : 'bg-white border-slate-200 shadow-slate-200/50';
  const itemHover = isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50';
  const textPrimary = isDark ? 'text-white' : 'text-slate-800';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition-colors ${
          isOpen ? (isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-purple-600') : (isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-100')
        }`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white dark:border-slate-900" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border shadow-xl z-50 overflow-hidden flex flex-col ${bgClasses}`}
            style={{ maxHeight: 'calc(100vh - 100px)' }}
          >
            <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
              <h3 className={`font-semibold ${textPrimary}`}>Notifications {unreadCount > 0 && <span className="ml-1 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">{unreadCount}</span>}</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={() => markAllReadMutation.mutate()}
                  className="text-xs font-medium text-purple-500 hover:text-purple-600 flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className={`p-8 text-center ${textSecondary}`}>
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {notifications.map((n) => (
                    <div 
                      key={n._id} 
                      onClick={() => handleNotificationClick(n)}
                      className={`p-4 transition-colors cursor-pointer flex gap-3 ${itemHover} ${!n.isRead ? (isDark ? 'bg-purple-500/5' : 'bg-purple-50/50') : ''}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(n.type)}`}>
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <p className={`text-sm font-semibold truncate ${textPrimary} ${!n.isRead ? '' : 'opacity-80'}`}>{n.title}</p>
                          {!n.isRead && <span className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />}
                        </div>
                        <p className={`text-xs line-clamp-2 mb-1 ${textSecondary} ${!n.isRead ? '' : 'opacity-80'}`}>{n.message}</p>
                        <p className={`text-[10px] uppercase font-medium tracking-wider ${textSecondary} opacity-60`}>
                          {formatRelativeTime(n.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`p-3 border-t ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
              <Link
                to="/dashboard/notifications"
                onClick={() => setIsOpen(false)}
                className="block text-center text-xs font-semibold text-purple-500 hover:text-purple-600 transition-colors"
              >
                View all notifications →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
