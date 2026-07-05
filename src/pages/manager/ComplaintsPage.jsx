import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MessageSquareWarning, CheckCircle2, Clock, AlertCircle, Edit, Trash2 } from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import Modal from '../../components/shared/Modal';
import { useTheme } from '../../contexts/ThemeContext';
import { formatRelativeTime } from '../../utils/helpers';
import api from '../../config/axios';
import { QUERY_KEYS } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function ComplaintsPage() {
  const { isDark } = useTheme();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', type: 'maintenance' });

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.COMPLAINTS,
    queryFn: async () => {
      const { data } = await api.get('/complaints');
      return data.data || [];
    },
    placeholderData: [],
  });

  const resolveMutation = useMutation({
    mutationFn: async (id) => {
      await api.patch(`/complaints/${id}`, { status: 'resolved' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(QUERY_KEYS.COMPLAINTS);
      toast.success('Complaint marked as resolved!');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => api.put(`/complaints/${editingId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMPLAINTS });
      toast.success('Complaint updated successfully!');
      setIsModalOpen(false);
      setEditingId(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/complaints/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMPLAINTS });
      toast.success('Complaint deleted successfully!');
    }
  });

  const filtered = statusFilter === 'all' ? complaints : complaints.filter(c => c.status === statusFilter);

  const cardBg = isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200 shadow-sm';
  const inputClass = `w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:border-purple-500 ${
    isDark ? 'bg-slate-800 border-white/10 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400'
  }`;
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';

  const PRIORITY_COLOR = { low: 'text-blue-400', medium: 'text-amber-400', high: 'text-red-400' };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Complaints"
        subtitle={`${complaints.filter(c => c.status === 'open').length} open complaints requiring attention`}
      />

      <div className={`inline-flex items-center gap-1 p-1 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
        {['all', 'open', 'resolved'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
              statusFilter === s
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`rounded-2xl border p-5 animate-pulse ${cardBg}`}>
              <div className={`h-5 w-64 rounded mb-2 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
              <div className={`h-3 w-full rounded ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className={`text-center py-16 rounded-2xl border ${cardBg}`}>
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-30 text-emerald-400" />
            <p className={textMuted}>No complaints in this category. All good! 🎉</p>
          </div>
        ) : (
          filtered.map((c, i) => (
            <motion.div
              key={c._id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-2xl border p-5 ${cardBg}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${c.status === 'open' ? 'bg-amber-500/10' : 'bg-emerald-500/10'}`}>
                    {c.status === 'open' ? (
                      <Clock className="w-4 h-4 text-amber-400" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{c.title}</h4>
                      <StatusBadge status={c.status} />
                      {c.priority && (
                        <span className={`text-xs font-medium capitalize ${PRIORITY_COLOR[c.priority] || 'text-slate-400'}`}>
                          {c.priority} priority
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'} mb-2 line-clamp-2`}>{c.description}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`text-xs ${textMuted}`}>
                        {c.memberId?.userId?.displayName || 'Unknown'}
                      </span>
                      <span className={`text-xs ${textMuted}`}>{c.type}</span>
                      <span className={`text-xs ${textMuted}`}>{formatRelativeTime(c.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {c.status === 'open' && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => resolveMutation.mutate(c._id)}
                      className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                    >
                      Resolve
                    </motion.button>
                  )}
                  <div className="flex gap-1 mt-auto">
                    <button
                      onClick={() => {
                        setEditingId(c._id);
                        setForm({
                          title: c.title,
                          description: c.description,
                          priority: c.priority,
                          type: c.type
                        });
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this complaint?')) deleteMutation.mutate(c._id);
                      }}
                      className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Complaint"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateMutation.mutate(form);
          }}
          className="space-y-4"
        >
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Title</label>
            <input
              required
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Description</label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className={`${inputClass} resize-none`}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Type</label>
              <select
                value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className={inputClass}
              >
                {['maintenance', 'security', 'cleaning', 'noise', 'other'].map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                className={inputClass}
              >
                {['low', 'medium', 'high', 'urgent'].map(p => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold shadow-lg disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
