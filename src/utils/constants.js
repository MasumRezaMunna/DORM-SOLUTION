// ─── Application-wide Constants ──────────────────────────────────────────────

export const APP_NAME = '4/67 Home';
export const APP_TAGLINE = 'Smart Dormitory Management';
export const CURRENCY_SYMBOL = '৳';
export const CURRENCY_CODE = 'BDT';

// ─── User Roles ───────────────────────────────────────────────────────────────
export const ROLES = {
  MANAGER: 'manager',
  MEMBER: 'member',
};

// ─── Bill Status ──────────────────────────────────────────────────────────────
export const BILL_STATUS = {
  PENDING: 'pending',
  PARTIAL: 'partial',
  PAID: 'paid',
};

export const BILL_STATUS_COLORS = {
  pending: 'danger',
  partial: 'warning',
  paid: 'success',
};

// ─── Complaint Types ──────────────────────────────────────────────────────────
export const COMPLAINT_TYPES = [
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'service', label: 'Service' },
  { value: 'food', label: 'Food' },
  { value: 'noise', label: 'Noise' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'other', label: 'Other' },
];

// ─── Expense Types ───────────────────────────────────────────────────────
export const EXPENSE_TYPES = [
  { value: 'Grocery', label: 'Grocery', icon: '🛒', color: 'green' },
  { value: 'Common', label: 'Common', icon: '🏠', color: 'blue' },
];

// ─── Months ───────────────────────────────────────────────────────────────────
export const MONTHS = [
  { value: 1, label: 'January', bn: 'জানুয়ারি' },
  { value: 2, label: 'February', bn: 'ফেব্রুয়ারি' },
  { value: 3, label: 'March', bn: 'মার্চ' },
  { value: 4, label: 'April', bn: 'এপ্রিল' },
  { value: 5, label: 'May', bn: 'মে' },
  { value: 6, label: 'June', bn: 'জুন' },
  { value: 7, label: 'July', bn: 'জুলাই' },
  { value: 8, label: 'August', bn: 'আগস্ট' },
  { value: 9, label: 'September', bn: 'সেপ্টেম্বর' },
  { value: 10, label: 'October', bn: 'অক্টোবর' },
  { value: 11, label: 'November', bn: 'নভেম্বর' },
  { value: 12, label: 'December', bn: 'ডিসেম্বর' },
];

// ─── Payment Methods ──────────────────────────────────────────────────────────
export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bkash', label: 'bKash' },
  { value: 'nagad', label: 'Nagad' },
  { value: 'rocket', label: 'Rocket' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' },
];

// ─── Room Types ────────────────────────────────────────────────────────────────
export const ROOM_TYPES = [
  { value: 'single', label: 'Single', capacity: 1 },
  { value: 'double', label: 'Double', capacity: 2 },
  { value: 'triple', label: 'Triple', capacity: 3 },
  { value: 'quad', label: 'Quad', capacity: 4 },
];

// ─── Notice Priority ──────────────────────────────────────────────────────────
export const NOTICE_PRIORITY_COLORS = {
  low: 'default',
  medium: 'primary',
  high: 'warning',
  urgent: 'danger',
};

// ─── Query Keys (TanStack Query) ──────────────────────────────────────────────
export const QUERY_KEYS = {
  AUTH_ME: ['auth', 'me'],
  DASHBOARD_MANAGER: ['dashboard', 'manager'],
  DASHBOARD_MEMBER: ['dashboard', 'member'],
  MEMBERS: ['members'],
  MEMBER: (id) => ['members', id],
  ROOMS: ['rooms'],
  ROOM: (id) => ['rooms', id],
  BILLS: ['bills'],
  BILL: (id) => ['bills', id],
  MY_BILLS: ['bills', 'my'],
  PAYMENTS: ['payments'],
  EXPENSES: ['expenses'],
  MEALS: ['meals'],
  NOTICES: ['notices'],
  COMPLAINTS: ['complaints'],
  MY_COMPLAINTS: ['complaints', 'my'],
  VISITORS: ['visitors'],
  NOTIFICATIONS: ['notifications'],
  SETTINGS: ['settings'],
  // ─── Market Team ───────────────────────────────────────────────────────────
  MARKET_SCHEDULES:  ['market-schedules'],
  MARKET_SCHEDULE:   (id) => ['market-schedules', id],
  MARKET_TODAY:      ['market-schedules', 'today'],
  MARKET_UPCOMING:   ['market-schedules', 'upcoming'],
  MARKET_HISTORY:    ['market-schedules', 'history'],
  MARKET_ME:         ['market-schedules', 'me'],
  MARKET_ROTATION:   ['market-schedules', 'rotation'],
  MARKET_STATS:      ['market-schedules', 'stats'],
};
