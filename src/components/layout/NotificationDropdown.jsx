import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, Link as LinkIcon, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatRelativeTime } from '../../utils/helpers';
import api from '../../config/axios';

// Clean up unrounded floats in legacy notification messages (e.g. 1649.6499999999999 -> 1,649.65)
const cleanNotificationMessage = (msg) => {
  if (!msg) return '';
  return msg.replace(/([৳$€£])\s*(\d+\.\d{3,})/g, (_match, symbol, numStr) => {
    const n = parseFloat(numStr);
    return `${symbol}${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  });
};

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

  const bgClasses = isDark
    ? 'bg-[#151c16] border-[#2e3b2e] shadow-2xl shadow-black/80 ring-1 ring-white/10'
    : 'bg-white border-[#DDE1D8] shadow-2xl shadow-black/10';
  const itemHover = isDark ? 'hover:bg-[#202920]' : 'hover:bg-[#ECECE4]/70';
  const textPrimary = isDark ? 'text-white font-semibold' : 'text-[#202720] font-semibold';
  const textSecondary = isDark ? 'text-[#B8C2B3]' : 'text-[#687168]';

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
            className={`absolute right-0 top-full mt-2 w-80 sm:w-[420px] rounded-2xl border shadow-2xl z-50 overflow-hidden flex flex-col ${bgClasses}`}
            style={{ maxHeight: 'calc(100vh - 100px)' }}
          >
            <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-[#2e3b2e] bg-[#1a231b]' : 'border-[#DDE1D8] bg-[#F7F9F5]'}`}>
              <h3 className={`font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#202720]'}`}>
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-xs bg-[#DC2626] text-white px-2 py-0.5 rounded-full font-bold">
                    {unreadCount}
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button 
                  onClick={() => markAllReadMutation.mutate()}
                  className="text-xs font-semibold text-[#526B52] hover:text-[#405640] dark:text-[#A3B18A] dark:hover:text-[#BAC7A8] flex items-center gap-1 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-[#DDE1D8] dark:divide-[#2e3b2e]">
              {notifications.length === 0 ? (
                <div className={`p-8 text-center ${textSecondary}`}>
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">You're all caught up!</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n._id} 
                    onClick={() => handleNotificationClick(n)}
                    className={`p-4 transition-colors cursor-pointer flex gap-3 ${itemHover} ${
                      !n.isRead 
                        ? (isDark ? 'bg-[#1b251c] border-l-4 border-l-[#A3B18A]' : 'bg-[#F2F6EF] border-l-4 border-l-[#526B52]') 
                        : 'border-l-4 border-l-transparent opacity-85'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconColor(n.type)}`}>
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <p className={`text-sm truncate ${textPrimary} ${!n.isRead ? 'font-bold' : 'font-medium'}`}>{n.title}</p>
                        {!n.isRead && <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] dark:bg-[#A3B18A] mt-1 flex-shrink-0 ring-2 ring-black/20" />}
                      </div>
                      <p className={`text-xs line-clamp-2 mb-1.5 leading-relaxed ${textSecondary}`}>
                        {cleanNotificationMessage(n.message)}
                      </p>
                      <p className={`text-[10px] uppercase font-semibold tracking-wider ${isDark ? 'text-[#8D9B87]' : 'text-[#687168]'}`}>
                        {formatRelativeTime(n.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className={`p-3 border-t text-center ${isDark ? 'border-[#2e3b2e] bg-[#1a231b]' : 'border-[#DDE1D8] bg-[#F7F9F5]'}`}>
              <Link
                to={notifRoot}
                onClick={() => setIsOpen(false)}
                className="inline-block text-xs font-bold text-[#526B52] hover:text-[#405640] dark:text-[#A3B18A] dark:hover:text-[#BAC7A8] transition-colors"
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
