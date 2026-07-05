import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { User, Phone, Briefcase, FileText, HeartPulse, Save, DoorOpen } from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/axios';
import toast from 'react-hot-toast';

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
      toast.success('Profile updated successfully!');
    },
    onError: () => toast.error('Failed to update profile.')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  const cardBg = isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200 shadow-sm';
  const inputClass = `w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:border-purple-500 ${
    isDark ? 'bg-slate-800 border-white/10 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400'
  }`;
  const labelClass = `block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`;

  return (
    <div className="space-y-5 max-w-3xl">
      <PageHeader title="My Profile" subtitle="Update your personal and emergency information" />

      {isLoading ? (
        <div className={`rounded-2xl border p-8 animate-pulse ${cardBg}`}>
          <div className={`h-8 w-32 rounded mb-4 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
          <div className={`h-4 w-full rounded mb-2 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
          <div className={`h-4 w-2/3 rounded ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Basic Info */}
          <div className={`rounded-2xl border p-6 ${cardBg}`}>
            <h3 className={`flex items-center gap-2 font-semibold mb-5 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              <User className="w-4 h-4 text-purple-400" /> Basic Information
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
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
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
                  <FileText className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
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
                  <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
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
                  <DoorOpen className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
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
            <h3 className={`flex items-center gap-2 font-semibold mb-5 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              <HeartPulse className="w-4 h-4 text-red-400" /> Emergency Contact
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
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
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
