/**
 * Market Schedule utility helpers
 * Pure functions — no React, no API calls
 */

/**
 * Normalise any date to a plain Date at local midnight.
 */
export const toLocalMidnight = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Compute status string from a stored marketDate.
 * @param {string|Date} marketDate
 * @returns {'today'|'upcoming'|'completed'}
 */
export const getMarketStatus = (marketDate) => {
  const today = toLocalMidnight(new Date());
  const d     = toLocalMidnight(marketDate);
  if (d.getTime() === today.getTime()) return 'today';
  if (d > today) return 'upcoming';
  return 'completed';
};

/**
 * Human-readable countdown label for a future (or today) date.
 * @param {string|Date} marketDate
 * @returns {string}  e.g. "Today", "Tomorrow", "In 3 Days", "In 2 Weeks"
 */
export const getCountdownLabel = (marketDate) => {
  const today = toLocalMidnight(new Date());
  const d     = toLocalMidnight(marketDate);
  const diff  = Math.round((d - today) / 86400000); // days difference

  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff < 7)  return `In ${diff} Days`;
  if (diff === 7) return 'In 1 Week';
  if (diff < 14) return `In ${diff} Days`;
  if (diff < 21) return 'In 2 Weeks';
  return `In ${Math.round(diff / 7)} Weeks`;
};

/**
 * HeroUI colour name for a given market status.
 * @param {'today'|'upcoming'|'completed'} status
 * @returns {string}
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'today':     return 'success';   // green
    case 'upcoming':  return 'primary';   // blue
    case 'completed': return 'default';   // gray
    default:          return 'default';
  }
};

/**
 * Tailwind gradient pair for a given status (used in card highlights).
 * @param {'today'|'upcoming'|'completed'} status
 * @returns {string}
 */
export const getStatusGradient = (status) => {
  switch (status) {
    case 'today':     return 'from-emerald-500 to-teal-600';
    case 'upcoming':  return 'from-blue-500 to-indigo-600';
    case 'completed': return 'from-slate-500 to-slate-700';
    default:          return 'from-slate-500 to-slate-700';
  }
};

/**
 * Build a member's initials from display name.
 */
export const getMemberInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
