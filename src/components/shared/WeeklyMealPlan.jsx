import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Sun, Moon, Edit, Save, X } from 'lucide-react';
import api from '../../config/axios';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { triggerConfetti } from '../../utils/confetti';

export default function WeeklyMealPlan({ isManager = false }) {
  const { isDark } = useTheme();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState([]);

  // Fetch the current week's plan
  const { data: plan, isLoading } = useQuery({
    queryKey: ['weeklyMealPlan'],
    queryFn: async () => {
      const { data } = await api.get('/meals/weekly-plan');
      return data.data;
    },
    staleTime: 30 * 1000,
  });

  // Mutation to update the plan
  const updateMutation = useMutation({
    mutationFn: (days) => api.put('/meals/weekly-plan', { days }),
    onSuccess: (_, days) => {
      queryClient.setQueryData(['weeklyMealPlan'], (old) => ({ ...(old || {}), days }));
      queryClient.invalidateQueries({ queryKey: ['weeklyMealPlan'] });
      toast.success('Weekly meal plan updated!');
      triggerConfetti('meal');
      setIsEditing(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update meal plan');
    },
  });

  const handleEditClick = () => {
    if (plan && plan.days) {
      setEditData(JSON.parse(JSON.stringify(plan.days))); // Deep copy
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    updateMutation.mutate(editData);
  };

  const handleToggle = (index, field) => {
    const newEditData = [...editData];
    newEditData[index][field] = !newEditData[index][field];
    setEditData(newEditData);
  };

  const handleNoteChange = (index, field, value) => {
    const newEditData = [...editData];
    newEditData[index][field] = value;
    setEditData(newEditData);
  };

  const cardBg = isDark ? 'bg-[#202720] border-[#394239]' : 'bg-white border-[#DDE1D8] shadow-sm';
  const textMuted = isDark ? 'text-[#B1B8AC]' : 'text-[#687168]';

  if (isLoading) {
    return (
      <div className={`rounded-2xl border p-6 animate-pulse ${cardBg}`}>
        <div className="h-6 w-48 bg-[#ECECE4] dark:bg-[#292F29] rounded-lg mb-6"></div>
        <div className="space-y-3">
          {[1,2,3,4,5,6,7].map(i => (
            <div key={i} className="h-12 bg-[#ECECE4] dark:bg-[#292F29] rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const days = plan?.days || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border ${cardBg} overflow-hidden`}
    >
      <div className={`px-6 py-4 border-b flex justify-between items-center ${isDark ? 'border-[#394239]' : 'border-[#DDE1D8]'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#E8EDE3] text-[#526B52] dark:bg-[#303A30] dark:text-[#A3B18A]">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`font-bold tracking-tight ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>Weekly Meal Plan</h3>
            <p className={`text-xs font-medium ${textMuted}`}>Lunch & Dinner Schedule</p>
          </div>
        </div>

        {isManager && (
          <button
            onClick={isEditing ? handleSave : handleEditClick}
            disabled={updateMutation.isPending}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              isEditing 
                ? 'bg-[#526B52] hover:bg-[#405640] dark:bg-[#A3B18A] dark:hover:bg-[#BAC7A8] text-white dark:text-[#171C18] shadow-sm' 
                : isDark ? 'bg-[#292F29] hover:bg-[#303A30] text-[#F0F1E9] border border-[#394239]' : 'bg-[#ECECE4] hover:bg-[#E0E0D8] text-[#202720] border border-[#DDE1D8]'
            }`}
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4" />
                {updateMutation.isPending ? 'Saving...' : 'Save Plan'}
              </>
            ) : (
              <>
                <Edit className="w-4 h-4" />
                Edit Plan
              </>
            )}
          </button>
        )}
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {(isEditing ? editData : days).map((day, index) => {
            const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
            const isToday = day.dayName === today && !isEditing;
            
            return (
              <div 
                key={day.dayName} 
                className={`flex flex-col rounded-xl border p-4 transition-all ${
                  isToday 
                    ? (isDark ? 'bg-[#303A30]/50 border-[#A3B18A]/50 ring-1 ring-[#A3B18A]/50' : 'bg-[#E8EDE3]/60 border-[#526B52]/40 ring-1 ring-[#526B52]/40')
                    : (isDark ? 'bg-[#292F29]/40 border-[#394239]' : 'bg-[#F5F4EE]/60 border-[#DDE1D8]')
                }`}
              >
                <h4 className={`text-sm font-bold mb-3 text-center ${
                  isToday 
                    ? 'text-[#526B52] dark:text-[#A3B18A]' 
                    : (isDark ? 'text-[#F0F1E9]' : 'text-[#202720]')
                }`}>
                  {day.dayName}
                  {isToday && <span className="ml-2 text-[10px] uppercase font-bold tracking-wider bg-[#526B52] dark:bg-[#A3B18A] text-white dark:text-[#171C18] px-2 py-0.5 rounded-full">Today</span>}
                </h4>

                <div className="flex justify-around items-center mb-3">
                  {/* Lunch */}
                  <div className="flex flex-col items-center gap-1.5">
                    <Sun className={`w-5 h-5 ${day.lunch ? 'text-[#D97706]' : 'text-[#B1B8AC]/40 dark:text-[#687168]/40'}`} />
                    {isEditing ? (
                      <button 
                        onClick={() => handleToggle(index, 'lunch')}
                        className={`text-xs px-2 py-1 rounded-md font-semibold ${
                          day.lunch ? 'bg-[#FEF3C7] text-[#92400E] dark:bg-[#78350F]/40 dark:text-[#FCD34D]' : 'bg-[#ECECE4] text-[#687168] dark:bg-[#292F29] dark:text-[#B1B8AC]'
                        }`}
                      >
                        {day.lunch ? 'Yes' : 'No'}
                      </button>
                    ) : (
                      <span className={`text-[10px] font-bold uppercase ${day.lunch ? 'text-[#D97706] dark:text-[#F59E0B]' : textMuted}`}>
                        {day.lunch ? 'Lunch' : 'None'}
                      </span>
                    )}
                  </div>

                  {/* Dinner */}
                  <div className="flex flex-col items-center gap-1.5">
                    <Moon className={`w-5 h-5 ${day.dinner ? 'text-[#0D9488]' : 'text-[#B1B8AC]/40 dark:text-[#687168]/40'}`} />
                    {isEditing ? (
                      <button 
                        onClick={() => handleToggle(index, 'dinner')}
                        className={`text-xs px-2 py-1 rounded-md font-semibold ${
                          day.dinner ? 'bg-[#CCFBF1] text-[#115E59] dark:bg-[#134E4A]/40 dark:text-[#5EEAD4]' : 'bg-[#ECECE4] text-[#687168] dark:bg-[#292F29] dark:text-[#B1B8AC]'
                        }`}
                      >
                        {day.dinner ? 'Yes' : 'No'}
                      </button>
                    ) : (
                      <span className={`text-[10px] font-bold uppercase ${day.dinner ? 'text-[#0D9488] dark:text-[#2DD4BF]' : textMuted}`}>
                        {day.dinner ? 'Dinner' : 'None'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-auto pt-3 border-t border-[#DDE1D8] dark:border-[#394239] space-y-2">
                  <div className="flex items-center gap-2">
                    <Sun className={`w-3 h-3 flex-shrink-0 ${day.lunchNote ? 'text-[#D97706]' : 'text-[#687168] dark:text-[#B1B8AC]'}`} />
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={day.lunchNote || ''}
                        onChange={(e) => handleNoteChange(index, 'lunchNote', e.target.value)}
                        placeholder="Lunch note..."
                        maxLength={80}
                        className={`w-full text-[10px] px-2 py-1 rounded-md border focus:ring-1 focus:ring-[#748D6B] dark:focus:ring-[#A3B18A] outline-none ${
                          isDark ? 'bg-[#202720] border-[#394239] text-[#F0F1E9]' : 'bg-white border-[#DDE1D8] text-[#202720]'
                        }`}
                      />
                    ) : (
                      <p className={`text-[10px] truncate ${day.lunchNote ? (isDark ? 'text-[#F0F1E9]' : 'text-[#202720]') : textMuted}`}>
                        {day.lunchNote || '-'}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Moon className={`w-3 h-3 flex-shrink-0 ${day.dinnerNote ? 'text-[#0D9488]' : 'text-[#687168] dark:text-[#B1B8AC]'}`} />
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={day.dinnerNote || ''}
                        onChange={(e) => handleNoteChange(index, 'dinnerNote', e.target.value)}
                        placeholder="Dinner note..."
                        maxLength={80}
                        className={`w-full text-[10px] px-2 py-1 rounded-md border focus:ring-1 focus:ring-[#748D6B] dark:focus:ring-[#A3B18A] outline-none ${
                          isDark ? 'bg-[#202720] border-[#394239] text-[#F0F1E9]' : 'bg-white border-[#DDE1D8] text-[#202720]'
                        }`}
                      />
                    ) : (
                      <p className={`text-[10px] truncate ${day.dinnerNote ? (isDark ? 'text-[#F0F1E9]' : 'text-[#202720]') : textMuted}`}>
                        {day.dinnerNote || '-'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
