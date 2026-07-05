import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Search, Wallet, Receipt, User, Calendar, AlertCircle, Edit, Trash2 } from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import Modal from '../../components/shared/Modal';
import StatusBadge from '../../components/shared/StatusBadge';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import api from '../../config/axios';
import { QUERY_KEYS, PAYMENT_METHODS } from '../../utils/constants';
import toast from 'react-hot-toast';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function PaymentsPage() {
  const { isDark } = useTheme();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const queryClient = useQueryClient();

  const emptyForm = { billId: '', amount: '', method: 'cash', transactionId: '', note: '' };
  const [formData, setFormData] = useState(emptyForm);

  // ── Fetch bills (all, not just unpaid — we filter client-side) ─────────
  const { data: bills = [] } = useQuery({
    queryKey: QUERY_KEYS.BILLS,
    queryFn: async () => {
      const { data } = await api.get('/bills?limit=500');
      return data.data || [];
    },
    placeholderData: [],
  });

  // Filter for unpaid or partially paid bills
  const unpaidBills = bills.filter(b => b.status !== 'paid');

  // Currently selected bill object (for info card)
  const selectedBill = unpaidBills.find(b => b._id === formData.billId) || null;
  const outstanding  = selectedBill ? (selectedBill.totalAmount - (selectedBill.paidAmount || 0)) : 0;

  const handleBillSelect = (billId) => {
    const bill = unpaidBills.find(b => b._id === billId);
    setFormData(prev => ({
      ...prev,
      billId,
      // auto-fill the full outstanding amount
      amount: bill ? String(bill.totalAmount - (bill.paidAmount || 0)) : '',
    }));
  };

  // ── Record payment mutation ────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: (newPayment) => api.post('/payments', newPayment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYMENTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BILLS });
      toast.success('Payment recorded successfully!');
      setIsModalOpen(false);
      setFormData(emptyForm);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => api.put(`/payments/${editingId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYMENTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BILLS });
      toast.success('Payment updated successfully!');
      setIsModalOpen(false);
      setEditingId(null);
      setFormData(emptyForm);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update payment');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/payments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYMENTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BILLS });
      toast.success('Payment deleted successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete payment');
    }
  });

  // ── Payments list ──────────────────────────────────────────────────────
  const { data: payments = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.PAYMENTS,
    queryFn: async () => {
      const { data } = await api.get('/payments');
      return data.data || [];
    },
    placeholderData: [],
  });

  const filtered = payments.filter(p =>
    p.memberId?.userId?.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    p.memberId?.roomId?.roomNumber?.toString().includes(search)
  );

  const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const columns = [
    {
      key: 'member',
      label: 'Member',
      render: (row) => (
        <div>
          <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{row.memberId?.userId?.displayName || 'Unknown'}</p>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Room {row.memberId?.roomId?.roomNumber || '—'}</p>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => (
        <span className="text-emerald-400 font-semibold text-sm">{formatCurrency(row.amount)}</span>
      )
    },
    {
      key: 'method',
      label: 'Method',
      render: (row) => (
        <span className={`text-sm capitalize ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          {PAYMENT_METHODS.find(m => m.value === row.method)?.label || row.method || '—'}
        </span>
      )
    },
    {
      key: 'transactionId',
      label: 'Transaction ID',
      render: (row) => (
        <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{row.transactionId || '—'}</span>
      )
    },
    {
      key: 'date',
      label: 'Date',
      render: (row) => (
        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{formatDate(row.createdAt)}</span>
      )
    },
    {
      key: 'note',
      label: 'Note',
      render: (row) => (
        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{row.note || '—'}</span>
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
                billId: row.billId?._id || row.billId,
                amount: row.amount || '',
                method: row.method || 'cash',
                transactionId: row.transactionId || '',
                note: row.note || '',
              });
              setIsModalOpen(true);
            }}
            className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this payment?')) deleteMutation.mutate(row._id);
            }}
            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    },
  ];

  const cardBg = isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200 shadow-sm';
  const inputCls = `w-full px-4 py-2.5 rounded-xl border outline-none focus:border-purple-500 transition-colors ${
    isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
  }`;
  const labelCls = `block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Payments"
        subtitle="All payment transactions"
        action={
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { 
              setEditingId(null);
              setFormData(emptyForm); 
              setIsModalOpen(true); 
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Record Payment
          </motion.button>
        }
      />

      {/* Summary */}
      <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl border ${cardBg}`}>
        <div className="p-2.5 rounded-xl bg-emerald-500/10">
          <Wallet className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Collected</p>
          <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{formatCurrency(totalCollected)}</p>
        </div>
        <div className="ml-auto flex flex-col items-end gap-1">
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{payments.length} transactions</p>
          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{unpaidBills.length} unpaid bills</p>
        </div>
      </div>

      {/* Search */}
      <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${cardBg}`}>
        <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search by member name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={`flex-1 bg-transparent text-sm outline-none ${isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-800 placeholder:text-slate-400'}`}
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={isLoading}
        emptyMessage="No payments recorded yet."
      />

      {/* ── Record Payment Modal ── */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Payment" : "Record Payment"}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const amt = Number(formData.amount);
            if (!amt || amt <= 0) return toast.error('Enter a valid amount');
            
            if (editingId) {
              updateMutation.mutate({ ...formData, amount: amt });
            } else {
              if (!selectedBill) return toast.error('Please select a bill');
              addMutation.mutate({
                ...formData,
                memberId: selectedBill.memberId?._id || selectedBill.memberId,
                amount: amt,
              });
            }
          }}
          className="space-y-4"
        >
          {/* Bill selector */}
          <div>
            <label className={labelCls}>{editingId ? 'Bill (Fixed)' : 'Select Unpaid Bill'}</label>
            {editingId ? (
              <div className={`${inputCls} opacity-70 cursor-not-allowed`}>
                Payment is locked to its original bill.
              </div>
            ) : unpaidBills.length === 0 ? (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${isDark ? 'border-white/10 bg-slate-800 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'} text-sm`}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                No unpaid bills found. Create a bill first.
              </div>
            ) : (
              <select
                required
                value={formData.billId}
                onChange={e => handleBillSelect(e.target.value)}
                className={inputCls}
              >
                <option value="">-- Choose a Member's Bill --</option>
                {unpaidBills.map(b => {
                  const memberName = b.memberId?.userId?.displayName || 'Unknown Member';
                  const period     = `${MONTH_NAMES[(b.month || 1) - 1]} ${b.year}`;
                  const due        = b.totalAmount - (b.paidAmount || 0);
                  return (
                    <option key={b._id} value={b._id}>
                      {memberName} — {period} — Due: ৳{due.toFixed(0)}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {/* Selected bill info card */}
          {!editingId && selectedBill && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border px-4 py-3 space-y-2 ${isDark ? 'bg-slate-800 border-white/10' : 'bg-slate-50 border-slate-200'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {selectedBill.memberId?.userId?.displayName || 'Unknown'}
                  </span>
                </div>
                <StatusBadge status={selectedBill.status} />
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1 text-slate-400">
                  <Calendar className="w-3 h-3" />
                  <span>{MONTH_NAMES[(selectedBill.month || 1) - 1]} {selectedBill.year}</span>
                </div>
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                  Total: <strong className={isDark ? 'text-white' : 'text-slate-700'}>৳{selectedBill.totalAmount?.toFixed(0)}</strong>
                </span>
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                  Paid: <strong className="text-emerald-400">৳{(selectedBill.paidAmount || 0).toFixed(0)}</strong>
                </span>
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                  Due: <strong className="text-red-400">৳{outstanding.toFixed(0)}</strong>
                </span>
              </div>
            </motion.div>
          )}

          {/* Amount + Method */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Amount Paid</label>
              <input
                type="number"
                required
                min="1"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                className={inputCls}
                placeholder="e.g. 5000"
              />
              {!editingId && selectedBill && (
                <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Outstanding: ৳{outstanding.toFixed(0)}
                </p>
              )}
            </div>
            <div>
              <label className={labelCls}>Payment Method</label>
              <select
                value={formData.method}
                onChange={e => setFormData({ ...formData, method: e.target.value })}
                className={inputCls}
              >
                {PAYMENT_METHODS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Transaction ID */}
          <div>
            <label className={labelCls}>Transaction ID / Ref (Optional)</label>
            <input
              type="text"
              value={formData.transactionId}
              onChange={e => setFormData({ ...formData, transactionId: e.target.value })}
              className={inputCls}
              placeholder="e.g. TrxID123"
            />
          </div>

          {/* Note */}
          <div>
            <label className={labelCls}>Note (Optional)</label>
            <input
              type="text"
              value={formData.note}
              onChange={e => setFormData({ ...formData, note: e.target.value })}
              className={inputCls}
              placeholder="Additional details"
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
              disabled={addMutation.isPending || updateMutation.isPending || (!editingId && !formData.billId)}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold shadow-lg disabled:opacity-50"
            >
              {addMutation.isPending || updateMutation.isPending ? 'Saving...' : (editingId ? 'Save Changes' : 'Record Payment')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
