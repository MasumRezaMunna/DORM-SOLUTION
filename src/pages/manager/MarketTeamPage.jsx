import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus } from 'lucide-react';
import { Button } from '@heroui/react';
import { useTheme } from '../../contexts/ThemeContext';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import Modal from '../../components/shared/Modal';
import MarketScheduleTable from '../../features/market/components/MarketScheduleTable';
import MarketScheduleForm from '../../features/market/components/MarketScheduleForm';
import {
  useMarketStats,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
} from '../../features/market/hooks/useMarketSchedules';

export default function MarketTeamPage() {
  const { isDark } = useTheme();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [deletingSchedule, setDeletingSchedule] = useState(null);

  // Queries
  const { data: stats, isLoading: statsLoading } = useMarketStats();

  // Mutations
  const createMutation = useCreateSchedule();
  const updateMutation = useUpdateSchedule();
  const deleteMutation = useDeleteSchedule();

  const handleOpenCreate = () => {
    setEditingSchedule(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (schedule) => {
    setEditingSchedule(schedule);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setEditingSchedule(null), 300);
  };

  const handleSubmit = (payload) => {
    if (editingSchedule) {
      updateMutation.mutate(
        { id: editingSchedule._id, ...payload },
        { onSuccess: handleCloseModal }
      );
    } else {
      createMutation.mutate(payload, { onSuccess: handleCloseModal });
    }
  };

  const handleDelete = () => {
    if (deletingSchedule) {
      deleteMutation.mutate(deletingSchedule._id, {
        onSuccess: () => setDeletingSchedule(null),
      });
    }
  };

  // Guard against stats being undefined before data loads
  const statsData = [
    {
      title: 'Total Schedules',
      value: statsLoading ? '...' : (stats?.total ?? 0),
      icon: ShoppingCart,
      gradient: 'from-purple-500 to-indigo-600',
    },
    {
      title: 'Upcoming Teams',
      value: statsLoading ? '...' : (stats?.upcoming ?? 0),
      icon: ShoppingCart,
      gradient: 'from-blue-500 to-cyan-600',
    },
    {
      title: "Today's Team",
      value: statsLoading ? '...' : (stats?.today ?? 0),
      icon: ShoppingCart,
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Completed',
      value: statsLoading ? '...' : (stats?.completed ?? 0),
      icon: ShoppingCart,
      gradient: 'from-slate-500 to-slate-700',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <PageHeader
          title="Market Team Management"
          subtitle="Assign and manage daily market (Bazar) duties"
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-lg shadow-purple-500/30 text-sm"
        >
          <Plus className="w-4 h-4" />
          Assign Team
        </motion.button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsData.map((s, i) => (
          <StatCard key={s.title} {...s} index={i} />
        ))}
      </div>

      {/* Main Table */}
      <MarketScheduleTable
        onEdit={handleOpenEdit}
        onDelete={setDeletingSchedule}
      />

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            title={editingSchedule ? 'Edit Market Team' : 'Assign Market Team'}
            size="2xl"
          >
            <MarketScheduleForm
              defaultValues={editingSchedule}
              onSubmit={handleSubmit}
              isLoading={createMutation.isPending || updateMutation.isPending}
              onCancel={handleCloseModal}
            />
          </Modal>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {!!deletingSchedule && (
          <Modal
            isOpen={!!deletingSchedule}
            onClose={() => setDeletingSchedule(null)}
            title="Delete Schedule"
            size="sm"
          >
            <div className="p-4">
              <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Are you sure you want to delete the market schedule for{' '}
                <span className="font-semibold text-red-400">
                  {new Date(deletingSchedule.marketDate).toLocaleDateString()}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setDeletingSchedule(null)}
                  disabled={deleteMutation.isPending}
                  className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isDark ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
