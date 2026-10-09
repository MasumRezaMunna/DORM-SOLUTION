import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MessageSquareWarning, PlusCircle, Clock, CheckCircle2 } from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import Modal from '../../components/shared/Modal';
import { useTheme } from '../../contexts/ThemeContext';
import { formatRelativeTime } from '../../utils/helpers';
import api from '../../config/axios';
import { QUERY_KEYS, COMPLAINT_TYPES } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function MyComplaintsPage() {
  const { isDark } = useTheme();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'maintenance', priority: 'medium' });

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.MY_COMPLAINTS,
    queryFn: async () => {
      const { data } = await api.get('/complaints/my');
      return data.data || [];
    },
    placeholderData: [],
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      await api.post('/complaints', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_COMPLAINTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMPLAINTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_MANAGER });
      setIsModalOpen(false);
      setForm({ title: '', description: '', type: 'maintenance', priority: 'medium' });
      toast.success('Complaint submitted successfully!');
    },
    onError: () => toast.error('Failed to submit complaint.'),
  });

  const cardBg = isDark ? 'bg-[#202720] border-[#394239]' : 'bg-white border-[#DDE1D8] shadow-sm';
  const textMuted = isDark ? 'text-[#B1B8AC]' : 'text-[#687168]';
  const inputClass = `w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors border-[#DDE1D8] dark:border-[#394239] bg-white dark:bg-[#202720] text-[#202720] dark:text-[#F0F1E9] placeholder:text-[#687168]/60 dark:placeholder:text-[#B1B8AC]/60 focus:border-[#748D6B] dark:focus:border-[#A3B18A] focus:ring-1 focus:ring-[#748D6B] dark:focus:ring-[#A3B18A]`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Complaints"
        subtitle="Report issues and track their resolution"
        action={
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#526B52] hover:bg-[#405640] dark:bg-[#A3B18A] dark:hover:bg-[#BAC7A8] text-white dark:text-[#171C18] text-sm font-bold shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            New Complaint
          </motion.button>
        }
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit a Complaint"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(form);
          }}
          className="space-y-4"
        >
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>Issue Title</label>
            <input required placeholder="Brief title..." value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} className={inputClass} />
          </div>
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>Description</label>
            <textarea required rows={4} placeholder="Describe the issue in detail..." value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} className={`${inputClass} resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>Type</label>
              <select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))} className={inputClass}>
                {COMPLAINT_TYPES.map(t => <option key={t.value} value={t.value} className={isDark ? 'bg-[#202720] text-[#F0F1E9]' : 'bg-white text-[#202720]'}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>Priority</label>
              <select value={form.priority} onChange={e => setForm(p => ({...p, priority: e.target.value}))} className={inputClass}>
                {['low', 'medium', 'high'].map(p => <option key={p} value={p} className={isDark ? 'bg-[#202720] text-[#F0F1E9]' : 'bg-white text-[#202720]'}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${isDark ? 'text-[#B1B8AC] hover:bg-[#292F29]' : 'text-[#687168] hover:bg-[#ECECE4]'}`}
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              disabled={!form.title || !form.description || createMutation.isPending}
              className="px-6 py-2.5 rounded-xl bg-[#526B52] hover:bg-[#405640] dark:bg-[#A3B18A] dark:hover:bg-[#BAC7A8] text-white dark:text-[#171C18] text-sm font-bold shadow-sm transition-all disabled:opacity-50"
            >
              {createMutation.isPending ? 'Submitting...' : 'Submit'}
            </motion.button>
          </div>
        </form>
      </Modal>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`rounded-2xl border p-5 animate-pulse ${cardBg}`}>
              <div className={`h-5 w-48 rounded mb-2 ${isDark ? 'bg-[#292F29]' : 'bg-[#ECECE4]'}`} />
              <div className={`h-3 w-full rounded ${isDark ? 'bg-[#292F29]' : 'bg-[#ECECE4]'}`} />
            </div>
          ))
        ) : complaints.length === 0 ? (
          <div className={`text-center py-16 rounded-2xl border ${cardBg}`}>
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-30 text-[#526B52] dark:text-[#A3B18A]" />
            <p className="text-sm font-medium text-[#687168] dark:text-[#B1B8AC]">No complaints submitted yet.</p>
          </div>
        ) : (
          complaints.map((c, i) => (
            <motion.div
              key={c._id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-2xl border p-5 transition-all ${cardBg}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${c.status === 'open' ? 'bg-amber-500/10 text-amber-500 dark:text-amber-400' : 'bg-[#E8EDE3] dark:bg-[#303A30] text-[#526B52] dark:text-[#A3B18A]'}`}>
                  {c.status === 'open' ? <Clock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h4 className={`font-bold text-sm tracking-tight ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>{c.title}</h4>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'} mb-2`}>{c.description}</p>
                  <p className={`text-xs font-medium ${textMuted} capitalize`}>{c.type} · {formatRelativeTime(c.createdAt)}</p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
