import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Sun, Moon, Edit, Save, X } from 'lucide-react';
import api from '../../config/axios';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

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
    staleTime: 5 * 60 * 1000,
  });

  // Mutation to update the plan
  const updateMutation = useMutation({
    mutationFn: (days) => api.put('/meals/weekly-plan', { days }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklyMealPlan'] });
      toast.success('Weekly meal plan updated!');
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

  const cardBg = isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200 shadow-sm';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';

  if (isLoading) {
    return (
      <div className={`rounded-2xl border p-6 animate-pulse ${cardBg}`}>
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg mb-6"></div>
        <div className="space-y-3">
          {[1,2,3,4,5,6,7].map(i => (
            <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
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
      <div className={`px-6 py-4 border-b flex justify-between items-center ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-orange-500/20">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Weekly Meal Plan</h3>
            <p className={`text-xs ${textMuted}`}>Lunch & Dinner Schedule</p>
          </div>
        </div>

        {isManager && (
          <button
            onClick={isEditing ? handleSave : handleEditClick}
            disabled={updateMutation.isPending}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              isEditing 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                : isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
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
                    ? (isDark ? 'bg-indigo-500/10 border-indigo-500/30 ring-1 ring-indigo-500/30' : 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200')
                    : (isDark ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100')
                }`}
              >
                <h4 className={`text-sm font-semibold mb-3 text-center ${
                  isToday 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : (isDark ? 'text-slate-300' : 'text-slate-700')
                }`}>
                  {day.dayName}
                  {isToday && <span className="ml-2 text-[10px] uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full">Today</span>}
                </h4>

                <div className="flex justify-around items-center mb-3">
                  {/* Lunch */}
                  <div className="flex flex-col items-center gap-1.5">
                    <Sun className={`w-5 h-5 ${day.lunch ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'}`} />
                    {isEditing ? (
                      <button 
                        onClick={() => handleToggle(index, 'lunch')}
                        className={`text-xs px-2 py-1 rounded-md ${
                          day.lunch ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                        }`}
                      >
                        {day.lunch ? 'Yes' : 'No'}
                      </button>
                    ) : (
                      <span className={`text-[10px] font-medium uppercase ${day.lunch ? 'text-amber-600 dark:text-amber-400' : textMuted}`}>
                        {day.lunch ? 'Lunch' : 'None'}
                      </span>
                    )}
                  </div>

                  {/* Dinner */}
                  <div className="flex flex-col items-center gap-1.5">
                    <Moon className={`w-5 h-5 ${day.dinner ? 'text-indigo-500' : 'text-slate-300 dark:text-slate-600'}`} />
                    {isEditing ? (
                      <button 
                        onClick={() => handleToggle(index, 'dinner')}
                        className={`text-xs px-2 py-1 rounded-md ${
                          day.dinner ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                        }`}
                      >
                        {day.dinner ? 'Yes' : 'No'}
                      </button>
                    ) : (
                      <span className={`text-[10px] font-medium uppercase ${day.dinner ? 'text-indigo-600 dark:text-indigo-400' : textMuted}`}>
                        {day.dinner ? 'Dinner' : 'None'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-auto pt-3 border-t border-slate-200 dark:border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sun className={`w-3 h-3 flex-shrink-0 ${day.lunchNote ? 'text-amber-500' : 'text-slate-400'}`} />
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={day.lunchNote || ''}
                        onChange={(e) => handleNoteChange(index, 'lunchNote', e.target.value)}
                        placeholder="Lunch note..."
                        maxLength={80}
                        className={`w-full text-[10px] px-2 py-1 rounded-md border focus:ring-1 focus:ring-amber-500 outline-none ${
                          isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                    ) : (
                      <p className={`text-[10px] truncate ${day.lunchNote ? (isDark ? 'text-slate-300' : 'text-slate-700') : textMuted}`}>
                        {day.lunchNote || '-'}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Moon className={`w-3 h-3 flex-shrink-0 ${day.dinnerNote ? 'text-indigo-500' : 'text-slate-400'}`} />
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={day.dinnerNote || ''}
                        onChange={(e) => handleNoteChange(index, 'dinnerNote', e.target.value)}
                        placeholder="Dinner note..."
                        maxLength={80}
                        className={`w-full text-[10px] px-2 py-1 rounded-md border focus:ring-1 focus:ring-indigo-500 outline-none ${
                          isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                    ) : (
                      <p className={`text-[10px] truncate ${day.dinnerNote ? (isDark ? 'text-slate-300' : 'text-slate-700') : textMuted}`}>
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
