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
      const now = new Date();
      const { data } = await api.get(`/dashboard/community?month=${now.getMonth() + 1}&year=${now.getFullYear()}`);
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
            <div className="w-8 h-8 rounded-full bg-[#526B52] dark:bg-[#A3B18A] flex items-center justify-center text-white dark:text-[#171C18] text-xs font-bold">
              {row.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
          <div>
            <p className={`font-semibold text-sm ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>{row.name}</p>
            <p className={`text-xs ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>Room {row.room?.roomNumber || 'N/A'}</p>
          </div>
        </div>
      )
    },
    {
      key: 'totalMeals',
      label: `Meals (${currentMonth})`,
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <UtensilsCrossed className="w-3.5 h-3.5 text-amber-500" />
          <span className={`font-bold text-sm tabular-nums ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>{row.totalMeals}</span>
        </div>
      )
    },
    {
      key: 'totalPaid',
      label: `Payments (${currentMonth})`,
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Wallet className="w-3.5 h-3.5 text-[#526B52] dark:text-[#A3B18A]" />
          <span className={`font-bold text-sm tabular-nums ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>{formatCurrency(row.totalPaid)}</span>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Community Stats" 
        subtitle={`Transparency overview for ${currentMonth}`}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl border ${isDark ? 'bg-[#202720] border-[#394239]' : 'bg-white border-[#DDE1D8] shadow-sm'}`}>
          <div className="p-3 rounded-xl bg-[#E8EDE3] dark:bg-[#303A30]">
            <Users className="w-5 h-5 text-[#526B52] dark:text-[#A3B18A]" />
          </div>
          <div>
            <p className={`text-xs font-semibold ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>Active Members</p>
            <p className={`text-3xl font-extrabold tracking-tight tabular-nums ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>{members.length}</p>
          </div>
        </div>
        <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl border ${isDark ? 'bg-[#202720] border-[#394239]' : 'bg-white border-[#DDE1D8] shadow-sm'}`}>
          <div className="p-3 rounded-xl bg-amber-500/10">
            <UtensilsCrossed className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className={`text-xs font-semibold ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>Total Meals ({currentMonth})</p>
            <p className={`text-3xl font-extrabold tracking-tight tabular-nums ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>
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
