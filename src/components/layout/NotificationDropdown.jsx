import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, Link as LinkIcon, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatRelativeTime } from '../../utils/helpers';
import api from '../../config/axios';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { isDark } = useTheme();
  const { isManager } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const notifRoot = isManager ? '/manager/notifications' : '/dashboard/notifications';

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-page'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => api.put('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-page'] });
    },
  });

  const resolveLink = (link) => {
    if (!link) return null;
    
    // The backend stores links like /member/bills
    // We need to remap them to our actual frontend routes
    let finalLink = link;
    if (finalLink.startsWith('/member/')) {
      finalLink = finalLink.replace('/member/', '/dashboard/');
    }

    if (isManager && finalLink.startsWith('/dashboard/')) {
      // Remap to manager route if it exists, otherwise keep as-is
      const sub = finalLink.replace('/dashboard/', '');
      const managerRoutes = ['bills', 'payments', 'meals', 'notices', 'complaints', 'members', 'rooms', 'expenses', 'notifications', 'settings', 'profile'];
      const segment = sub.split('/')[0];
      
      // If it's a room link, the manager route is /manager/rooms
      if (segment === 'room') return '/manager/rooms';
      
      if (managerRoutes.includes(segment)) return finalLink.replace('/dashboard/', '/manager/');
    }
    
    return finalLink;
  };

  const handleNotificationClick = (n) => {
    if (!n.isRead) markReadMutation.mutate(n._id);
    const dest = resolveLink(n.link);
    if (dest) {
      setIsOpen(false);
      navigate(dest);
    }
  };


  const getIconColor = (type) => {
    switch (type) {
      case 'bill': return 'text-[#526B52] dark:text-[#A3B18A] bg-[#E8EDE3] dark:bg-[#303A30]';
      case 'payment': return 'text-[#526B52] dark:text-[#A3B18A] bg-[#E8EDE3] dark:bg-[#303A30]';
      case 'notice': return 'text-[#D97706] dark:text-[#F59E0B] bg-[#FEF3C7] dark:bg-[#78350F]/30';
      case 'complaint': return 'text-[#DC2626] dark:text-[#EF4444] bg-[#FEE2E2] dark:bg-[#7F1D1D]/30';
      case 'room': return 'text-[#0D9488] dark:text-[#2DD4BF] bg-[#CCFBF1] dark:bg-[#134E4A]/30';
      default: return 'text-[#687168] dark:text-[#B1B8AC] bg-[#ECECE4] dark:bg-[#292F29]';
    }
  };

  const bgClasses = isDark ? 'bg-[#202720] border-[#394239] shadow-2xl' : 'bg-white border-[#DDE1D8] shadow-xl shadow-black/5';
  const itemHover = isDark ? 'hover:bg-[#292F29]' : 'hover:bg-[#ECECE4]/60';
  const textPrimary = isDark ? 'text-[#F0F1E9]' : 'text-[#202720]';
  const textSecondary = isDark ? 'text-[#B1B8AC]' : 'text-[#687168]';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition-colors ${
          isOpen ? (isDark ? 'bg-[#292F29] text-[#A3B18A]' : 'bg-[#ECECE4] text-[#526B52]') : (isDark ? 'text-[#B1B8AC] hover:bg-[#292F29] hover:text-[#F0F1E9]' : 'text-[#687168] hover:bg-[#ECECE4] hover:text-[#202720]')
        }`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#DC2626] border-2 border-white dark:border-[#202720]" />
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
            <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-[#394239]' : 'border-[#DDE1D8]'}`}>
              <h3 className={`font-bold ${textPrimary}`}>Notifications {unreadCount > 0 && <span className="ml-1 text-xs bg-[#DC2626] text-white px-2 py-0.5 rounded-full font-bold">{unreadCount}</span>}</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={() => markAllReadMutation.mutate()}
                  className="text-xs font-semibold text-[#526B52] hover:text-[#405640] dark:text-[#A3B18A] dark:hover:text-[#BAC7A8] flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className={`p-8 text-center ${textSecondary}`}>
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-[#DDE1D8] dark:divide-[#394239]">
                  {notifications.map((n) => (
                    <div 
                      key={n._id} 
                      onClick={() => handleNotificationClick(n)}
                      className={`p-4 transition-colors cursor-pointer flex gap-3 ${itemHover} ${!n.isRead ? (isDark ? 'bg-[#303A30]/50' : 'bg-[#E8EDE3]/50') : ''}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconColor(n.type)}`}>
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <p className={`text-sm font-bold truncate ${textPrimary} ${!n.isRead ? '' : 'opacity-80'}`}>{n.title}</p>
                          {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#526B52] dark:bg-[#A3B18A] mt-1.5 flex-shrink-0" />}
                        </div>
                        <p className={`text-xs line-clamp-2 mb-1 ${textSecondary} ${!n.isRead ? '' : 'opacity-80'}`}>{n.message}</p>
                        <p className={`text-[10px] uppercase font-semibold tracking-wider ${textSecondary} opacity-70`}>
                          {formatRelativeTime(n.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`p-3 border-t ${isDark ? 'border-[#394239]' : 'border-[#DDE1D8]'}`}>
              <Link
                to={notifRoot}
                onClick={() => setIsOpen(false)}
                className="block text-center text-xs font-bold text-[#526B52] hover:text-[#405640] dark:text-[#A3B18A] dark:hover:text-[#BAC7A8] transition-colors"
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
