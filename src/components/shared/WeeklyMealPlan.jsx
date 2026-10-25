import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, Sun, Moon, Edit, Save } from 'lucide-react';
import api from '../../config/axios';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { triggerConfetti } from '../../utils/confetti';

/**
 * WeeklyMealPlan
 *
 * Props:
 *   isManager {boolean} – show the Edit / Save button
 *   compact   {boolean} – render a minimal row-per-day list for the narrow
 *                         right-side panel (260 px). No viewport breakpoints.
 */
export default function WeeklyMealPlan({ isManager = false, compact = false }) {
  const { isDark } = useTheme();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState([]);

  const { data: plan, isLoading } = useQuery({
    queryKey: ['weeklyMealPlan'],
    queryFn: async () => {
      const { data } = await api.get('/meals/weekly-plan');
      return data.data;
    },
    staleTime: 30 * 1000,
  });

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
    if (plan?.days) {
      setEditData(JSON.parse(JSON.stringify(plan.days)));
      setIsEditing(true);
    }
  };

  const handleSave       = () => updateMutation.mutate(editData);
  const handleToggle     = (i, f) => { const n=[...editData]; n[i][f]=!n[i][f]; setEditData(n); };
  const handleNoteChange = (i, f, v) => { const n=[...editData]; n[i][f]=v; setEditData(n); };

  const cardBg    = isDark ? 'bg-[#202720] border-[#394239]' : 'bg-white border-[#DDE1D8] shadow-sm';
  const textMuted = isDark ? 'text-[#B1B8AC]' : 'text-[#687168]';

  // ── Shared top-bar edit/save button ─────────────────────────────────────────
  const EditButton = isManager ? (
    <button
      onClick={isEditing ? handleSave : handleEditClick}
      disabled={updateMutation.isPending}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
        isEditing
          ? 'bg-[#526B52] hover:bg-[#405640] dark:bg-[#A3B18A] dark:hover:bg-[#BAC7A8] text-white dark:text-[#171C18] shadow-sm'
          : isDark
          ? 'bg-[#292F29] hover:bg-[#303A30] text-[#F0F1E9] border border-[#394239]'
          : 'bg-[#ECECE4] hover:bg-[#E0E0D8] text-[#202720] border border-[#DDE1D8]'
      }`}
    >
      {isEditing
        ? <><Save className="w-4 h-4" />{updateMutation.isPending ? 'Saving…' : 'Save Plan'}</>
        : <><Edit className="w-4 h-4" />Edit Plan</>
      }
    </button>
  ) : null;

  // ── Loading state ────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className={`rounded-2xl border overflow-hidden animate-pulse ${cardBg}`}>
        <div className="px-6 py-4 border-b border-[#DDE1D8] dark:border-[#394239]">
          <div className="h-5 w-44 bg-[#ECECE4] dark:bg-[#292F29] rounded-lg" />
        </div>
        <div className="p-4 flex flex-col gap-2">
          {[1,2,3,4,5,6,7].map(i => (
            <div key={i} className="h-20 bg-[#ECECE4] dark:bg-[#292F29] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const days       = plan?.days || [];
  const activeDays = isEditing ? editData : days;
  const today      = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // ════════════════════════════════════════════════════════════════════════════
  // COMPACT VIEW — minimal row per day, no viewport breakpoints.
  // Used only inside the 260 px QuickAccessPanel right sidebar.
  // ════════════════════════════════════════════════════════════════════════════
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border overflow-hidden ${cardBg}`}
      >
        {/* Header */}
        <div className={`px-4 py-3 border-b flex items-center justify-between ${isDark ? 'border-[#394239]' : 'border-[#DDE1D8]'}`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#E8EDE3] text-[#526B52] dark:bg-[#303A30] dark:text-[#A3B18A]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className={`text-sm font-bold leading-none ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>
                Meal Plan
              </p>
              <p className={`text-[10px] font-medium mt-0.5 ${textMuted}`}>This week</p>
            </div>
          </div>
          {isManager && (
            <button
              onClick={isEditing ? handleSave : handleEditClick}
              disabled={updateMutation.isPending}
              aria-label={isEditing ? 'Save plan' : 'Edit plan'}
              className={`p-1.5 rounded-lg transition-colors ${
                isEditing
                  ? 'bg-[#526B52] text-white dark:bg-[#A3B18A] dark:text-[#171C18]'
                  : isDark
                  ? 'bg-[#292F29] text-[#B1B8AC] border border-[#394239] hover:bg-[#303A30]'
                  : 'bg-[#ECECE4] text-[#687168] border border-[#DDE1D8] hover:bg-[#E0E0D8]'
              }`}
            >
              {isEditing ? <Save className="w-3.5 h-3.5" /> : <Edit className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* One row per day */}
        <div className="divide-y divide-[#DDE1D8] dark:divide-[#394239]">
          {activeDays.map((day, index) => {
            const isToday   = day.dayName === today && !isEditing;
            const shortName = day.dayName.slice(0, 3);
            return (
              <div
                key={day.dayName}
                className={`px-3 transition-colors ${
                  isToday ? (isDark ? 'bg-[#303A30]/60' : 'bg-[#E8EDE3]/70') : ''
                } ${isEditing ? 'py-3' : 'py-2.5'}`}
              >
                {/* ── Top row: day name + L/D toggles ── */}
                <div className="flex items-center gap-2">
                  <div className="w-10 flex-shrink-0">
                    <span className={`text-xs font-bold ${isToday ? 'text-[#526B52] dark:text-[#A3B18A]' : isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>
                      {shortName}
                    </span>
                    {isToday && <span className="block text-[8px] uppercase font-black tracking-wider text-[#526B52] dark:text-[#A3B18A] leading-none mt-0.5">Today</span>}
                  </div>

                  {/* Lunch toggle / read indicator */}
                  {isEditing ? (
                    <button onClick={() => handleToggle(index, 'lunch')} className={`flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-md font-semibold flex-1 justify-center transition-colors ${day.lunch ? 'bg-[#FEF3C7] text-[#92400E] dark:bg-[#78350F]/40 dark:text-[#FCD34D]' : 'bg-[#ECECE4] text-[#687168] dark:bg-[#292F29] dark:text-[#B1B8AC]'}`}>
                      <Sun className="w-3 h-3" />{day.lunch ? 'Lunch On' : 'Lunch Off'}
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 flex-1 justify-center">
                      <Sun className={`w-3.5 h-3.5 ${day.lunch ? 'text-[#D97706]' : 'opacity-20'}`} />
                      <span className={`text-[10px] font-semibold ${day.lunch ? 'text-[#D97706]' : textMuted + ' opacity-40'}`}>{day.lunch ? 'Lunch' : '—'}</span>
                    </div>
                  )}

                  {/* Dinner toggle / read indicator */}
                  {isEditing ? (
                    <button onClick={() => handleToggle(index, 'dinner')} className={`flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-md font-semibold flex-1 justify-center transition-colors ${day.dinner ? 'bg-[#CCFBF1] text-[#115E59] dark:bg-[#134E4A]/40 dark:text-[#5EEAD4]' : 'bg-[#ECECE4] text-[#687168] dark:bg-[#292F29] dark:text-[#B1B8AC]'}`}>
                      <Moon className="w-3 h-3" />{day.dinner ? 'Dinner On' : 'Dinner Off'}
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 flex-1 justify-center">
                      <Moon className={`w-3.5 h-3.5 ${day.dinner ? 'text-[#0D9488]' : 'opacity-20'}`} />
                      <span className={`text-[10px] font-semibold ${day.dinner ? 'text-[#0D9488]' : textMuted + ' opacity-40'}`}>{day.dinner ? 'Dinner' : '—'}</span>
                    </div>
                  )}
                </div>

                {/* ── Meal notes: inputs in edit mode, text in read mode ── */}
                {(isEditing || day.lunchNote || day.dinnerNote) && (
                  <div className={`mt-2 flex flex-col gap-1.5 ${isEditing ? '' : 'pb-0.5'}`}>

                    {/* Lunch note */}
                    <div className="flex items-start gap-1.5">
                      <Sun className={`w-3 h-3 flex-shrink-0 mt-0.5 ${day.lunchNote ? 'text-[#D97706] opacity-80' : 'opacity-30'}`} />
                      {isEditing ? (
                        <input
                          type="text"
                          value={day.lunchNote || ''}
                          onChange={(e) => handleNoteChange(index, 'lunchNote', e.target.value)}
                          placeholder="Lunch menu…"
                          maxLength={120}
                          className={`flex-1 text-xs px-2.5 py-1.5 rounded-lg border focus:ring-1 focus:ring-[#748D6B]/60 dark:focus:ring-[#A3B18A]/50 outline-none transition-colors ${
                            isDark
                              ? 'bg-[#171C18] border-[#394239] text-[#F0F1E9] placeholder:text-[#687168]'
                              : 'bg-white border-[#DDE1D8] text-[#202720] placeholder:text-[#B1B8AC]'
                          }`}
                        />
                      ) : day.lunchNote ? (
                        <p className={`text-xs font-medium leading-snug break-words flex-1 ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>
                          {day.lunchNote}
                        </p>
                      ) : null}
                    </div>

                    {/* Dinner note */}
                    <div className="flex items-start gap-1.5">
                      <Moon className={`w-3 h-3 flex-shrink-0 mt-0.5 ${day.dinnerNote ? 'text-[#0D9488] opacity-80' : 'opacity-30'}`} />
                      {isEditing ? (
                        <input
                          type="text"
                          value={day.dinnerNote || ''}
                          onChange={(e) => handleNoteChange(index, 'dinnerNote', e.target.value)}
                          placeholder="Dinner menu…"
                          maxLength={120}
                          className={`flex-1 text-xs px-2.5 py-1.5 rounded-lg border focus:ring-1 focus:ring-[#748D6B]/60 dark:focus:ring-[#A3B18A]/50 outline-none transition-colors ${
                            isDark
                              ? 'bg-[#171C18] border-[#394239] text-[#F0F1E9] placeholder:text-[#687168]'
                              : 'bg-white border-[#DDE1D8] text-[#202720] placeholder:text-[#B1B8AC]'
                          }`}
                        />
                      ) : day.dinnerNote ? (
                        <p className={`text-xs font-medium leading-snug break-words flex-1 ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>
                          {day.dinnerNote}
                        </p>
                      ) : null}
                    </div>

                  </div>
                )}
              </div>
            );

          })}
        </div>
      </motion.div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // STANDARD VIEW
  //
  // Layout per day card (horizontal, full parent width):
  //
  //  ┌─────────┬──────────────────────────┬──────────────────────────┐
  //  │  Day    │  ☀ LUNCH                 │  🌙 DINNER               │
  //  │  name   │  Hilsha fish with rice   │  Chicken curry with      │
  //  │  [Today]│  and seasonal veg        │  naan and salad          │
  //  └─────────┴──────────────────────────┴──────────────────────────┘
  //
  // • Day column: flex-shrink-0, fixed width w-24 (mobile) / w-32 (sm+)
  // • Meal columns: flex-1 each — take ALL remaining width equally
  // • Meal note (the actual food name): text-sm, break-words, NO truncation
  // • On very small screens the two meal columns stack (flex-col sm:flex-row)
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full rounded-2xl border overflow-hidden ${cardBg}`}
    >
      {/* ── Component header ────────────────────────────────────────────────── */}
      <div className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? 'border-[#394239]' : 'border-[#DDE1D8]'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#E8EDE3] text-[#526B52] dark:bg-[#303A30] dark:text-[#A3B18A] flex-shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`font-bold tracking-tight ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>
              Weekly Meal Plan
            </h3>
            <p className={`text-xs font-medium ${textMuted}`}>Lunch &amp; Dinner Schedule</p>
          </div>
        </div>
        {EditButton}
      </div>

      {/* ── Day cards ───────────────────────────────────────────────────────── */}
      <div className="p-3 sm:p-4 flex flex-col gap-2.5">
        {activeDays.map((day, index) => {
          const isToday = day.dayName === today && !isEditing;

          return (
            <div
              key={day.dayName}
              className={`w-full flex flex-col sm:flex-row rounded-xl border overflow-hidden transition-all ${
                isToday
                  ? isDark
                    ? 'border-[#A3B18A]/40 ring-1 ring-[#A3B18A]/30'
                    : 'border-[#526B52]/35 ring-1 ring-[#526B52]/25'
                  : isDark
                  ? 'border-[#394239]'
                  : 'border-[#DDE1D8]'
              }`}
            >
              {/* ── Day column ────────────────────────────────────────────── */}
              <div className={`flex sm:flex-col justify-between sm:justify-center items-center sm:items-start px-4 py-3 sm:py-4 flex-shrink-0 sm:w-32 border-b sm:border-b-0 sm:border-r ${
                isToday
                  ? isDark ? 'bg-[#303A30]/70 border-[#A3B18A]/30' : 'bg-[#E8EDE3]/80 border-[#526B52]/25'
                  : isDark ? 'bg-[#292F29]/30 border-[#394239]'    : 'bg-[#F5F4EE]/70 border-[#DDE1D8]'
              }`}>
                <div>
                  <p className={`text-base font-extrabold tracking-tight leading-none ${
                    isToday ? 'text-[#526B52] dark:text-[#A3B18A]' : isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'
                  }`}>
                    {day.dayName.slice(0, 3)}
                  </p>
                  <p className={`text-xs font-medium mt-0.5 ${textMuted}`}>
                    {day.dayName.slice(3)}
                  </p>
                </div>
                {isToday && (
                  <span className="inline-flex items-center gap-1 text-[9px] uppercase font-black tracking-wider bg-[#526B52] dark:bg-[#A3B18A] text-white dark:text-[#171C18] px-2 py-0.5 rounded-full leading-none sm:mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/70 dark:bg-[#171C18]/60 animate-pulse" />
                    Today
                  </span>
                )}
              </div>

              {/* ── Meal columns ──────────────────────────────────────────── */}
              <div className="flex flex-col sm:flex-row flex-1 min-w-0 divide-y sm:divide-y-0 sm:divide-x divide-[#DDE1D8] dark:divide-[#394239]">

                {/* Lunch */}
                <div className="flex-1 min-w-0 p-4">
                  {/* Meal type header */}
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sun className={`w-3.5 h-3.5 flex-shrink-0 ${day.lunch ? 'text-[#D97706] dark:text-[#F59E0B]' : 'opacity-30'}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${day.lunch ? 'text-[#D97706] dark:text-[#F59E0B]' : textMuted}`}>
                      Lunch
                    </span>
                    {/* Edit mode: on/off toggle */}
                    {isEditing && (
                      <button
                        onClick={() => handleToggle(index, 'lunch')}
                        className={`ml-auto text-[10px] px-2 py-0.5 rounded-md font-bold flex-shrink-0 transition-colors ${
                          day.lunch
                            ? 'bg-[#FEF3C7] text-[#92400E] dark:bg-[#78350F]/40 dark:text-[#FCD34D]'
                            : isDark ? 'bg-[#292F29] text-[#B1B8AC] border border-[#394239]' : 'bg-[#ECECE4] text-[#687168] border border-[#DDE1D8]'
                        }`}
                      >
                        {day.lunch ? 'On' : 'Off'}
                      </button>
                    )}
                  </div>

                  {/* THE MEAL NAME — this is the primary content */}
                  {isEditing ? (
                    <input
                      type="text"
                      value={day.lunchNote || ''}
                      onChange={(e) => handleNoteChange(index, 'lunchNote', e.target.value)}
                      placeholder="What's for lunch? e.g. Rice with hilsha fish…"
                      maxLength={120}
                      className={`w-full text-sm px-3 py-2 rounded-lg border focus:ring-2 focus:ring-[#748D6B]/50 dark:focus:ring-[#A3B18A]/40 outline-none transition-colors ${
                        isDark
                          ? 'bg-[#171C18] border-[#394239] text-[#F0F1E9] placeholder:text-[#687168]'
                          : 'bg-white border-[#DDE1D8] text-[#202720] placeholder:text-[#B1B8AC]'
                      }`}
                    />
                  ) : (
                    <p className={`text-sm font-medium leading-snug break-words ${
                      day.lunchNote
                        ? isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'
                        : textMuted + ' italic text-xs'
                    }`}>
                      {day.lunchNote || (day.lunch ? 'Menu not set yet' : 'Not serving today')}
                    </p>
                  )}
                </div>

                {/* Dinner */}
                <div className="flex-1 min-w-0 p-4">
                  {/* Meal type header */}
                  <div className="flex items-center gap-1.5 mb-2">
                    <Moon className={`w-3.5 h-3.5 flex-shrink-0 ${day.dinner ? 'text-[#0D9488] dark:text-[#2DD4BF]' : 'opacity-30'}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${day.dinner ? 'text-[#0D9488] dark:text-[#2DD4BF]' : textMuted}`}>
                      Dinner
                    </span>
                    {/* Edit mode: on/off toggle */}
                    {isEditing && (
                      <button
                        onClick={() => handleToggle(index, 'dinner')}
                        className={`ml-auto text-[10px] px-2 py-0.5 rounded-md font-bold flex-shrink-0 transition-colors ${
                          day.dinner
                            ? 'bg-[#CCFBF1] text-[#115E59] dark:bg-[#134E4A]/40 dark:text-[#5EEAD4]'
                            : isDark ? 'bg-[#292F29] text-[#B1B8AC] border border-[#394239]' : 'bg-[#ECECE4] text-[#687168] border border-[#DDE1D8]'
                        }`}
                      >
                        {day.dinner ? 'On' : 'Off'}
                      </button>
                    )}
                  </div>

                  {/* THE MEAL NAME — this is the primary content */}
                  {isEditing ? (
                    <input
                      type="text"
                      value={day.dinnerNote || ''}
                      onChange={(e) => handleNoteChange(index, 'dinnerNote', e.target.value)}
                      placeholder="What's for dinner? e.g. Chicken curry with naan…"
                      maxLength={120}
                      className={`w-full text-sm px-3 py-2 rounded-lg border focus:ring-2 focus:ring-[#748D6B]/50 dark:focus:ring-[#A3B18A]/40 outline-none transition-colors ${
                        isDark
                          ? 'bg-[#171C18] border-[#394239] text-[#F0F1E9] placeholder:text-[#687168]'
                          : 'bg-white border-[#DDE1D8] text-[#202720] placeholder:text-[#B1B8AC]'
                      }`}
                    />
                  ) : (
                    <p className={`text-sm font-medium leading-snug break-words ${
                      day.dinnerNote
                        ? isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'
                        : textMuted + ' italic text-xs'
                    }`}>
                      {day.dinnerNote || (day.dinner ? 'Menu not set yet' : 'Not serving today')}
                    </p>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
