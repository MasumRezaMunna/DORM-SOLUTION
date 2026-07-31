import { CURRENCY_SYMBOL } from './constants';

/**
 * Returns today's date as YYYY-MM-DD in the LOCAL timezone.
 * Use this instead of new Date().toISOString().split('T')[0] which always uses UTC
 * and shows yesterday's date for UTC+ users after midnight.
 */
export const localDateString = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Format a number as BDT currency
 * @param {number} amount
 * @returns {string} e.g., "৳ 5,500"
 */
export const formatCurrency = (amount = 0) => {
  return `${CURRENCY_SYMBOL} ${Number(amount).toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Format a date to a readable string
 * @param {string|Date} date
 * @param {object} options - Intl.DateTimeFormat options
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-BD', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(new Date(date));
};

/**
 * Format a date to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  if (!date) return '—';
  const diff = Date.now() - new Date(date).getTime();
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return rtf.format(-days, 'day');
  if (hours > 0) return rtf.format(-hours, 'hour');
  if (minutes > 0) return rtf.format(-minutes, 'minute');
  return 'Just now';
};

/**
 * Get month name from month number
 */
export const getMonthName = (month) => {
  return new Date(2000, month - 1, 1).toLocaleString('en', { month: 'long' });
};

/**
 * Truncate long text with ellipsis
 */
export const truncate = (str = '', maxLength = 100) => {
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
};

/**
 * Get initials from a full name (e.g., "Rahim Khan" → "RK")
 */
export const getInitials = (name = '') => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Debounce a function call
 */
export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
