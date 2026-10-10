import { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import funToast from '../../utils/funToast';

// Explicitly configure Asia/Dhaka formatters
const TIME_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Dhaka',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
});

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Dhaka',
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

/**
 * Live Digital Clock component
 * Formatted for Asia/Dhaka (BST) with Scandinavian Calm × Bold Futuristic styling.
 * Adapts seamlessly to Light and Dark modes, and collapses gracefully on small mobile screens.
 */
export default function DigitalClock({ className = '' }) {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    // Tick every second
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Format time parts with fallback
  let hour = '12';
  let minute = '00';
  let second = '00';
  let dayPeriod = 'AM';

  try {
    const parts = TIME_FORMATTER.formatToParts(currentTime);
    hour = parts.find((p) => p.type === 'hour')?.value || hour;
    minute = parts.find((p) => p.type === 'minute')?.value || minute;
    second = parts.find((p) => p.type === 'second')?.value || second;
    dayPeriod = parts.find((p) => p.type === 'dayPeriod')?.value || dayPeriod;
  } catch {
    // Fallback in case of parsing exception
    const rawTime = TIME_FORMATTER.format(currentTime);
    const [t, p] = rawTime.split(' ');
    if (t) {
      const [h, m, s] = t.split(':');
      hour = h || hour;
      minute = m || minute;
      second = s || second;
    }
    if (p) dayPeriod = p;
  }

  // Format date
  let dateString = '';
  try {
    dateString = DATE_FORMATTER.format(currentTime);
  } catch {
    dateString = currentTime.toLocaleDateString();
  }

  const lastClickRef = useRef(0);

  const handleClockClick = () => {
    const now = Date.now();
    if (now - lastClickRef.current < 2000) return; // 2s cooldown to prevent spam
    lastClickRef.current = now;

    const DORM_TIME_WISDOM = [
      'ভায়া, ঘড়ি যতই দেখ, পুরনো টাইম ফেরত আসবে না! ⏰',
      'সময় ও সকালের নাস্তা কারো জন্য অপেক্ষা করে না! 🍳⏳',
      'ঘড়ির কাঁটা ঘুরছে—আজকের বাজারটা কিন্তু তোমাকেই করতে হবে!',
      'রাত ৩টায় হঠাৎ খিদে লাগার সাথে সময়ের অদ্ভুত টান আছে, তাই না?!',
      'Time is money!',
    ];

    const quote = DORM_TIME_WISDOM[Math.floor(Math.random() * DORM_TIME_WISDOM.length)];
    funToast.clockWisdom(quote);
  };

  const accessibleLabel = `Dhaka time: ${hour}:${minute}:${second} ${dayPeriod}, ${dateString}`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClockClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClockClick();
        }
      }}
      className={`inline-flex items-center gap-2 sm:gap-2.5 px-2 py-1 sm:px-2.5 sm:py-1 rounded-xl border border-[#DDE1D8] dark:border-[#394239] bg-[#ECECE4]/60 hover:bg-[#ECECE4] dark:bg-[#202720]/80 dark:hover:bg-[#202720] hover:border-[#748D6B] dark:hover:border-[#A3B18A] transition-all select-none cursor-pointer active:scale-95 shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)] ${className}`}
      title={`Live Asia/Dhaka Time (BST) · Click for dorm wisdom ⏰ · ${accessibleLabel}`}
      aria-label={`${accessibleLabel}. Click for dorm wisdom`}
    >
      {/* Subtle watch icon badge */}
      <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#E8EDE3] dark:bg-[#292F29] text-[#526B52] dark:text-[#A3B18A] border border-[#DDE1D8]/60 dark:border-[#394239]/80 flex-shrink-0">
        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
      </div>

      {/* Clock display */}
      <div className="flex flex-col justify-center min-w-0">
        {/* Top: Digital Time Display */}
        <div className="flex items-center gap-1 leading-none font-mono tracking-tight">
          <span className="text-xs sm:text-sm font-bold text-[#202720] dark:text-[#F0F1E9] tabular-nums">
            {hour}
            <span className="text-[#687168] dark:text-[#B1B8AC] opacity-60 mx-[1px]">:</span>
            {minute}
            <span className="text-[#687168] dark:text-[#B1B8AC] opacity-60 mx-[1px]">:</span>
            <span className="text-[#526B52] dark:text-[#A3B18A] font-semibold">{second}</span>
          </span>

          {/* AM / PM badge */}
          <span className="text-[9px] sm:text-[10px] font-bold font-mono tracking-wider px-1 py-0.5 rounded bg-[#526B52]/10 text-[#526B52] dark:bg-[#A3B18A]/15 dark:text-[#A3B18A] uppercase leading-none">
            {dayPeriod}
          </span>
        </div>

        {/* Bottom: Date & Location label (hidden on compact mobile screens, visible on sm and up) */}
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-[#687168] dark:text-[#B1B8AC] mt-0.5 leading-none font-medium">
          <span className="whitespace-nowrap">{dateString}</span>
          <span className="w-1 h-1 rounded-full bg-[#526B52]/40 dark:bg-[#A3B18A]/40" aria-hidden="true" />
          <span className="inline-flex items-center gap-1 text-[9px] font-semibold tracking-wider uppercase text-[#526B52] dark:text-[#A3B18A]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            DHAKA · BST
          </span>
        </div>
      </div>
    </div>
  );
}
