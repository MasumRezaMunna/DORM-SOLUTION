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
import funToast from '../../utils/funToast';

const PRIORITY_ICONS = {
  low: { icon: Info, color: 'text-[#0D9488] bg-[#0D9488]/10 dark:text-[#2DD4BF]' },
  medium: { icon: Bell, color: 'text-[#526B52] bg-[#E8EDE3] dark:text-[#A3B18A] dark:bg-[#303A30]' },
  high: { icon: AlertTriangle, color: 'text-amber-600 bg-amber-500/10 dark:text-amber-400' },
  urgent: { icon: Megaphone, color: 'text-rose-600 bg-rose-500/10 dark:text-rose-400' },
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

  const invalidateNoticeData = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTICES });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_MEMBER });
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/notices', payload);
      return data;
    },
    onSuccess: () => {
      invalidateNoticeData();
      setIsModalOpen(false);
      setForm({ title: '', content: '', priority: 'medium', isPinned: false });
      funToast.noticeSuccess('নোটিশ পাবলিশ হয়েছে! সবাই অ্যালার্ট! 📢');
    },
    onError: (err) => funToast.error(err, 'নোটিশ তৈরি করা যায়নি।'),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => api.put(`/notices/${editingId}`, data),
    onSuccess: () => {
      invalidateNoticeData();
      funToast.noticeSuccess('Done, boss! নোটিশ আপডেট সফল! 📌');
      setIsModalOpen(false);
      setEditingId(null);
      setForm({ title: '', content: '', priority: 'medium', isPinned: false });
    },
    onError: (err) => funToast.error(err, 'নোটিশ আপডেট করা যায়নি।')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/notices/${id}`),
    onSuccess: () => {
      invalidateNoticeData();
      funToast.success('নোটিশ মুছে ফেলা হয়েছে! 🗑️');
    },
    onError: (err) => funToast.error(err, 'নোটিশ মোছা যায়নি।')
  });

  const cardBg = isDark ? 'bg-[#202720] border-[#394239]' : 'bg-white border-[#DDE1D8] shadow-sm';
  const inputClass = `w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors border-[#DDE1D8] dark:border-[#394239] bg-white dark:bg-[#202720] text-[#202720] dark:text-[#F0F1E9] placeholder:text-[#687168]/60 dark:placeholder:text-[#B1B8AC]/60 focus:border-[#748D6B] dark:focus:border-[#A3B18A] focus:ring-1 focus:ring-[#748D6B] dark:focus:ring-[#A3B18A]`;

  return (
    <div className="space-y-6">
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#526B52] hover:bg-[#405640] dark:bg-[#A3B18A] dark:hover:bg-[#BAC7A8] text-white dark:text-[#171C18] text-sm font-bold shadow-sm transition-all"
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
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>Title</label>
            <input
              required
              placeholder="Notice title..."
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>Content</label>
            <textarea
              required
              placeholder="Notice content..."
              rows={4}
              value={form.content}
              onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              className={`${inputClass} resize-none`}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <select
                value={form.priority}
                onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                className={`${inputClass} w-auto`}
              >
                {['low', 'medium', 'high', 'urgent'].map(p => (
                  <option key={p} value={p} className={isDark ? 'bg-[#202720] text-[#F0F1E9]' : 'bg-white text-[#202720]'}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.isPinned}
                  onChange={e => setForm(p => ({ ...p, isPinned: e.target.checked }))}
                  className="w-4 h-4 rounded accent-[#526B52] dark:accent-[#A3B18A]"
                />
                <span className={`text-sm font-medium ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>Pin to top</span>
              </label>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
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
                disabled={!form.title || !form.content || createMutation.isPending || updateMutation.isPending}
                className="px-6 py-2.5 rounded-xl bg-[#526B52] hover:bg-[#405640] dark:bg-[#A3B18A] dark:hover:bg-[#BAC7A8] text-white dark:text-[#171C18] text-sm font-bold shadow-sm transition-all disabled:opacity-50"
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
              <div className={`h-5 w-48 rounded mb-2 ${isDark ? 'bg-[#292F29]' : 'bg-[#ECECE4]'}`} />
              <div className={`h-3 w-full rounded ${isDark ? 'bg-[#292F29]' : 'bg-[#ECECE4]'}`} />
            </div>
          ))
        ) : notices.length === 0 ? (
          <div className={`text-center py-16 rounded-2xl border ${cardBg}`}>
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-30 text-[#687168] dark:text-[#B1B8AC]" />
            <p className="text-sm font-medium text-[#687168] dark:text-[#B1B8AC]">No notices yet. Create your first one!</p>
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
                className={`rounded-2xl border p-5 transition-all ${cardBg} ${notice.isPinned ? 'border-[#526B52]/40 dark:border-[#A3B18A]/40 bg-[#F5F4EE]/40 dark:bg-[#292F29]/40' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {notice.isPinned && (
                        <Pin className="w-3.5 h-3.5 text-[#526B52] dark:text-[#A3B18A] flex-shrink-0" />
                      )}
                      <h4 className={`font-bold text-sm tracking-tight ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>{notice.title}</h4>
                      <div className="ml-auto flex items-center gap-3">
                        <span className={`text-xs font-medium ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>
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
                          className="p-1 rounded-lg text-[#526B52] hover:bg-[#E8EDE3] dark:text-[#A3B18A] dark:hover:bg-[#303A30] transition-colors"
                          title="Edit notice"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this notice?')) {
                              deleteMutation.mutate(notice._id);
                            }
                          }}
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 dark:text-rose-400 transition-colors"
                          title="Delete notice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className={`text-sm leading-relaxed ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>{notice.content}</p>
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
