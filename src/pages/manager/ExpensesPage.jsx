import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, ShoppingBag, Trash2, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import Modal from '../../components/shared/Modal';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency, formatDate, getMonthName } from '../../utils/helpers';
import api from '../../config/axios';
import { QUERY_KEYS, EXPENSE_CATEGORIES } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function ExpensesPage() {
  const { isDark } = useTheme();
  const queryClient = useQueryClient();
  const now = new Date();
  const [summaryMonth, setSummaryMonth] = useState(now.getMonth() + 1);
  const [summaryYear,  setSummaryYear]  = useState(now.getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ description: '', amount: '', category: 'grocery', date: new Date().toISOString().split('T')[0], note: '' });

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.EXPENSES, summaryMonth, summaryYear],
    queryFn: async () => {
      const { data } = await api.get(`/expenses?month=${summaryMonth}&year=${summaryYear}`);
      return data.data || [];
    },
    placeholderData: [],
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      await api.post('/expenses', { ...payload, amount: Number(payload.amount) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXPENSES });
      setIsModalOpen(false);
      setForm({ description: '', amount: '', category: 'grocery', date: new Date().toISOString().split('T')[0], note: '' });
      toast.success('Expense added!');
    },
    onError: () => toast.error('Failed to add expense.'),
  });

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      await api.put(`/expenses/${editingId}`, { ...payload, amount: Number(payload.amount) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXPENSES });
      setIsModalOpen(false);
      setEditingId(null);
      setForm({ description: '', amount: '', category: 'grocery', date: new Date().toISOString().split('T')[0], note: '' });
      toast.success('Expense updated!');
    },
    onError: () => toast.error('Failed to update expense.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXPENSES });
      toast.success('Expense deleted!');
    },
    onError: () => toast.error('Failed to delete expense.'),
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const cardBg = isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200 shadow-sm';
  const inputClass = `w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:border-purple-500 ${
    isDark ? 'bg-slate-800 border-white/10 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400'
  }`;

  const columns = [
    {
      key: 'description',
      label: 'Description',
      render: (row) => {
        const cat = EXPENSE_CATEGORIES.find(c => c.value === row.category);
        return (
          <div className="flex items-center gap-3">
            <span className="text-xl leading-none">{cat?.icon || '📦'}</span>
            <div>
              <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{row.description}</p>
              <p className={`text-xs capitalize ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{cat?.label || row.category}</p>
            </div>
          </div>
        );
      }
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => <span className="text-red-400 font-semibold text-sm">{formatCurrency(row.amount)}</span>
    },
    {
      key: 'date',
      label: 'Date',
      render: (row) => <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{formatDate(row.date)}</span>
    },
    {
      key: 'note',
      label: 'Note',
      render: (row) => <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{row.note || '—'}</span>
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => {
              setEditingId(row._id);
              setForm({
                description: row.description,
                amount: row.amount || '',
                category: row.category || 'grocery',
                date: row.date ? row.date.split('T')[0] : '',
                note: row.note || ''
              });
              setIsModalOpen(true);
            }}
            className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this expense?')) deleteMutation.mutate(row._id);
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
        title="Expenses"
        subtitle="Track all dormitory expenses by month"
        action={
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditingId(null);
              setForm({ description: '', amount: '', category: 'grocery', date: new Date().toISOString().split('T')[0], note: '' });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </motion.button>
        }
      />

      <div className="flex items-center gap-3">
        <button onClick={() => {
          if (summaryMonth === 1) { setSummaryMonth(12); setSummaryYear(y => y - 1); }
          else setSummaryMonth(m => m - 1);
        }} className={`p-2 rounded-xl border transition-colors ${isDark ? 'border-white/10 hover:bg-white/5 text-slate-400' : 'border-slate-200 hover:bg-slate-50 text-slate-500'}`}><ChevronLeft className="w-4 h-4" /></button>
        <span className={`text-sm font-semibold min-w-[110px] text-center ${isDark ? 'text-white' : 'text-slate-800'}`}>{getMonthName(summaryMonth)} {summaryYear}</span>
        <button onClick={() => {
          if (summaryMonth === 12) { setSummaryMonth(1); setSummaryYear(y => y + 1); }
          else setSummaryMonth(m => m + 1);
        }} className={`p-2 rounded-xl border transition-colors ${isDark ? 'border-white/10 hover:bg-white/5 text-slate-400' : 'border-slate-200 hover:bg-slate-50 text-slate-500'}`}><ChevronRight className="w-4 h-4" /></button>
      </div>

      {/* Summary */}
      <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl border ${cardBg}`}>
        <div className="p-2.5 rounded-xl bg-red-500/10">
          <ShoppingBag className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Expenses in {getMonthName(summaryMonth)}</p>
          <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{formatCurrency(totalExpenses)}</p>
        </div>
      </div>

      {/* Add Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Expense" : "Add New Expense"}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Description</label>
              <input required placeholder="e.g. Rice & Vegetables" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} className={inputClass} />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Amount (৳)</label>
              <input type="number" required placeholder="Amount" value={form.amount} onChange={e => setForm(p => ({...p, amount: e.target.value}))} className={inputClass} />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Category</label>
              <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} className={`${inputClass}`}>
                {EXPENSE_CATEGORIES.map(c => (
                  <option key={c.value} value={c.value} className={isDark ? 'bg-slate-800' : 'bg-white'}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Date</label>
              <input type="date" required value={form.date} onChange={e => setForm(p => ({...p, date: e.target.value}))} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Note (Optional)</label>
              <input placeholder="Additional details" value={form.note} onChange={e => setForm(p => ({...p, note: e.target.value}))} className={`${inputClass} w-full`} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className={`px-4 py-2 rounded-xl text-sm ${isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100'}`}>Cancel</button>
            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              disabled={!form.description || !form.amount || createMutation.isPending || updateMutation.isPending}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editingId ? 'Save Changes' : 'Save Expense')}
            </motion.button>
          </div>
        </form>
      </Modal>

      <DataTable columns={columns} data={expenses} loading={isLoading} emptyMessage="No expenses recorded yet." />
    </div>
  );
}
