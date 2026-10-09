import { useState, useEffect } from 'react';
import {
  Button, Input, Avatar, Chip, Skeleton,
} from '@heroui/react';
import { useForm, Controller } from 'react-hook-form';
import { X, Calendar, Users, StickyNote, ShoppingCart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../config/axios';
import { QUERY_KEYS } from '../../../utils/constants';
import { useTheme } from '../../../contexts/ThemeContext';
import { getMemberInitials } from '../utils/marketHelpers';
import { localDateString } from '../../../utils/helpers';
import DutyRotationSuggestion from './DutyRotationSuggestion';

/**
 * MarketScheduleForm
 * Used for both Create and Edit actions inside a modal.
 *
 * Props:
 *  defaultValues   {object}  - pre-fill for edit mode
 *  onSubmit        {fn}      - called with validated payload { marketDate, members, note }
 *  isLoading       {boolean} - disables submit while mutation is pending
 *  onCancel        {fn}
 */
export default function MarketScheduleForm({ defaultValues = {}, onSubmit, isLoading, onCancel }) {
  const { isDark } = useTheme();
  const isEdit = !!defaultValues?._id;

  // ── Fetch all active members for the picker ──────────────────────────────
  const { data: memberList = [], isLoading: membersLoading } = useQuery({
    queryKey: QUERY_KEYS.MEMBERS,
    queryFn: async () => {
      const { data } = await api.get('/members');
      return data.data || [];
    },
  });

  // ── Selected members state ───────────────────────────────────────────────
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Pre-fill selected members in edit mode
  useEffect(() => {
    if (defaultValues?.members?.length) {
      setSelectedMembers(defaultValues.members);
    }
  }, [defaultValues]);

  // ── React Hook Form ──────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      marketDate: defaultValues?.marketDate
        ? localDateString(new Date(defaultValues.marketDate))
        : '',
      note: defaultValues?.note || '',
    },
  });

  // ── Member selection helpers ─────────────────────────────────────────────
  const toggleMember = (member) => {
    const userId = member.userId?._id?.toString() || member.userId?.toString() || member._id?.toString();
    setSelectedMembers((prev) => {
      const exists = prev.find(
        (m) => (m.userId?._id?.toString() || m.userId?.toString()) === userId
      );
      if (exists) return prev.filter((m) => (m.userId?._id?.toString() || m.userId?.toString()) !== userId);
      if (prev.length >= 3) return prev; // max 3
      return [
        ...prev,
        {
          userId: member.userId?._id || member.userId,
          name:   member.userId?.displayName || member.name || 'Unknown',
          email:  member.userId?.email || member.email || '',
          photo:  member.userId?.photoURL || member.photo || null,
        },
      ];
    });
  };

  // Called from DutyRotationSuggestion quick-select
  const handleSuggestionSelect = (suggestion) => {
    const uid = suggestion.userId?.toString();
    setSelectedMembers((prev) => {
      const exists = prev.find((m) => (m.userId?.toString()) === uid);
      if (exists) return prev.filter((m) => m.userId?.toString() !== uid);
      if (prev.length >= 3) return prev;
      return [...prev, {
        userId: suggestion.userId,
        name:   suggestion.name,
        email:  suggestion.email,
        photo:  suggestion.photo,
      }];
    });
  };

  // ── Form submit ──────────────────────────────────────────────────────────
  const onValid = (formData) => {
    if (selectedMembers.length < 2) return; // guard (UI also shows error)
    const payload = {
      marketDate: formData.marketDate,
      members:    selectedMembers,
      note:       formData.note || null,
    };
    onSubmit(payload);
  };

  // ── Styles ───────────────────────────────────────────────────────────────
  const inputClass = `w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors border-[#DDE1D8] dark:border-[#394239] bg-white dark:bg-[#202720] text-[#202720] dark:text-[#F0F1E9] placeholder:text-[#687168]/60 dark:placeholder:text-[#B1B8AC]/60 focus:border-[#748D6B] dark:focus:border-[#A3B18A] focus:ring-1 focus:ring-[#748D6B] dark:focus:ring-[#A3B18A]`;
  const labelClass = `text-sm font-semibold mb-1.5 flex items-center gap-1.5 ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`;
  const errorClass = 'text-xs text-rose-500 dark:text-rose-400 mt-1 font-medium';
  const today = localDateString();

  const selectedIds = selectedMembers.map((m) => m.userId?.toString());

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-5">

      {/* ── Date picker ───────────────────────────────────────────────── */}
      <div>
        <label className={labelClass}>
          <Calendar className="w-4 h-4 text-[#526B52] dark:text-[#A3B18A]" />
          Market Date
        </label>
        <input
          type="date"
          min={today}
          {...register('marketDate', {
            required: 'Market date is required',
            validate: (v) => v >= today || 'Cannot select a past date',
          })}
          className={inputClass}
        />
        {errors.marketDate && <p className={errorClass}>{errors.marketDate.message}</p>}
      </div>

      {/* ── Member Picker ─────────────────────────────────────────────── */}
      <div>
        <label className={labelClass}>
          <Users className="w-4 h-4 text-[#748D6B] dark:text-[#A3B18A]" />
          Team Members
          <span className={`text-xs ml-1 font-normal ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>(select 2–3)</span>
        </label>

        {/* Selected chips */}
        {selectedMembers.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedMembers.map((m) => {
              const uid = m.userId?.toString();
              return (
                <Chip
                  key={uid}
                  onClose={() => toggleMember({ userId: m.userId, userId: { _id: m.userId } })}
                  variant="flat"
                  className="bg-[#E8EDE3] dark:bg-[#303A30] text-[#526B52] dark:text-[#A3B18A] font-semibold"
                  avatar={
                    <Avatar
                      src={m.photo}
                      name={getMemberInitials(m.name)}
                      size="sm"
                    />
                  }
                >
                  {m.name}
                </Chip>
              );
            })}
          </div>
        )}

        {/* Member list */}
        <div className={`rounded-xl border ${isDark ? 'border-[#394239] bg-[#202720]' : 'border-[#DDE1D8] bg-[#ECECE4]/50'} max-h-44 overflow-y-auto`}>
          {membersLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 mx-3 my-2 rounded-xl" />
              ))
            : memberList.map((m) => {
                const uid = m.userId?._id?.toString() || m._id?.toString();
                const isSelected = selectedIds.includes(uid);
                const isDisabled = !isSelected && selectedMembers.length >= 3;

                return (
                  <div
                    key={uid}
                    onClick={() => !isDisabled && toggleMember(m)}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all
                      ${isSelected
                        ? (isDark ? 'bg-[#303A30] text-[#F0F1E9]' : 'bg-[#E8EDE3] text-[#202720]')
                        : (isDark ? 'hover:bg-[#292F29] text-[#B1B8AC]' : 'hover:bg-white text-[#202720]')
                      }
                      ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <Avatar
                      src={m.userId?.photoURL}
                      name={getMemberInitials(m.userId?.displayName || '')}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{m.userId?.displayName}</p>
                      <p className={`text-xs truncate ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>
                        {m.userId?.email}
                      </p>
                    </div>
                    {isSelected && (
                      <X className="w-4 h-4 text-[#526B52] dark:text-[#A3B18A]" />
                    )}
                  </div>
                );
              })}
        </div>

        {selectedMembers.length < 2 && (
          <p className={errorClass}>Please select at least 2 members</p>
        )}
        {selectedMembers.length > 3 && (
          <p className={errorClass}>Maximum 3 members allowed</p>
        )}
      </div>

      {/* ── Rotation Suggestion ───────────────────────────────────────── */}
      <DutyRotationSuggestion
        selectedIds={selectedIds}
        onSelect={handleSuggestionSelect}
        maxSelected={3}
      />

      {/* ── Note ─────────────────────────────────────────────────────── */}
      <div>
        <label className={labelClass}>
          <StickyNote className="w-4 h-4 text-amber-500" />
          Note
          <span className={`text-xs ml-1 font-normal ${isDark ? 'text-[#B1B8AC]' : 'text-[#687168]'}`}>(optional)</span>
        </label>
        <textarea
          rows={2}
          {...register('note')}
          placeholder="Any instructions or notes for the team..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* ── Actions ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${isDark ? 'text-[#B1B8AC] hover:text-[#F0F1E9] hover:bg-[#292F29]' : 'text-[#687168] hover:text-[#202720] hover:bg-[#ECECE4]'}`}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={selectedMembers.length < 2 || isLoading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#526B52] hover:bg-[#405640] dark:bg-[#A3B18A] dark:hover:bg-[#BAC7A8] text-white dark:text-[#171C18] text-sm font-bold shadow-sm disabled:opacity-50 transition-all"
        >
          {!isLoading && <ShoppingCart className="w-4 h-4" />}
          {isLoading ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Schedule')}
        </button>
      </div>
    </form>
  );
}
