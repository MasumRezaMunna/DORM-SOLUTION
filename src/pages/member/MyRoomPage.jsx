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

  const cardBg = isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200 shadow-sm';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-5">
      <PageHeader title="My Room" subtitle="Your room details and roommates" />

      {isLoading ? (
        <div className={`rounded-2xl border p-8 animate-pulse ${cardBg}`}>
          <div className={`h-8 w-32 rounded mb-4 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
          <div className={`h-4 w-full rounded ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
        </div>
      ) : !roomData ? (
        <div className={`text-center py-16 rounded-2xl border ${cardBg}`}>
          <DoorOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className={textMuted}>You have not been assigned a room yet.</p>
          <p className={`text-sm mt-1 ${textMuted}`}>Please contact the manager.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Room Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl border p-6 lg:col-span-1 ${cardBg}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-purple-500/10">
                <DoorOpen className="w-6 h-6 text-purple-400" />
              </div>
              <StatusBadge status={roomData.status || 'occupied'} />
            </div>
            <p className={`text-4xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Room {roomData.roomNumber}
            </p>
            <p className={`text-sm capitalize mb-4 ${textMuted}`}>
              {roomData.type || 'Standard'} · Floor {roomData.floor || 1}
            </p>

            <div className="space-y-2">
              {[
                { label: 'Type', value: roomData.type },
                { label: 'Floor', value: roomData.floor },
                { label: 'Capacity', value: `${roomData.capacity} persons` },
                { label: 'Occupants', value: `${roomData.currentOccupants?.length || 0} / ${roomData.capacity}` },
              ].map(item => (
                <div key={item.label} className={`flex justify-between text-sm border-b last:border-0 pb-2 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  <span className={textMuted}>{item.label}</span>
                  <span className={`font-medium capitalize ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.value || '—'}</span>
                </div>
              ))}
            </div>

            {/* Occupancy bar */}
            <div className="mt-4">
              <div className={`w-full h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
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
            className={`rounded-2xl border p-5 lg:col-span-2 ${cardBg}`}
          >
            <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              <span className="flex items-center gap-2"><Users className="w-4 h-4 text-purple-400" /> Roommates</span>
            </h3>
            <div className="space-y-3">
              {(roomData.currentOccupants || []).map((m, i) => (
                <div key={m._id || i} className={`flex items-center gap-3 py-2 border-b last:border-0 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  {m.avatar ? (
                    <img src={m.avatar} alt={m.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {getInitials(m.name || '')}
                    </div>
                  )}
                  <div>
                    <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{m.name}</p>
                    <p className={`text-xs ${textMuted}`}>{m.phone || m.email}</p>
                  </div>
                  <div className="ml-auto">
                    <p className={`text-xs ${textMuted}`}>Joined {formatDate(m.joinDate)}</p>
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
