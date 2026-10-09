import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { UserPlus, Search, MoreVertical, DoorOpen, Shield, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import Modal from '../../components/shared/Modal';
import { useTheme } from '../../contexts/ThemeContext';
import { formatDate, getInitials } from '../../utils/helpers';
import api from '../../config/axios';
import { QUERY_KEYS } from '../../utils/constants';
import toast from 'react-hot-toast';
import { triggerConfetti } from '../../utils/confetti';

const ActionMenu = ({ row, isDark, statusMutation, roleMutation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const isManager = row.userId?.role === 'manager';
  const isActive = row.status === 'active';

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex justify-end" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1.5 rounded-lg transition-colors ${isOpen ? (isDark ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-800') : (isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500')}`}
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <div className={`absolute right-0 top-full mt-1 w-48 rounded-xl border shadow-xl z-50 py-1 ${isDark ? 'bg-[#202720] border-[#394239]' : 'bg-white border-[#DDE1D8]'}`}>
          <button
            onClick={() => {
              setIsOpen(false);
              if (window.confirm(`Mark ${row.userId?.displayName} as ${isActive ? 'Inactive' : 'Active'}?`)) {
                statusMutation.mutate({ id: row._id, status: isActive ? 'inactive' : 'active' });
              }
            }}
            className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors ${isDark ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-50 text-slate-700'}`}
          >
            {isActive ? <XCircle className="w-4 h-4 text-red-400" /> : <CheckCircle className="w-4 h-4 text-emerald-400" />}
            {isActive ? 'Deactivate Member' : 'Activate Member'}
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              if (window.confirm(`Change role of ${row.userId?.displayName} to ${isManager ? 'Member' : 'Manager'}?`)) {
                roleMutation.mutate({ id: row.userId?._id, role: isManager ? 'member' : 'manager' });
              }
            }}
            className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors ${isDark ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-50 text-slate-700'}`}
          >
            {isManager ? <ShieldAlert className="w-4 h-4 text-orange-400" /> : <Shield className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />}
            {isManager ? 'Demote to Member' : 'Promote to Manager'}
          </button>
        </div>
      )}
    </div>
  );
};

export default function MembersPage() {
  const { isDark } = useTheme();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('members');
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({ userId: '', phone: '', nid: '', occupation: '' });

  const invalidateMemberData = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEMBERS });
    queryClient.invalidateQueries({ queryKey: ['pendingUsers'] });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_MANAGER });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROOMS });
    queryClient.invalidateQueries({ queryKey: ['mealMonthlyDetail'] });
    queryClient.invalidateQueries({ queryKey: ['communityStats'] });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MARKET_ROTATION });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MARKET_SCHEDULES });
  };

  const addMutation = useMutation({
    mutationFn: (newMember) => api.post('/members', newMember),
    onSuccess: () => {
      invalidateMemberData();
      toast.success('Member added successfully!');
      triggerConfetti('member');
      setIsModalOpen(false);
      setFormData({ userId: '', phone: '', nid: '', occupation: '' });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to add member');
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.put(`/members/${id}`, { status }),
    onSuccess: () => {
      invalidateMemberData();
      toast.success('Status updated!');
    },
    onError: () => toast.error('Failed to update status')
  });

  const approveMutation = useMutation({
    mutationFn: (userId) => api.post('/members', { userId }),
    onSuccess: () => {
      invalidateMemberData();
      toast.success('Member activated successfully!');
      triggerConfetti('member');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to activate member');
    }
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => api.put(`/users/${id}/role`, { role }),
    onSuccess: () => {
      invalidateMemberData();
      toast.success('Role updated successfully!');
    },
    onError: (err) => toast.error('Failed to update role')
  });

  const { data: members = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.MEMBERS,
    queryFn: async () => {
      const { data } = await api.get('/members');
      return data.data || [];
    },
    // placeholder so UI renders even without backend
    placeholderData: [],
  });

  const { data: pendingUsers = [], isLoading: isPendingLoading } = useQuery({
    queryKey: ['pendingUsers'],
    queryFn: async () => {
      const { data } = await api.get('/users/pending');
      return data.data || [];
    },
    placeholderData: [],
  });

  const filtered = members.filter(m =>
    m.userId?.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    m.userId?.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.roomId?.roomNumber?.toString().includes(search)
  );

  const pendingFiltered = pendingUsers.filter(u => 
    u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'name',
      label: 'Member',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.userId?.photoURL ? (
            <img src={row.userId.photoURL} alt={row.userId?.displayName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#526B52] dark:bg-[#A3B18A] flex items-center justify-center text-white dark:text-[#171C18] text-xs font-bold flex-shrink-0">
              {getInitials(row.userId?.displayName || 'U')}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <p className={`font-semibold text-sm ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>{row.userId?.displayName || 'Unknown'}</p>
              {row.userId?.role === 'manager' && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#526B52] text-white dark:bg-[#A3B18A] dark:text-[#171C18] uppercase tracking-wide">Mgr</span>}
            </div>
            <p className={`text-xs ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>{row.userId?.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (row) => (
        <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{row.phone || '—'}</span>
      )
    },
    {
      key: 'room',
      label: 'Room',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <DoorOpen className="w-3.5 h-3.5 text-slate-400" />
          <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {row.roomId?.roomNumber || '—'}
          </span>
        </div>
      )
    },
    {
      key: 'joinDate',
      label: 'Joined',
      render: (row) => (
        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{formatDate(row.joinDate)}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status || 'active'} />
    },
    {
      key: 'actions',
      label: '',
      width: '60px',
      render: (row) => (
        <ActionMenu 
          row={row} 
          isDark={isDark} 
          statusMutation={statusMutation} 
          roleMutation={roleMutation} 
        />
      )
    },
  ];

  const pendingColumns = [
    {
      key: 'name',
      label: 'User',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.photoURL ? (
            <img src={row.photoURL} alt={row.displayName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#526B52] dark:bg-[#A3B18A] flex items-center justify-center text-white dark:text-[#171C18] text-xs font-bold flex-shrink-0">
              {getInitials(row.displayName || 'U')}
            </div>
          )}
          <div>
            <p className={`font-semibold text-sm ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>{row.displayName || 'Unknown'}</p>
            <p className={`text-xs ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      label: '',
      width: '120px',
      render: (row) => (
        <div className="flex justify-end">
          <button
            onClick={() => {
              if (window.confirm(`Activate ${row.displayName} as a member?`)) {
                approveMutation.mutate(row._id);
              }
            }}
            disabled={approveMutation.isPending}
            className="px-3 py-1.5 rounded-lg bg-[#E8EDE3] dark:bg-[#303A30] text-[#526B52] dark:text-[#A3B18A] hover:opacity-85 text-xs font-bold transition-all"
          >
            Activate
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Members"
        subtitle={`${members.length} total members registered`}
        action={
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#526B52] hover:bg-[#405640] dark:bg-[#A3B18A] dark:hover:bg-[#BAC7A8] text-white dark:text-[#171C18] text-sm font-bold shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Add Member
          </motion.button>
        }
      />

      {/* Search */}
      <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${isDark ? 'bg-[#202720] border-[#394239]' : 'bg-white border-[#DDE1D8] shadow-sm'}`}>
        <Search className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`} />
        <input
          type="text"
          placeholder="Search by name, email or room..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={`flex-1 bg-transparent text-sm outline-none ${isDark ? 'text-[#F0F1E9] placeholder:text-[#B1B8AC]/60' : 'text-[#202720] placeholder:text-[#687168]/60'}`}
        />
      </div>

      {/* Tabs */}
      <div className={`flex items-center gap-4 border-b ${isDark ? 'border-[#394239]' : 'border-[#DDE1D8]'} mb-6`}>
        <button 
          onClick={() => setActiveTab('members')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'members' ? 'border-[#526B52] text-[#526B52] dark:border-[#A3B18A] dark:text-[#A3B18A]' : 'border-transparent text-[#687168] hover:text-[#202720] dark:text-[#B1B8AC] dark:hover:text-[#F0F1E9]'}`}
        >
          Active Members
        </button>
        <button 
          onClick={() => setActiveTab('pending')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'pending' ? 'border-[#526B52] text-[#526B52] dark:border-[#A3B18A] dark:text-[#A3B18A]' : 'border-transparent text-[#687168] hover:text-[#202720] dark:text-[#B1B8AC] dark:hover:text-[#F0F1E9]'}`}
        >
          Pending Approvals
          {pendingUsers.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-[#DC2626]/10 text-[#DC2626] dark:text-[#EF4444] text-[10px] font-bold tabular-nums">{pendingUsers.length}</span>
          )}
        </button>
      </div>

      <DataTable
        columns={activeTab === 'members' ? columns : pendingColumns}
        data={activeTab === 'members' ? filtered : pendingFiltered}
        loading={activeTab === 'members' ? isLoading : isPendingLoading}
        emptyMessage={
          search 
            ? `No ${activeTab === 'members' ? 'members' : 'pending users'} matching "${search}"` 
            : (activeTab === 'members' ? 'No members yet. Add your first member!' : 'No pending users awaiting approval.')
        }
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Member"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addMutation.mutate(formData);
          }}
          className="space-y-4"
        >
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>User ID (Object ID from Users collection)</label>
            <input
              type="text"
              required
              value={formData.userId}
              onChange={e => setFormData({ ...formData, userId: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border border-[#DDE1D8] dark:border-[#394239] outline-none focus:border-[#748D6B] dark:focus:border-[#A3B18A] focus:ring-1 focus:ring-[#748D6B] dark:focus:ring-[#A3B18A] transition-colors bg-white dark:bg-[#202720] text-[#202720] dark:text-[#F0F1E9] placeholder:text-[#687168]/60 dark:placeholder:text-[#B1B8AC]/60`}
              placeholder="e.g. 64d9f..."
            />
          </div>
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border border-[#DDE1D8] dark:border-[#394239] outline-none focus:border-[#748D6B] dark:focus:border-[#A3B18A] focus:ring-1 focus:ring-[#748D6B] dark:focus:ring-[#A3B18A] transition-colors bg-white dark:bg-[#202720] text-[#202720] dark:text-[#F0F1E9] placeholder:text-[#687168]/60 dark:placeholder:text-[#B1B8AC]/60`}
              placeholder="e.g. 01xxxxxxxxx"
            />
          </div>
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>NID</label>
            <input
              type="text"
              value={formData.nid}
              onChange={e => setFormData({ ...formData, nid: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border border-[#DDE1D8] dark:border-[#394239] outline-none focus:border-[#748D6B] dark:focus:border-[#A3B18A] focus:ring-1 focus:ring-[#748D6B] dark:focus:ring-[#A3B18A] transition-colors bg-white dark:bg-[#202720] text-[#202720] dark:text-[#F0F1E9] placeholder:text-[#687168]/60 dark:placeholder:text-[#B1B8AC]/60`}
              placeholder="NID Number"
            />
          </div>
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>Occupation</label>
            <input
              type="text"
              value={formData.occupation}
              onChange={e => setFormData({ ...formData, occupation: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border border-[#DDE1D8] dark:border-[#394239] outline-none focus:border-[#748D6B] dark:focus:border-[#A3B18A] focus:ring-1 focus:ring-[#748D6B] dark:focus:ring-[#A3B18A] transition-colors bg-white dark:bg-[#202720] text-[#202720] dark:text-[#F0F1E9] placeholder:text-[#687168]/60 dark:placeholder:text-[#B1B8AC]/60`}
              placeholder="e.g. Student"
            />
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                isDark ? 'text-[#B1B8AC] hover:bg-[#292F29]' : 'text-[#687168] hover:bg-[#ECECE4]'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addMutation.isPending}
              className="px-6 py-2 rounded-xl bg-[#526B52] hover:bg-[#405640] dark:bg-[#A3B18A] dark:hover:bg-[#BAC7A8] text-white dark:text-[#171C18] text-sm font-bold shadow-sm disabled:opacity-50 transition-all"
            >
              {addMutation.isPending ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
