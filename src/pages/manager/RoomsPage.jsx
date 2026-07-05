import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { DoorOpen, Plus, Users, UserPlus, UserMinus, Edit, Trash2 } from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import Modal from '../../components/shared/Modal';
import { useTheme } from '../../contexts/ThemeContext';
import { getInitials } from '../../utils/helpers';
import api from '../../config/axios';
import { QUERY_KEYS, ROOM_TYPES } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function RoomsPage() {
  const { isDark } = useTheme();
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [assignMemberId, setAssignMemberId] = useState('');

  const emptyForm = { roomNumber: '', floor: '', type: 'single', capacity: 1, rent: '' };
  const [formData, setFormData] = useState(emptyForm);

  const cardBg = isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200 shadow-sm';
  const inputCls = `w-full px-4 py-2.5 rounded-xl border outline-none focus:border-purple-500 transition-colors ${
    isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
  }`;
  const labelCls = `block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`;

  /* ── Queries ──────────────────────────────────────────────────────── */
  const { data: rooms = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.ROOMS,
    queryFn: async () => {
      const { data } = await api.get('/rooms');
      return data.data || [];
    },
    placeholderData: [],
  });

  const { data: members = [] } = useQuery({
    queryKey: QUERY_KEYS.MEMBERS,
    queryFn: async () => {
      const { data } = await api.get('/members');
      return data.data || [];
    },
    placeholderData: [],
  });

  // Members that aren't assigned to any room yet
  const unassignedMembers = members.filter(
    m => m.status === 'active' && !m.roomId
  );

  const filtered = filter === 'all' ? rooms : rooms.filter(r => r.status === filter);

  /* ── Mutations ────────────────────────────────────────────────────── */
  const addMutation = useMutation({
    mutationFn: (room) => api.post('/rooms', room),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROOMS });
      toast.success('Room added!');
      setIsModalOpen(false);
      setFormData(emptyForm);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add room'),
  });

  const updateMutation = useMutation({
    mutationFn: (room) => api.put(`/rooms/${editingRoom}`, room),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROOMS });
      toast.success('Room updated!');
      setIsModalOpen(false);
      setEditingRoom(null);
      setFormData(emptyForm);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update room'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/rooms/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROOMS });
      toast.success('Room deleted!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Cannot delete room'),
  });

  const assignMutation = useMutation({
    mutationFn: ({ roomId, memberId }) => api.put(`/rooms/${roomId}/assign`, { memberId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROOMS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEMBERS });
      toast.success('Member assigned to room!');
      setAssignMemberId('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to assign member'),
  });

  const vacateMutation = useMutation({
    mutationFn: ({ roomId, memberId }) => api.put(`/rooms/${roomId}/vacate`, { memberId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROOMS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEMBERS });
      toast.success('Member removed from room!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to remove member'),
  });

  /* ── Helpers ──────────────────────────────────────────────────────── */
  const getMemberName = (memberId) => {
    const m = members.find(x => x._id === memberId || x._id === memberId?._id);
    return m?.userId?.displayName || memberId?.userId?.displayName || 'Unknown';
  };

  const getMemberObj = (memberId) => {
    return members.find(x => x._id === memberId || x._id === memberId?._id) || memberId;
  };

  /* ── Render ───────────────────────────────────────────────────────── */
  return (
    <div className="space-y-5">
      <PageHeader
        title="Rooms"
        subtitle={`${rooms.length} rooms · ${rooms.filter(r => r.status === 'available').length} available`}
        action={
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditingRoom(null);
              setFormData(emptyForm);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold shadow-lg shadow-purple-900/30"
          >
            <Plus className="w-4 h-4" />
            Add Room
          </motion.button>
        }
      />

      {/* Filter tabs */}
      <div className={`inline-flex items-center gap-1 p-1 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
        {['all', 'available', 'occupied'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
              filter === tab
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`rounded-2xl border p-5 animate-pulse ${cardBg}`}>
              <div className={`h-4 w-24 rounded mb-3 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
              <div className={`h-6 w-12 rounded mb-2 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
              <div className={`h-3 w-full rounded ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
            </div>
          ))
          : filtered.length === 0
          ? (
            <div className={`col-span-full text-center py-16 rounded-2xl border ${cardBg}`}>
              <DoorOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No rooms found</p>
            </div>
          )
          : filtered.map((room, i) => {
            const occupantCount = room.members?.length || 0;
            const hasSpace = occupantCount < (room.capacity || 1);
            return (
              <motion.div
                key={room._id || i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-2xl border p-5 transition-all group ${cardBg}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${room.status === 'available' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                    <DoorOpen className={`w-5 h-5 ${room.status === 'available' ? 'text-emerald-400' : 'text-red-400'}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={room.status || 'available'} />
                    <button
                      onClick={() => {
                        setEditingRoom(room._id);
                        setFormData({
                          roomNumber: room.roomNumber,
                          floor: room.floor,
                          type: room.type,
                          capacity: room.capacity,
                          rent: room.rent,
                        });
                        setIsModalOpen(true);
                      }}
                      className="p-1 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (occupantCount > 0) return toast.error('Remove all members first');
                        if (window.confirm('Delete this room?')) deleteMutation.mutate(room._id);
                      }}
                      className="p-1 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Room {room.roomNumber}
                </p>
                <p className={`text-xs capitalize mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {room.type || 'standard'} · Floor {room.floor || 1} · ৳{room.rent}/seat
                </p>

                {/* Occupancy bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {occupantCount}/{room.capacity || 1} occupants
                      </span>
                    </div>
                  </div>
                  <div className={`w-full h-1.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                    <div
                      className={`h-full rounded-full transition-all ${room.status === 'available' ? 'bg-emerald-500' : 'bg-red-500'}`}
                      style={{ width: `${(occupantCount / (room.capacity || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Current occupants */}
                {occupantCount > 0 && (
                  <div className={`space-y-1.5 mb-3 pt-3 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                    <p className={`text-[10px] uppercase tracking-wider font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Occupants</p>
                    {room.members.map(memberId => {
                      const mObj = getMemberObj(memberId);
                      const name = mObj?.userId?.displayName || 'Unknown';
                      const mid = mObj?._id || memberId;
                      return (
                        <div key={mid} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                              {getInitials(name)}
                            </div>
                            <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{name}</span>
                          </div>
                          <button
                            onClick={() => {
                              if (window.confirm(`Remove ${name} from Room ${room.roomNumber}?`)) {
                                vacateMutation.mutate({ roomId: room._id, memberId: mid });
                              }
                            }}
                            className="p-1 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Assign button */}
                {hasSpace && (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setSelectedRoom(room);
                      setAssignMemberId('');
                      setIsAssignModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Assign Member
                  </motion.button>
                )}
              </motion.div>
            );
          })
        }
      </div>

      {/* ── Add / Edit Room Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRoom ? 'Edit Room' : 'Add New Room'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const payload = { ...formData, floor: Number(formData.floor), rent: Number(formData.rent) };
            if (editingRoom) updateMutation.mutate(payload);
            else addMutation.mutate(payload);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Room Number</label>
              <input
                type="text" required
                value={formData.roomNumber}
                onChange={e => setFormData({ ...formData, roomNumber: e.target.value })}
                className={inputCls}
                placeholder="e.g. 101"
              />
            </div>
            <div>
              <label className={labelCls}>Floor</label>
              <input
                type="number" required
                value={formData.floor}
                onChange={e => setFormData({ ...formData, floor: e.target.value })}
                className={inputCls}
                placeholder="e.g. 1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Type</label>
              <select
                value={formData.type}
                onChange={e => {
                  const capacity = ROOM_TYPES.find(r => r.value === e.target.value)?.capacity || 1;
                  setFormData({ ...formData, type: e.target.value, capacity });
                }}
                className={inputCls}
              >
                {ROOM_TYPES.map(rt => (
                  <option key={rt.value} value={rt.value}>{rt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Capacity</label>
              <input type="number" required disabled value={formData.capacity}
                className={`${inputCls} opacity-70`} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Rent per Seat (৳)</label>
            <input
              type="number" required
              value={formData.rent}
              onChange={e => setFormData({ ...formData, rent: e.target.value })}
              className={inputCls}
              placeholder="Rent amount"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
              Cancel
            </button>
            <button type="submit"
              disabled={addMutation.isPending || updateMutation.isPending}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold shadow-lg disabled:opacity-50">
              {addMutation.isPending || updateMutation.isPending ? 'Saving...' : (editingRoom ? 'Save Changes' : 'Add Room')}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Assign Member Modal ── */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Assign to Room ${selectedRoom?.roomNumber || ''}`}
      >
        <div className="space-y-4">
          {/* Room info */}
          {selectedRoom && (
            <div className={`rounded-xl border px-4 py-3 ${isDark ? 'bg-slate-800 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <DoorOpen className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Room {selectedRoom.roomNumber}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {selectedRoom.members?.length || 0}/{selectedRoom.capacity} occupied · {selectedRoom.capacity - (selectedRoom.members?.length || 0)} slot(s) left
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Member dropdown */}
          <div>
            <label className={labelCls}>Select Member</label>
            {unassignedMembers.length === 0 ? (
              <div className={`text-sm px-4 py-3 rounded-xl border ${isDark ? 'border-white/10 bg-slate-800 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                All active members are already assigned to a room.
              </div>
            ) : (
              <select
                value={assignMemberId}
                onChange={e => setAssignMemberId(e.target.value)}
                className={inputCls}
              >
                <option value="">-- Choose a member --</option>
                {unassignedMembers.map(m => (
                  <option key={m._id} value={m._id}>
                    {m.userId?.displayName || 'Unknown'} ({m.userId?.email || '—'})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsAssignModalOpen(false)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
              Cancel
            </button>
            <button
              disabled={!assignMemberId || assignMutation.isPending}
              onClick={() => {
                assignMutation.mutate({ roomId: selectedRoom._id, memberId: assignMemberId });
              }}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold shadow-lg disabled:opacity-50"
            >
              {assignMutation.isPending ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
