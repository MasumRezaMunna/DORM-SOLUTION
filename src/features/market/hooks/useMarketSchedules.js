/**
 * useMarketSchedules — TanStack Query hooks for the Market Team Management feature.
 * All API calls go through the shared axios instance (`api`) which attaches JWT automatically.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../config/axios';
import { QUERY_KEYS } from '../../../utils/constants';
import toast from 'react-hot-toast';
import funToast from '../../../utils/funToast';
import { triggerConfetti } from '../../../utils/confetti';

// ─── Manager Hooks ────────────────────────────────────────────────────────────

/**
 * Fetch all schedules (manager).
 * @param {object} filters  { status, month, year, search, page, limit }
 */
export const useMarketSchedules = (filters = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.MARKET_SCHEDULES, filters],
    queryFn: async () => {
      const { data } = await api.get('/market-schedules', { params: filters });
      return data; // { data, pagination }
    },
    placeholderData: { data: [], pagination: null },
  });
};

/** Fetch a single schedule by id */
export const useMarketSchedule = (id) => {
  return useQuery({
    queryKey: QUERY_KEYS.MARKET_SCHEDULE(id),
    queryFn: async () => {
      const { data } = await api.get(`/market-schedules/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

/** Market statistics counts (for manager dashboard / page header) */
export const useMarketStats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.MARKET_STATS,
    queryFn: async () => {
      const now = new Date();
      const { data } = await api.get(`/market-schedules/stats?month=${now.getMonth() + 1}&year=${now.getFullYear()}`);
      return data.data;
    },
    placeholderData: { total: 0, upcoming: 0, today: 0, completed: 0 },
  });
};

/** Rotation suggestion — members sorted by fairness */
export const useRotationSuggestion = () => {
  return useQuery({
    queryKey: QUERY_KEYS.MARKET_ROTATION,
    queryFn: async () => {
      const { data } = await api.get('/market-schedules/rotation-suggestion');
      return data.data;
    },
    placeholderData: [],
  });
};

// ─── Shared Hooks (member + manager) ─────────────────────────────────────────

/** Today's market team */
export const useTodaySchedule = () => {
  return useQuery({
    queryKey: QUERY_KEYS.MARKET_TODAY,
    queryFn: async () => {
      const { data } = await api.get('/market-schedules/today');
      return data.data;
    },
    placeholderData: null,
    staleTime: 1000 * 60 * 5, // 5 min
  });
};

/** Upcoming schedules (nearest first, excludes today) */
export const useUpcomingSchedules = () => {
  return useQuery({
    queryKey: QUERY_KEYS.MARKET_UPCOMING,
    queryFn: async () => {
      const { data } = await api.get('/market-schedules/upcoming');
      return data.data;
    },
    placeholderData: [],
  });
};

/** All completed schedules (paginated) */
export const useScheduleHistory = (params = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.MARKET_HISTORY, params],
    queryFn: async () => {
      const { data } = await api.get('/market-schedules/history', { params });
      return data;
    },
    placeholderData: { data: [], pagination: null },
  });
};

/** Schedules where the logged-in member participated */
export const useMySchedules = () => {
  return useQuery({
    queryKey: QUERY_KEYS.MARKET_ME,
    queryFn: async () => {
      const { data } = await api.get('/market-schedules/me');
      return data.data; // { schedules, summary }
    },
    placeholderData: { schedules: [], summary: { totalDuties: 0, lastMarketDate: null, nextAssignedDate: null } },
  });
};

// ─── Mutations ────────────────────────────────────────────────────────────────

const invalidateAllMarketQueries = (qc) => {
  qc.invalidateQueries({ queryKey: QUERY_KEYS.MARKET_SCHEDULES });
  qc.invalidateQueries({ queryKey: QUERY_KEYS.MARKET_STATS });
  qc.invalidateQueries({ queryKey: QUERY_KEYS.MARKET_TODAY });
  qc.invalidateQueries({ queryKey: QUERY_KEYS.MARKET_UPCOMING });
  qc.invalidateQueries({ queryKey: QUERY_KEYS.MARKET_ROTATION });
  qc.invalidateQueries({ queryKey: QUERY_KEYS.MARKET_HISTORY });
  qc.invalidateQueries({ queryKey: QUERY_KEYS.MARKET_ME });
  qc.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_MANAGER });
  qc.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_MEMBER });
};

export const useCreateSchedule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post('/market-schedules', payload),
    onSuccess: () => {
      invalidateAllMarketQueries(qc);
      funToast.marketSuccess('বাজারের মিশন সফল! শিডিউল তৈরি হয়েছে! 🫡🛒');
    },
    onError: (err) => {
      funToast.error(err, 'বাজারের শিডিউল তৈরি করা যায়নি। আবার চেষ্টা করো।');
    },
  });
};

export const useUpdateSchedule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => api.patch(`/market-schedules/${id}`, payload),
    onSuccess: () => {
      invalidateAllMarketQueries(qc);
      funToast.marketSuccess('বাজারের শিডিউল আপডেট সফল! 🥦');
    },
    onError: (err) => {
      funToast.error(err, 'বাজারের শিডিউল আপডেট করা যায়নি।');
    },
  });
};

export const useDeleteSchedule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/market-schedules/${id}`),
    onSuccess: () => {
      invalidateAllMarketQueries(qc);
      funToast.success('বাজারের শিডিউল মুছে ফেলা হয়েছে! 🗑️');
    },
    onError: (err) => {
      funToast.error(err, 'বাজারের শিডিউল মোছা যায়নি।');
    },
  });
};
