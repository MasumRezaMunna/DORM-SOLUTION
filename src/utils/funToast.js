import toast from 'react-hot-toast';
import { triggerConfetti } from './confetti';
import soundManager from './soundEffects';

const SUCCESS_POOLS = {
  meal: [
    'Meal update হয়ে গেছে—এবার খাওয়ার পালা! 🍚',
    'Done, boss! খাবারের হিসাব পাকা! 🍳',
    'মিল এন্ট্রি সফল! সময়মতো ডাইনিংয়ে চলে এসো! 🍲',
  ],
  market: [
    'বাজারের মিশন সফল! 🫡🛒',
    'বাজারের লিস্ট সেভ হয়েছে—কড়া হিসাব! 🥦',
    'Done, boss! সব কেনাকাটা এন্ট্রি হয়েছে! 🥕',
  ],
  payment: [
    'টাকার হিসাব কড়া! পেমেন্ট রেকর্ড সম্পন্ন! 💸',
    'Done, boss! হিসাব একদম ক্লিয়ার! 🧾',
    'পেমেন্ট আপডেট সফল! সব ক্লিয়ার! ✅',
  ],
  expense: [
    'Done, boss! খরচের ভাউচার সেভ হয়েছে! 🏷️',
    'খরচের হিসাব এন্ট্রি হয়ে গেছে! 📊',
  ],
  member: [
    'সব সেট! তুমি একদম on fire! 🔥',
    'মেম্বারের তথ্য আপডেট সফল! 🏠',
  ],
  profile: [
    'প্রোফাইল আপডেট হয়েছে! একদম চকচকে! ✨',
    'Done, boss! প্রোফাইল সেভ হয়েছে! 👤',
  ],
  notice: [
    'নোটিশ পাবলিশ হয়েছে! সবাই অ্যালার্ট! 📢',
    'Done, boss! নতুন নোটিশ লাইভ! 📌',
  ],
  room: [
    'রুমের তথ্য সফলভাবে সেভ হয়েছে! 🚪',
  ],
  complaint: [
    'অভিযোগ নথিভুক্ত হয়েছে! ব্যবস্থা নেওয়া হচ্ছে! 📝',
  ],
  general: [
    'Done, boss! কাজটা হয়ে গেছে! ✅',
    'সব সেট! তুমি একদম on fire! 🔥',
    'মিশন সাকসেসফুল! কাজ শেষ! ✨',
  ],
};

const DORM_TIPS = [
  'Dorm Rule: শেষ ডিমটা কে খেয়েছে, তদন্ত চলছে! 🥚',
  'আজকে যার বাসন ধোয়ার পালা, মনে রেখো কিন্তু! 🍽️',
  'রাতের ডাইনিং শেষ হওয়ার আগে প্লেট নিয়ে দৌড়াও! 🍛',
  'চা-বিস্কুট একা খাওয়া মেসের আইন পরিপন্থী! ☕',
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Enhanced Fun Toast utility tailored for Home (Dorm Solution).
 * Provides context-aware Bengali & English messages, sanitized errors,
 * Easter eggs, and celebration effects.
 */
export const funToast = {
  /**
   * Show a fun context-aware success message.
   * @param {string} [customMessage] Explicit custom message, or leave null to pick a witty one
   * @param {object} [options] category ('meal'|'market'|'payment'|'expense'|'member'|'notice'|'general'), confetti type
   */
  success: (customMessage, options = {}) => {
    const category = options.category || 'general';
    const pool = SUCCESS_POOLS[category] || SUCCESS_POOLS.general;
    
    // Choose message
    let message = customMessage;
    if (!message) {
      message = getRandomItem(pool);
    }

    // ~15% chance of attaching a fun dorm tip if message is short
    if (Math.random() < 0.15 && !options.noTip) {
      const tip = getRandomItem(DORM_TIPS);
      message = `${message}\n💡 ${tip}`;
    }

    if (options.confetti) {
      triggerConfetti(typeof options.confetti === 'string' ? options.confetti : 'default');
    }

    // Play subtle success chime
    soundManager.playSuccess();

    return toast.success(message, {
      duration: 3800,
      ...options,
    });
  },

  /**
   * Show a clear, polite, and helpful error toast explaining the problem.
   * Never masks real API messages, but wraps them respectfully.
   * @param {any} error Axios error, Error instance, or string
   * @param {string} [fallback] Default fallback message
   */
  error: (error, fallback = 'Oops, boss! কাজটা হয়নি। আবার চেষ্টা করো।') => {
    let cleanMessage = fallback;

    if (typeof error === 'string') {
      cleanMessage = error;
    } else if (error?.response?.data?.message) {
      cleanMessage = error.response.data.message;
    } else if (error?.message) {
      if (error.message.includes('Network Error') || error.code === 'ERR_NETWORK') {
        cleanMessage = 'Connection একটু ঝামেলা করছে। Internet check করে আবার চেষ্টা করো। 🔌';
      } else {
        cleanMessage = error.message;
      }
    }

    // Polite prefix if not already present
    const prefix = 'Oops! ';
    const display = cleanMessage.startsWith('Oops') ? cleanMessage : `${prefix}${cleanMessage}`;

    // Play subtle error pulse
    soundManager.playError();

    return toast.error(display, {
      duration: 5000,
    });
  },

  /**
   * Easter egg celebration toast
   */
  easterEgg: (message = '🎉 Secret Unlocked! তুমি একজন Certified Dorm Survivor! 🏆') => {
    triggerConfetti('default');
    soundManager.playEasterEgg();
    return toast(message, {
      icon: '🏆',
      duration: 4500,
      style: {
        border: '2px solid #526B52',
        background: '#FAF9F5',
        color: '#202720',
        fontWeight: 'bold',
      },
    });
  },

  /**
   * Clock wisdom easter egg
   */
  clockWisdom: (quote) => {
    soundManager.playClick();
    return toast(quote, {
      icon: '⏰',
      duration: 4000,
      style: {
        border: '1px solid #748D6B',
        background: '#FAF9F5',
        color: '#202720',
        fontSize: '13px',
      },
    });
  },

  // Category helpers for convenience
  mealSuccess: (msg) => funToast.success(msg, { category: 'meal', confetti: 'meal' }),
  marketSuccess: (msg) => funToast.success(msg, { category: 'market', confetti: 'market' }),
  paymentSuccess: (msg) => funToast.success(msg, { category: 'payment', confetti: 'payment' }),
  expenseSuccess: (msg) => funToast.success(msg, { category: 'expense', confetti: 'payment' }),
  memberSuccess: (msg) => funToast.success(msg, { category: 'member', confetti: 'member' }),
  profileSuccess: (msg) => funToast.success(msg, { category: 'profile' }),
  noticeSuccess: (msg) => funToast.success(msg, { category: 'notice' }),
};

export default funToast;
