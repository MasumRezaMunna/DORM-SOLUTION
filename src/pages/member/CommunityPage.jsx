import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, UtensilsCrossed, Wallet } from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency, getMonthName } from '../../utils/helpers';
import api from '../../config/axios';

export default function CommunityPage() {
  const { isDark } = useTheme();
  const currentMonth = getMonthName(new Date().getMonth() + 1);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['communityStats'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/community');
      return data.data || [];
    },
    placeholderData: [],
  });

  const columns = [
    {
      key: 'member',
      label: 'Member',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.photoURL ? (
            <img src={row.photoURL} alt={row.name} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {row.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
          <div>
            <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{row.name}</p>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Room {row.room?.roomNumber || 'N/A'}</p>
          </div>
        </div>
      )
    },
    {
      key: 'totalMeals',
      label: `Meals (${currentMonth})`,
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" />
          <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{row.totalMeals}</span>
        </div>
      )
    },
    {
      key: 'totalPaid',
      label: `Payments (${currentMonth})`,
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Wallet className="w-3.5 h-3.5 text-emerald-400" />
          <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{formatCurrency(row.totalPaid)}</span>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader 
        title="Community Stats" 
        subtitle={`Transparency overview for ${currentMonth}`}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl border ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
          <div className="p-3 rounded-xl bg-purple-500/10">
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Active Members</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{members.length}</p>
          </div>
        </div>
        <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl border ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
          <div className="p-3 rounded-xl bg-amber-500/10">
            <UtensilsCrossed className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Meals ({currentMonth})</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {members.reduce((sum, m) => sum + m.totalMeals, 0)}
            </p>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={members}
        loading={isLoading}
        emptyMessage="No active members found."
      />
    </div>
  );
}
