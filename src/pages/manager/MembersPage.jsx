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
        <div className={`absolute right-0 top-full mt-1 w-48 rounded-xl border shadow-xl z-50 py-1 ${isDark ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-100'}`}>
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
            {isManager ? <ShieldAlert className="w-4 h-4 text-orange-400" /> : <Shield className="w-4 h-4 text-purple-400" />}
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

  const addMutation = useMutation({
    mutationFn: (newMember) => api.post('/members', newMember),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEMBERS });
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEMBERS });
      toast.success('Status updated!');
    },
    onError: () => toast.error('Failed to update status')
  });

  const approveMutation = useMutation({
    mutationFn: (userId) => api.post('/members', { userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEMBERS });
      queryClient.invalidateQueries({ queryKey: ['pendingUsers'] });
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEMBERS });
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
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {getInitials(row.userId?.displayName || 'U')}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{row.userId?.displayName || 'Unknown'}</p>
              {row.userId?.role === 'manager' && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 uppercase tracking-wide">Mgr</span>}
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{row.userId?.email}</p>
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
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {getInitials(row.displayName || 'U')}
            </div>
          )}
          <div>
            <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{row.displayName || 'Unknown'}</p>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{row.email}</p>
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
            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 text-xs font-semibold transition-colors"
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Add Member
          </motion.button>
        }
      />

      {/* Search */}
      <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
        <Search className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
        <input
          type="text"
          placeholder="Search by name, email or room..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={`flex-1 bg-transparent text-sm outline-none ${isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-800 placeholder:text-slate-400'}`}
        />
      </div>

      {/* Tabs */}
      <div className={`flex items-center gap-4 border-b ${isDark ? 'border-white/10' : 'border-slate-200'} mb-6`}>
        <button 
          onClick={() => setActiveTab('members')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'members' ? 'border-purple-500 text-purple-500' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Active Members
        </button>
        <button 
          onClick={() => setActiveTab('pending')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'pending' ? 'border-purple-500 text-purple-500' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Pending Approvals
          {pendingUsers.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] tabular-nums">{pendingUsers.length}</span>
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
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>User ID (Object ID from Users collection)</label>
            <input
              type="text"
              required
              value={formData.userId}
              onChange={e => setFormData({ ...formData, userId: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border outline-none focus:border-purple-500 transition-colors ${
                isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
              placeholder="e.g. 64d9f..."
            />
          </div>
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border outline-none focus:border-purple-500 transition-colors ${
                isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
              placeholder="e.g. 01xxxxxxxxx"
            />
          </div>
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>NID</label>
            <input
              type="text"
              value={formData.nid}
              onChange={e => setFormData({ ...formData, nid: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border outline-none focus:border-purple-500 transition-colors ${
                isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
              placeholder="NID Number"
            />
          </div>
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Occupation</label>
            <input
              type="text"
              value={formData.occupation}
              onChange={e => setFormData({ ...formData, occupation: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border outline-none focus:border-purple-500 transition-colors ${
                isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
              placeholder="e.g. Student"
            />
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
              disabled={addMutation.isPending}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold shadow-lg disabled:opacity-50"
            >
              {addMutation.isPending ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
