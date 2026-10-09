import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { User, Phone, Briefcase, FileText, HeartPulse, Save, DoorOpen } from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/axios';
import { QUERY_KEYS } from '../../utils/constants';
import toast from 'react-hot-toast';
import funToast from '../../utils/funToast';

export default function ProfilePage() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    displayName: user?.name || '',
    phone: '',
    nid: '',
    occupation: '',
    emergencyContact: { name: '', phone: '', relation: '' }
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['myProfile', user?._id],
    queryFn: async () => {
      const { data } = await api.get('/members/me');
      return data.data;
    },
  });

  useEffect(() => {
    if (profile) {
      setForm({
        displayName: user?.name || profile?.userId?.displayName || '',
        phone: profile.phone || '',
        nid: profile.nid || '',
        occupation: profile.occupation || '',
        emergencyContact: profile.emergencyContact || { name: '', phone: '', relation: '' }
      });
    }
  }, [profile, user]);

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.put('/members/me', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEMBERS });
      queryClient.invalidateQueries({ queryKey: ['communityStats'] });
      queryClient.invalidateQueries({ queryKey: ['room', 'my'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROOMS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_MEMBER });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_MANAGER });
      funToast.profileSuccess('প্রোফাইল আপডেট হয়েছে! একদম চকচকে! ✨');
    },
    onError: (err) => funToast.error(err, 'প্রোফাইল আপডেট করা যায়নি।'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  const cardBg = isDark ? 'bg-[#202720] border-[#394239]' : 'bg-white border-[#DDE1D8] shadow-sm';
  const inputClass = `w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors border-[#DDE1D8] dark:border-[#394239] bg-white dark:bg-[#202720] text-[#202720] dark:text-[#F0F1E9] placeholder:text-[#687168]/60 dark:placeholder:text-[#B1B8AC]/60 focus:border-[#748D6B] dark:focus:border-[#A3B18A] focus:ring-1 focus:ring-[#748D6B] dark:focus:ring-[#A3B18A]`;
  const labelClass = `block text-xs font-semibold mb-1.5 ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`;

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="My Profile" subtitle="Update your personal and emergency information" />

      {isLoading ? (
        <div className={`rounded-2xl border p-8 animate-pulse ${cardBg}`}>
          <div className={`h-8 w-32 rounded mb-4 ${isDark ? 'bg-[#292F29]' : 'bg-[#ECECE4]'}`} />
          <div className={`h-4 w-full rounded mb-2 ${isDark ? 'bg-[#292F29]' : 'bg-[#ECECE4]'}`} />
          <div className={`h-4 w-2/3 rounded ${isDark ? 'bg-[#292F29]' : 'bg-[#ECECE4]'}`} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Basic Info */}
          <div className={`rounded-2xl border p-6 ${cardBg}`}>
            <h3 className={`flex items-center gap-2 font-bold tracking-tight mb-5 ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>
              <User className="w-4 h-4 text-[#526B52] dark:text-[#A3B18A]" /> Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Full Name</label>
                <input
                  type="text"
                  value={form.displayName}
                  onChange={e => setForm(prev => ({ ...prev, displayName: e.target.value }))}
                  className={inputClass}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className={labelClass}>Email Address (Cannot be changed)</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className={`${inputClass} opacity-60 cursor-not-allowed`}
                />
              </div>
              <div>
                <label className={labelClass}>Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-[#687168] dark:text-[#B1B8AC]" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                    className={`${inputClass} pl-10`}
                    placeholder="e.g. +8801700000000"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>NID / Passport Number</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-2.5 w-4 h-4 text-[#687168] dark:text-[#B1B8AC]" />
                  <input
                    type="text"
                    value={form.nid}
                    onChange={e => setForm(prev => ({ ...prev, nid: e.target.value }))}
                    className={`${inputClass} pl-10`}
                    placeholder="National ID"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Occupation</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-[#687168] dark:text-[#B1B8AC]" />
                  <input
                    type="text"
                    value={form.occupation}
                    onChange={e => setForm(prev => ({ ...prev, occupation: e.target.value }))}
                    className={`${inputClass} pl-10`}
                    placeholder="Student / Engineer / Business"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Assigned Room</label>
                <div className="relative">
                  <DoorOpen className="absolute left-3 top-2.5 w-4 h-4 text-[#687168] dark:text-[#B1B8AC]" />
                  <input
                    type="text"
                    disabled
                    value={profile?.roomId ? `Room ${profile.roomId.roomNumber} (Floor ${profile.roomId.floor})` : 'Not assigned'}
                    className={`${inputClass} pl-10 opacity-70 cursor-not-allowed`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className={`rounded-2xl border p-6 ${cardBg}`}>
            <h3 className={`flex items-center gap-2 font-bold tracking-tight mb-5 ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>
              <HeartPulse className="w-4 h-4 text-rose-500" /> Emergency Contact
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Contact Name</label>
                <input
                  type="text"
                  value={form.emergencyContact.name}
                  onChange={e => setForm(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, name: e.target.value } }))}
                  className={inputClass}
                  placeholder="Relative's name"
                />
              </div>
              <div>
                <label className={labelClass}>Relation</label>
                <input
                  type="text"
                  value={form.emergencyContact.relation}
                  onChange={e => setForm(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, relation: e.target.value } }))}
                  className={inputClass}
                  placeholder="e.g. Father, Mother, Brother"
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Phone Number</label>
                <input
                  type="tel"
                  value={form.emergencyContact.phone}
                  onChange={e => setForm(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, phone: e.target.value } }))}
                  className={inputClass}
                  placeholder="Emergency phone number"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={updateMutation.isPending}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#526B52] hover:bg-[#405640] dark:bg-[#A3B18A] dark:hover:bg-[#BAC7A8] text-white dark:text-[#171C18] text-sm font-bold shadow-sm transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {updateMutation.isPending ? 'Saving...' : 'Save Profile'}
            </motion.button>
          </div>
        </form>
      )}
    </div>
  );
}
