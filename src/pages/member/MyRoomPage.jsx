import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { DoorOpen, Users, Bed } from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import { useTheme } from '../../contexts/ThemeContext';
import { formatDate, getInitials } from '../../utils/helpers';
import api from '../../config/axios';
import { QUERY_KEYS } from '../../utils/constants';

export default function MyRoomPage() {
  const { isDark } = useTheme();

  const { data: roomData, isLoading } = useQuery({
    queryKey: ['room', 'my'],
    queryFn: async () => {
      const { data } = await api.get('/rooms/my');
      return data.data;
    },
    placeholderData: null,
  });

  const cardBg = isDark ? 'bg-[#202720] border-[#394239]' : 'bg-white border-[#DDE1D8] shadow-sm';
  const textMuted = isDark ? 'text-[#B1B8AC]' : 'text-[#687168]';

  return (
    <div className="space-y-6">
      <PageHeader title="My Room" subtitle="Your room details and roommates" />

      {isLoading ? (
        <div className={`rounded-2xl border p-8 animate-pulse ${cardBg}`}>
          <div className={`h-8 w-32 rounded mb-4 ${isDark ? 'bg-[#292F29]' : 'bg-[#ECECE4]'}`} />
          <div className={`h-4 w-full rounded ${isDark ? 'bg-[#292F29]' : 'bg-[#ECECE4]'}`} />
        </div>
      ) : !roomData ? (
        <div className={`text-center py-16 rounded-2xl border ${cardBg}`}>
          <DoorOpen className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#687168] dark:text-[#B1B8AC]" />
          <p className={`font-semibold ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>You have not been assigned a room yet.</p>
          <p className={`text-sm mt-1 ${textMuted}`}>Please contact the manager.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Room Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl border p-6 lg:col-span-1 ${cardBg}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-[#E8EDE3] dark:bg-[#303A30]">
                <DoorOpen className="w-6 h-6 text-[#526B52] dark:text-[#A3B18A]" />
              </div>
              <StatusBadge status={roomData.status || 'occupied'} />
            </div>
            <p className={`text-4xl font-extrabold tracking-tight mb-1 ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>
              Room {roomData.roomNumber}
            </p>
            <p className={`text-sm capitalize mb-4 font-medium ${textMuted}`}>
              {roomData.type || 'Standard'} · Floor {roomData.floor || 1}
            </p>

            <div className="space-y-2">
              {[
                { label: 'Type', value: roomData.type },
                { label: 'Floor', value: roomData.floor },
                { label: 'Capacity', value: `${roomData.capacity} persons` },
                { label: 'Occupants', value: `${roomData.currentOccupants?.length || 0} / ${roomData.capacity}` },
              ].map(item => (
                <div key={item.label} className={`flex justify-between text-sm border-b last:border-0 pb-2 ${isDark ? 'border-[#394239]' : 'border-[#DDE1D8]'}`}>
                  <span className={textMuted}>{item.label}</span>
                  <span className={`font-semibold capitalize ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>{item.value || '—'}</span>
                </div>
              ))}
            </div>

            {/* Occupancy bar */}
            <div className="mt-5">
              <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-[#292F29]' : 'bg-[#ECECE4]'}`}>
                <div
                  className="h-full rounded-full bg-[#526B52] dark:bg-[#A3B18A] transition-all"
                  style={{ width: `${((roomData.currentOccupants?.length || 0) / (roomData.capacity || 1)) * 100}%` }}
                />
              </div>
            </div>
          </motion.div>

          {/* Roommates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-2xl border p-6 lg:col-span-2 ${cardBg}`}
          >
            <h3 className={`font-bold mb-4 tracking-tight ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>
              <span className="flex items-center gap-2"><Users className="w-4 h-4 text-[#526B52] dark:text-[#A3B18A]" /> Roommates</span>
            </h3>
            <div className="space-y-3">
              {(roomData.currentOccupants || []).map((m, i) => (
                <div key={m._id || i} className={`flex items-center gap-3 py-2.5 border-b last:border-0 ${isDark ? 'border-[#394239]' : 'border-[#DDE1D8]'}`}>
                  {m.avatar ? (
                    <img src={m.avatar} alt={m.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#526B52] dark:bg-[#A3B18A] flex items-center justify-center text-white dark:text-[#171C18] text-sm font-bold flex-shrink-0">
                      {getInitials(m.name || '')}
                    </div>
                  )}
                  <div>
                    <p className={`font-semibold text-sm ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>{m.name}</p>
                    <p className={`text-xs ${textMuted}`}>{m.phone || m.email}</p>
                  </div>
                  <div className="ml-auto">
                    <p className={`text-xs font-medium ${textMuted}`}>Joined {formatDate(m.joinDate)}</p>
                  </div>
                </div>
              ))}
              {(roomData.currentOccupants || []).length === 0 && (
                <p className={`text-sm ${textMuted}`}>No other occupants.</p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
