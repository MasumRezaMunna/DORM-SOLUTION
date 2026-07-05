import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { PlusCircle, Bell, Pin, Trash2, AlertTriangle, Info, Megaphone, Edit } from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import Modal from '../../components/shared/Modal';
import { useTheme } from '../../contexts/ThemeContext';
import { formatRelativeTime } from '../../utils/helpers';
import api from '../../config/axios';
import { QUERY_KEYS } from '../../utils/constants';
import toast from 'react-hot-toast';

const PRIORITY_ICONS = {
  low: { icon: Info, color: 'text-blue-400 bg-blue-500/10' },
  medium: { icon: Bell, color: 'text-purple-400 bg-purple-500/10' },
  high: { icon: AlertTriangle, color: 'text-amber-400 bg-amber-500/10' },
  urgent: { icon: Megaphone, color: 'text-red-400 bg-red-500/10' },
};

export default function NoticesPage() {
  const { isDark } = useTheme();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', priority: 'medium', isPinned: false });

  const { data: notices = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.NOTICES,
    queryFn: async () => {
      const { data } = await api.get('/notices');
      return data.data || [];
    },
    placeholderData: [],
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/notices', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTICES });
      setIsModalOpen(false);
      setForm({ title: '', content: '', priority: 'medium', isPinned: false });
      toast.success('Notice published!');
    },
    onError: () => toast.error('Failed to create notice.'),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => api.put(`/notices/${editingId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTICES });
      toast.success('Notice updated successfully!');
      setIsModalOpen(false);
      setEditingId(null);
      setForm({ title: '', content: '', priority: 'medium', isPinned: false });
    },
    onError: () => toast.error('Failed to update notice.')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/notices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTICES });
      toast.success('Notice deleted successfully!');
    },
    onError: () => toast.error('Failed to delete notice.')
  });

  const cardBg = isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200 shadow-sm';
  const inputClass = `w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:border-purple-500 ${
    isDark ? 'bg-slate-800 border-white/10 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400'
  }`;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notice Board"
        subtitle="Post announcements and important updates for all members"
        action={
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditingId(null);
              setForm({ title: '', content: '', priority: 'medium', isPinned: false });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold shadow-lg"
          >
            <PlusCircle className="w-4 h-4" />
            New Notice
          </motion.button>
        }
      />

      {/* Create form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Notice" : "Create Notice"}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (editingId) {
              updateMutation.mutate(form);
            } else {
              createMutation.mutate(form);
            }
          }}
          className="space-y-4"
        >
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Title</label>
            <input
              required
              placeholder="Notice title..."
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Content</label>
            <textarea
              required
              placeholder="Notice content..."
              rows={4}
              value={form.content}
              onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              className={`${inputClass} resize-none`}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <select
                value={form.priority}
                onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                className={`${inputClass} w-auto`}
              >
                {['low', 'medium', 'high', 'urgent'].map(p => (
                  <option key={p} value={p} className={isDark ? 'bg-slate-800' : 'bg-white'}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPinned}
                  onChange={e => setForm(p => ({ ...p, isPinned: e.target.checked }))}
                  className="w-4 h-4 accent-purple-500"
                />
                <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Pin to top</span>
              </label>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button type="button" onClick={() => setIsModalOpen(false)} className={`px-4 py-2 rounded-xl text-sm ${isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100'}`}>Cancel</button>
              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                disabled={!form.title || !form.content || createMutation.isPending || updateMutation.isPending}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending ? 'Publishing...' : (editingId ? 'Save Changes' : 'Publish Notice')}
              </motion.button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Notices list */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`rounded-2xl border p-5 animate-pulse ${cardBg}`}>
              <div className={`h-5 w-48 rounded mb-2 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
              <div className={`h-3 w-full rounded ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
            </div>
          ))
        ) : notices.length === 0 ? (
          <div className={`text-center py-16 rounded-2xl border ${cardBg}`}>
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No notices yet. Create your first one!</p>
          </div>
        ) : (
          [...notices].sort((a,b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)).map((notice, i) => {
            const { icon: Icon, color } = PRIORITY_ICONS[notice.priority] || PRIORITY_ICONS.medium;
            return (
              <motion.div
                key={notice._id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-2xl border p-5 ${cardBg} ${notice.isPinned ? 'border-purple-500/40' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {notice.isPinned && (
                        <Pin className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      )}
                      <h4 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{notice.title}</h4>
                      <div className="ml-auto flex items-center gap-3">
                        <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {formatRelativeTime(notice.createdAt)}
                        </span>
                        <button
                          onClick={() => {
                            setEditingId(notice._id);
                            setForm({
                              title: notice.title,
                              content: notice.content,
                              priority: notice.priority,
                              isPinned: notice.isPinned
                            });
                            setIsModalOpen(true);
                          }}
                          className="text-blue-400 hover:text-blue-500 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this notice?')) {
                              deleteMutation.mutate(notice._id);
                            }
                          }}
                          className="text-red-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{notice.content}</p>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
