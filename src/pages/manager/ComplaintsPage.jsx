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

  const invalidateComplaintData = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMPLAINTS });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_COMPLAINTS });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_MANAGER });
  };

  const resolveMutation = useMutation({
    mutationFn: async (id) => {
      await api.patch(`/complaints/${id}`, { status: 'resolved' });
    },
    onSuccess: () => {
      invalidateComplaintData();
      toast.success('Complaint marked as resolved!');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => api.put(`/complaints/${editingId}`, data),
    onSuccess: () => {
      invalidateComplaintData();
      toast.success('Complaint updated successfully!');
      setIsModalOpen(false);
      setEditingId(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/complaints/${id}`),
    onSuccess: () => {
      invalidateComplaintData();
      toast.success('Complaint deleted successfully!');
    }
  });

  const filtered = statusFilter === 'all' ? complaints : complaints.filter(c => c.status === statusFilter);

  const cardBg = isDark ? 'bg-[#202720] border-[#394239]' : 'bg-white border-[#DDE1D8] shadow-sm';
  const inputClass = `w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors border-[#DDE1D8] dark:border-[#394239] bg-white dark:bg-[#202720] text-[#202720] dark:text-[#F0F1E9] placeholder:text-[#687168]/60 dark:placeholder:text-[#B1B8AC]/60 focus:border-[#748D6B] dark:focus:border-[#A3B18A] focus:ring-1 focus:ring-[#748D6B] dark:focus:ring-[#A3B18A]`;
  const textMuted = isDark ? 'text-[#B1B8AC]' : 'text-[#687168]';

  const PRIORITY_COLOR = {
    low: 'text-[#0D9488] dark:text-[#2DD4BF]',
    medium: 'text-amber-600 dark:text-amber-400',
    high: 'text-rose-600 dark:text-rose-400',
    urgent: 'text-rose-600 dark:text-rose-400'
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Complaints"
        subtitle={`${complaints.filter(c => c.status === 'open').length} open complaints requiring attention`}
      />

      <div className={`inline-flex items-center gap-1 p-1 rounded-xl border ${isDark ? 'bg-[#202720] border-[#394239]' : 'bg-[#ECECE4] border-[#DDE1D8]'}`}>
        {['all', 'open', 'resolved'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${
              statusFilter === s
                ? 'bg-[#526B52] dark:bg-[#A3B18A] text-white dark:text-[#171C18] shadow-sm'
                : isDark ? 'text-[#B1B8AC] hover:text-[#F0F1E9]' : 'text-[#687168] hover:text-[#202720]'
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
              <div className={`h-5 w-64 rounded mb-2 ${isDark ? 'bg-[#292F29]' : 'bg-[#ECECE4]'}`} />
              <div className={`h-3 w-full rounded ${isDark ? 'bg-[#292F29]' : 'bg-[#ECECE4]'}`} />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className={`text-center py-16 rounded-2xl border ${cardBg}`}>
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-40 text-[#526B52] dark:text-[#A3B18A]" />
            <p className="text-sm font-medium text-[#687168] dark:text-[#B1B8AC]">No complaints in this category. All good!</p>
          </div>
        ) : (
          filtered.map((c, i) => (
            <motion.div
              key={c._id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-2xl border p-5 transition-all ${cardBg}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${c.status === 'open' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-[#E8EDE3] dark:bg-[#303A30] text-[#526B52] dark:text-[#A3B18A]'}`}>
                    {c.status === 'open' ? (
                      <Clock className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h4 className={`font-bold text-sm tracking-tight ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>{c.title}</h4>
                      <StatusBadge status={c.status} />
                      {c.priority && (
                        <span className={`text-xs font-semibold capitalize ${PRIORITY_COLOR[c.priority] || 'text-[#687168] dark:text-[#B1B8AC]'}`}>
                          {c.priority} priority
                        </span>
                      )}
                    </div>
                    <p className={`text-sm leading-relaxed ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'} mb-2.5 line-clamp-2`}>{c.description}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`text-xs font-medium ${textMuted}`}>
                        {c.memberId?.userId?.displayName || 'Unknown'}
                      </span>
                      <span className={`text-xs font-medium ${textMuted}`}>•</span>
                      <span className={`text-xs font-medium ${textMuted} capitalize`}>{c.type}</span>
                      <span className={`text-xs font-medium ${textMuted}`}>•</span>
                      <span className={`text-xs font-medium ${textMuted}`}>{formatRelativeTime(c.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {c.status === 'open' && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => resolveMutation.mutate(c._id)}
                      className="flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#E8EDE3] dark:bg-[#303A30] text-[#526B52] dark:text-[#A3B18A] hover:bg-[#526B52]/20 dark:hover:bg-[#A3B18A]/20 transition-colors"
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
                      className="p-1.5 text-[#526B52] dark:text-[#A3B18A] hover:bg-[#E8EDE3] dark:hover:bg-[#303A30] rounded-lg transition-colors"
                      title="Edit complaint"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this complaint?')) deleteMutation.mutate(c._id);
                      }}
                      className="p-1.5 text-rose-500 hover:bg-rose-500/10 dark:text-rose-400 rounded-lg transition-colors"
                      title="Delete complaint"
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
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>Title</label>
            <input
              required
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>Description</label>
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
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>Type</label>
              <select
                value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className={inputClass}
              >
                {['maintenance', 'security', 'cleaning', 'noise', 'other'].map(t => (
                  <option key={t} value={t} className={isDark ? 'bg-[#202720] text-[#F0F1E9]' : 'bg-white text-[#202720]'}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                className={inputClass}
              >
                {['low', 'medium', 'high', 'urgent'].map(p => (
                  <option key={p} value={p} className={isDark ? 'bg-[#202720] text-[#F0F1E9]' : 'bg-white text-[#202720]'}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isDark ? 'text-[#B1B8AC] hover:bg-[#292F29]' : 'text-[#687168] hover:bg-[#ECECE4]'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-6 py-2.5 rounded-xl bg-[#526B52] hover:bg-[#405640] dark:bg-[#A3B18A] dark:hover:bg-[#BAC7A8] text-white dark:text-[#171C18] text-sm font-bold shadow-sm transition-all disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
