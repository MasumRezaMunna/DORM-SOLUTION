import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FilePlus, Search, Receipt, Edit, Trash2 } from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import Modal from '../../components/shared/Modal';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency, formatDate, getMonthName } from '../../utils/helpers';
import api from '../../config/axios';
import { QUERY_KEYS } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function BillsPage() {
  const { isDark } = useTheme();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const queryClient = useQueryClient();

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    memberId: '',
    month: currentMonth,
    year: currentYear,
    mealCost: '',
    dueDate: '',
  });

  const { data: members = [] } = useQuery({
    queryKey: QUERY_KEYS.MEMBERS,
    queryFn: async () => {
      const { data } = await api.get('/members');
      return data.data || [];
    },
    placeholderData: [],
  });

  const generateMutation = useMutation({
    mutationFn: (newBill) => api.post('/bills', newBill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BILLS });
      toast.success('Bill generated successfully!');
      setIsModalOpen(false);
      setFormData({
        memberId: '',
        month: currentMonth,
        year: currentYear,
        mealCost: '',
        dueDate: '',
      });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to generate bill');
    }
  });

  const bulkGenerateMutation = useMutation({
    mutationFn: (data) => api.post('/bills/bulk', data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BILLS });
      toast.success(res.data?.message || 'Bulk bills generated successfully!');
      setIsModalOpen(false);
      setFormData({
        memberId: '',
        month: currentMonth,
        year: currentYear,
        mealCost: '',
        dueDate: '',
      });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to generate bulk bills');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => api.put(`/bills/${editingId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BILLS });
      toast.success('Bill updated successfully!');
      setIsModalOpen(false);
      setEditingId(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update bill');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/bills/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BILLS });
      toast.success('Bill deleted successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete bill');
    }
  });

  const { data: bills = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.BILLS,
    queryFn: async () => {
      const { data } = await api.get('/bills');
      return data.data || [];
    },
    placeholderData: [],
  });

  const filtered = bills.filter(b => {
    const matchSearch = b.memberId?.userId?.displayName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    {
      key: 'member',
      label: 'Member',
      render: (row) => (
        <div>
          <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {row.memberId?.userId?.displayName || '—'}
          </p>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Room {row.memberId?.roomId?.roomNumber || '—'}
          </p>
        </div>
      )
    },
    {
      key: 'period',
      label: 'Period',
      render: (row) => (
        <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          {getMonthName(row.month)} {row.year}
        </span>
      )
    },
    {
      key: 'meal',
      label: 'Meal',
      render: (row) => <span className="text-sm">{formatCurrency(row.mealCost)}</span>
    },
    {
      key: 'total',
      label: 'Total',
      render: (row) => (
        <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
          {formatCurrency(row.totalAmount)}
        </span>
      )
    },
    {
      key: 'paid',
      label: 'Paid',
      render: (row) => (
        <span className="text-sm text-emerald-400 font-medium">
          {formatCurrency(row.paidAmount || 0)}
        </span>
      )
    },
    {
      key: 'due',
      label: 'Due',
      render: (row) => {
        const due = (row.totalAmount || 0) - (row.paidAmount || 0);
        return <span className={`text-sm font-semibold ${due > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{formatCurrency(due)}</span>;
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (row) => (
        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{formatDate(row.dueDate)}</span>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => {
              setEditingId(row._id);
              setFormData({
                memberId: row.memberId?._id || '',
                month: row.month,
                year: row.year,
                mealCost: row.mealCost || '',
                dueDate: row.dueDate ? row.dueDate.split('T')[0] : '',
              });
              setIsModalOpen(true);
            }}
            className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this bill?')) deleteMutation.mutate(row._id);
            }}
            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Bills"
        subtitle={`${bills.filter(b => b.status !== 'paid').length} unpaid bills this month`}
        action={
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditingId(null);
              setFormData({
                memberId: '', month: currentMonth, year: currentYear, mealCost: '', dueDate: ''
              });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold shadow-lg"
          >
            <FilePlus className="w-4 h-4" />
            Generate Bills
          </motion.button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border flex-1 ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by member name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`flex-1 bg-transparent text-sm outline-none ${isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-800 placeholder:text-slate-400'}`}
          />
        </div>

        <div className={`inline-flex items-center gap-1 p-1 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
          {['all', 'pending', 'partial', 'paid'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${statusFilter === s
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={isLoading}
        emptyMessage={search ? `No bills matching "${search}"` : 'No bills generated yet. Click "Generate Bills" to start.'}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Bill" : "Generate Bill"}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (editingId) {
              updateMutation.mutate({
                ...formData,
                month: Number(formData.month),
                year: Number(formData.year),
                rent: Number(formData.rent),
                mealCost: Number(formData.mealCost),
              });
            } else if (formData.memberId === 'all') {
              bulkGenerateMutation.mutate({
                month: Number(formData.month),
                year: Number(formData.year),
                rent: Number(formData.rent),
                mealCost: Number(formData.mealCost),
                dueDate: formData.dueDate,
              });
            } else {
              generateMutation.mutate({
                ...formData,
                month: Number(formData.month),
                year: Number(formData.year),
                rent: Number(formData.rent),
                mealCost: Number(formData.mealCost),
              });
            }
          }}
          className="space-y-4"
        >
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Select Member</label>
            <select
              required
              value={formData.memberId}
              onChange={e => setFormData({ ...formData, memberId: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border outline-none focus:border-purple-500 transition-colors ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
            >
              <option value="">-- Choose Member --</option>
              {!editingId && <option value="all" className="font-semibold text-purple-500">All Active Members (Bulk)</option>}
              {members.map(m => (
                <option key={m._id} value={m._id}>
                  {m.userId?.displayName || 'Unknown'} (Room {m.roomId?.roomNumber || '—'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Month</label>
              <input
                type="number"
                min="1" max="12"
                required
                value={formData.month}
                onChange={e => setFormData({ ...formData, month: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border outline-none focus:border-purple-500 transition-colors ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
              />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Year</label>
              <input
                type="number"
                required
                value={formData.year}
                onChange={e => setFormData({ ...formData, year: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border outline-none focus:border-purple-500 transition-colors ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Meal Amount</label>
            <input
              type="number"
              required
              value={formData.mealCost}
              onChange={e => setFormData({ ...formData, mealCost: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border outline-none focus:border-purple-500 transition-colors ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              placeholder="e.g. 3000"
            />
          </div>

          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Due Date</label>
            <input
              type="date"
              required
              value={formData.dueDate}
              onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border outline-none focus:border-purple-500 transition-colors ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={generateMutation.isPending || updateMutation.isPending}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold shadow-lg disabled:opacity-50"
            >
              {generateMutation.isPending || updateMutation.isPending ? 'Saving...' : (editingId ? 'Save Changes' : 'Generate Bill')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
