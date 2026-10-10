import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useSound } from '../../contexts/SoundContext';
import { triggerConfetti } from '../../utils/confetti';
import funToast from '../../utils/funToast';

// Playful dorm-life greetings (including funny cat meow reactions)
const GREETINGS = [
  'MEEE-OWWW! 🐱🔊 কে ডাকলো ভাই?! ঘুম ভাঙায় দিলি!',
  'মিয়াঁউউউ! 🐾 আজকের বাজার কি মাছ? ইলিশ নাকি রুই?!',
  'Meowww! 😾 ঘুমের মধ্যে ডাকাডাকি একদম ভালো না, boss!',
  'Boss, কাজ শুরু করবো? 😴',
  'life কেমন চলছে? 👀',
  'ভাই, সব ঠিকঠাক তো? আজকের বাজার কে করবে? 🛒',
  'আমি ঘুমাচ্ছি না, শুধু চোখ বন্ধ করে ডাইনিংয়ের মেন্যু ভাবছি... 🍲',
  'রাত জাগা স্বাস্থ্যের জন্য ক্ষতিকর 🌙',
  'রান্না হতে আর কতক্ষণ বাকি? খিদে পেয়ে গেল তো! 🍚',
  'টাকার হিসাব তো মিলে না! 💸',
];

// Rare easter egg messages for repeated pokes (5 consecutive clicks)
const RARE_EASTER_EGGS = [
  'উফফ ব্যাথা পেলাম তো!',
  'উফফ গুজ্জদার ফেটে গেল',
  'মারছ কেন! আমি Manager না!',
  'Achievement unlocked: Certified Dorm Survivor! 🏆',
  'Secret unlocked! তুমি Home Gem খুঁজে পেয়েছো! 🎉',
  'সাবধান! ম্যানেজার কিন্তু সব হিসাব লাইভ মনিটর করছে! 👀',
];

/**
 * Dorm Mascot Component ("Chhoto Bhai")
 * A cozy, sleeping dorm companion resting in the bottom corner of the dashboard.
 * Snoozes with floating Zzz's, wakes up with a funny loud cat meow and comical reaction,
 * and hides secret dorm life Easter eggs when tapped repeatedly!
 */
export default function DormMascot() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { soundEnabled, toggleSound } = useSound();

  const [isAwake, setIsAwake] = useState(false);
  const [isStartled, setIsStartled] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isSnoozed, setIsSnoozed] = useState(() => {
    try {
      return sessionStorage.getItem('home_mascot_snoozed') === 'true';
    } catch {
      return false;
    }
  });

  const [clickStreak, setClickStreak] = useState(0);
  const streakTimerRef = useRef(null);
  const wakeTimeoutRef = useRef(null);
  const startledTimeoutRef = useRef(null);
  const catAudioRef = useRef(null);

  // Check reduced motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Initialize reusable Audio instance for cat meow
  useEffect(() => {
    try {
      const audio = new Audio('/dragon-studio-cat-meow-401729.mp3');
      audio.volume = 0.9;
      audio.preload = 'auto';

      audio.onended = () => {
        setIsStartled(false);
      };

      catAudioRef.current = audio;
    } catch (err) {
      console.warn('Could not initialize cat meow audio:', err);
    }

    return () => {
      if (catAudioRef.current) {
        catAudioRef.current.pause();
        catAudioRef.current = null;
      }
    };
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (streakTimerRef.current) clearTimeout(streakTimerRef.current);
      if (wakeTimeoutRef.current) clearTimeout(wakeTimeoutRef.current);
      if (startledTimeoutRef.current) clearTimeout(startledTimeoutRef.current);
    };
  }, []);

  const playCatMeow = () => {
    try {
      if (!catAudioRef.current) {
        catAudioRef.current = new Audio('/dragon-studio-cat-meow-401729.mp3');
        catAudioRef.current.volume = 0.9;
        catAudioRef.current.preload = 'auto';
        catAudioRef.current.onended = () => {
          setIsStartled(false);
        };
      }

      const audio = catAudioRef.current;
      // Prevent overlapping playback: reset to beginning
      audio.pause();
      audio.currentTime = 0;
      setIsStartled(true);

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Cat meow playback prevented by browser:', err);
          setIsStartled(false);
        });
      }
    } catch (err) {
      console.warn('Audio playback error:', err);
      setIsStartled(false);
    }
  };

  const getGreeting = () => {
    const firstName = user?.name ? user.name.split(' ')[0] : null;
    const personalized = firstName
      ? `${firstName}, তুমি এখনো ঘুমাওনি? কাজ চলছে? 🌙`
      : 'MEEE-OWWW! 🐱🔊 কে ডাকলো ভাই?! ঘুম ভাঙায় দিলি!';

    const pool = firstName ? [personalized, ...GREETINGS] : GREETINGS;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const handleWakeUp = (e, shouldPlaySound = true) => {
    if (e) e.stopPropagation();

    // Play cat sound and trigger surprised reaction on click
    if (shouldPlaySound) {
      playCatMeow();
      if (startledTimeoutRef.current) clearTimeout(startledTimeoutRef.current);
      startledTimeoutRef.current = setTimeout(() => {
        setIsStartled(false);
      }, 1600);
    }

    // Track consecutive clicks within 2.5s for Easter egg
    if (streakTimerRef.current) clearTimeout(streakTimerRef.current);
    const newStreak = clickStreak + 1;
    setClickStreak(newStreak);

    streakTimerRef.current = setTimeout(() => {
      setClickStreak(0);
    }, 2500);

    if (newStreak >= 5) {
      // 5 consecutive clicks -> Trigger Easter Egg!
      setClickStreak(0);
      const secret = RARE_EASTER_EGGS[Math.floor(Math.random() * RARE_EASTER_EGGS.length)];
      setCurrentMessage(`✨ ${secret}`);
      setIsAwake(true);
      triggerConfetti('default');
      funToast.easterEgg(secret);

      if (wakeTimeoutRef.current) clearTimeout(wakeTimeoutRef.current);
      wakeTimeoutRef.current = setTimeout(() => {
        setIsAwake(false);
        setIsStartled(false);
      }, 7000);
      return;
    }

    // Normal greeting
    setCurrentMessage(getGreeting());
    setIsAwake(true);

    if (wakeTimeoutRef.current) clearTimeout(wakeTimeoutRef.current);
    wakeTimeoutRef.current = setTimeout(() => {
      setIsAwake(false);
      setIsStartled(false);
    }, 4500);
  };

  const handleSnooze = (e) => {
    e.stopPropagation();
    setIsSnoozed(true);
    setIsAwake(false);
    setIsStartled(false);
    try {
      sessionStorage.setItem('home_mascot_snoozed', 'true');
    } catch { }
  };

  const handleUnSnooze = () => {
    setIsSnoozed(false);
    try {
      sessionStorage.setItem('home_mascot_snoozed', 'false');
    } catch { }
    handleWakeUp(null, true);
  };

  if (isSnoozed) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleUnSnooze}
        className="fixed bottom-5 left-5 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#DDE1D8] dark:border-[#394239] bg-white/90 dark:bg-[#202720]/90 backdrop-blur-md shadow-md text-xs font-semibold text-[#687168] dark:text-[#B1B8AC] hover:text-[#526B52] dark:hover:text-[#A3B18A] transition-all"
        title="Wake up dorm mascot"
        aria-label="Wake up dorm mascot"
      >
        <Moon className="w-3.5 h-3.5 text-[#526B52] dark:text-[#A3B18A]" />
        <span>Mascot 💤</span>
      </motion.button>
    );
  }

  return (
    <div
      className="fixed bottom-5 left-5 z-40 select-none flex flex-col items-start"
      onMouseEnter={() => { if (!isAwake) handleWakeUp(null, false); }}
    >
      {/* ── Speech Bubble ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isAwake && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className={`relative mb-2 max-w-[240px] sm:max-w-[280px] p-3 rounded-2xl rounded-bl-sm border shadow-lg backdrop-blur-md ${isDark
              ? 'bg-[#202720]/95 border-[#394239] text-[#F0F1E9]'
              : 'bg-white/95 border-[#DDE1D8] text-[#202720]'
              }`}
          >
            {/* Header / Dismiss */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#526B52] dark:text-[#A3B18A]">
                <Sparkles className="w-3 h-3" />
                Chhoto Bhai 🐱
              </span>
              <button
                onClick={handleSnooze}
                className="text-[#687168] dark:text-[#B1B8AC] hover:text-[#202720] dark:hover:text-white p-0.5 rounded transition-colors"
                title="Snooze mascot"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Content */}
            <p className="text-xs font-semibold leading-relaxed whitespace-pre-line">
              {currentMessage}
            </p>

            {/* Little pointer tail */}
            <div
              className={`absolute -bottom-1.5 left-4 w-3 h-3 rotate-45 border-r border-b ${isDark ? 'bg-[#202720] border-[#394239]' : 'bg-white border-[#DDE1D8]'
                }`}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mascot Character Base & Controls ──────────────────────────── */}
      <div className="relative flex items-center gap-2">
        {/* Floating startled MEOW exclamation badge */}
        <AnimatePresence>
          {isStartled && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5, y: 0 }}
              animate={{ opacity: 1, scale: [0.8, 1.25, 1], y: -22 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.35 }}
              className="absolute -top-1.5 left-6 font-black text-[10px] px-2 py-0.5 rounded-full bg-[#E8EDE3] dark:bg-[#303A30] text-[#526B52] dark:text-[#A3B18A] border border-[#526B52]/40 dark:border-[#A3B18A]/40 shadow-md flex items-center gap-1 pointer-events-none tracking-wider z-10"
            >
              MEOW! 🐱🔊
            </motion.span>
          )}
        </AnimatePresence>

        {/* Floating Zzz letters when sleeping */}
        {!isAwake && !prefersReducedMotion && (
          <div className="absolute -top-6 left-6 pointer-events-none flex flex-col items-center">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 0, x: 0, scale: 0.7 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [0, -18 - i * 6],
                  x: [0, 8 + i * 4],
                  scale: [0.7, 1.1, 0.9],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  delay: i * 0.7,
                  ease: 'easeInOut',
                }}
                className="absolute font-mono font-bold text-[#526B52] dark:text-[#A3B18A]"
                style={{ fontSize: 10 + i * 2 }}
              >
                z
              </motion.span>
            ))}
          </div>
        )}

        {/* The Mascot Body Button */}
        <motion.button
          onClick={(e) => handleWakeUp(e, true)}
          whileHover={{ scale: prefersReducedMotion ? 1 : 1.06 }}
          whileTap={{ scale: prefersReducedMotion ? 1 : 0.94 }}
          animate={
            prefersReducedMotion
              ? {}
              : isStartled
                ? {
                  rotate: [0, -14, 14, -10, 10, -5, 5, 0],
                  y: [0, -14, -2, -8, 0],
                  scale: [1, 1.18, 0.94, 1.06, 1],
                  transition: { duration: 0.65, ease: 'easeOut' },
                }
                : isAwake
                  ? { y: [0, -4, 0], transition: { duration: 0.35 } }
                  : { scaleY: [1, 1.03, 1], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }
          }
          className="relative group p-1.5 rounded-2xl border border-[#DDE1D8] dark:border-[#394239] bg-white/90 dark:bg-[#202720]/90 backdrop-blur-md shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#748D6B]"
          title="Sleeping Dorm Buddy · Click to poke & hear meow! 🐱🔊"
          aria-label="Sleeping Dorm Mascot · Click to hear meow sound"
        >
          {/* Custom SVG Illustration */}
          <svg
            width="44"
            height="44"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform duration-200"
          >
            {/* Soft Pillow / Cushion */}
            <path
              d="M8 48C8 42 16 38 32 38C48 38 56 42 56 48C56 54 48 58 32 58C16 58 8 54 8 48Z"
              fill={isDark ? '#292F29' : '#ECECE4'}
              stroke={isDark ? '#394239' : '#DDE1D8'}
              strokeWidth="2"
            />

            {/* Mascot Body (Sleepy Cat / Dorm Buddy) */}
            <circle
              cx="32"
              cy="34"
              r="18"
              fill={isDark ? '#303A30' : '#E8EDE3'}
              stroke={isDark ? '#526B52' : '#A3B18A'}
              strokeWidth="2.5"
            />

            {/* Left Ear */}
            <path
              d="M17 25L21 16L27 21Z"
              fill={isDark ? '#526B52' : '#A3B18A'}
            />
            {/* Right Ear */}
            <path
              d="M47 25L43 16L37 21Z"
              fill={isDark ? '#526B52' : '#A3B18A'}
            />

            {/* Nightcap / Sleeping Cap (Sage Green) */}
            <path
              d="M21 23C23 14 36 10 44 14C49 17 52 24 50 28C45 23 33 21 21 23Z"
              fill={isDark ? '#A3B18A' : '#526B52'}
            />
            {/* Pom-pom on nightcap */}
            <circle
              cx="51"
              cy="29"
              r="3.5"
              fill={isDark ? '#F0F1E9' : '#FFFFFF'}
              stroke={isDark ? '#526B52' : '#A3B18A'}
              strokeWidth="1.5"
            />

            {/* Face Expressions */}
            {isStartled ? (
              /* Startled / Meowing Expression: Dilated saucer eyes and open meowing mouth */
              <>
                {/* Surprised Cat Eyebrows */}
                <path
                  d="M23 27L28 29"
                  stroke={isDark ? '#A3B18A' : '#526B52'}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M41 27L36 29"
                  stroke={isDark ? '#A3B18A' : '#526B52'}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />

                {/* Left eye: Wide saucer eye with big dilated sparkle pupil */}
                <circle cx="26" cy="33" r="3.2" fill={isDark ? '#A3B18A' : '#202720'} />
                <circle cx="27.2" cy="31.8" r="1.1" fill="#FFFFFF" />
                <circle cx="25.2" cy="33.8" r="0.6" fill="#FFFFFF" />

                {/* Right eye: Wide saucer eye with big dilated sparkle pupil */}
                <circle cx="38" cy="33" r="3.2" fill={isDark ? '#A3B18A' : '#202720'} />
                <circle cx="39.2" cy="31.8" r="1.1" fill="#FFFFFF" />
                <circle cx="37.2" cy="33.8" r="0.6" fill="#FFFFFF" />

                {/* Cat Meow Mouth: Dramatic open mouth with cute tongue */}
                <ellipse
                  cx="32"
                  cy="38"
                  rx="3.5"
                  ry="4"
                  fill="#E06D6D"
                  stroke={isDark ? '#202720' : '#202720'}
                  strokeWidth="1.2"
                />
                <ellipse cx="32" cy="39.2" rx="2" ry="1.5" fill="#FFA5A5" />

                {/* Perked Cat Whiskers */}
                <path
                  d="M13 33.5L21 35"
                  stroke={isDark ? '#B1B8AC' : '#687168'}
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
                <path
                  d="M12 37L21 36.8"
                  stroke={isDark ? '#B1B8AC' : '#687168'}
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
                <path
                  d="M51 33.5L43 35"
                  stroke={isDark ? '#B1B8AC' : '#687168'}
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
                <path
                  d="M52 37L43 36.8"
                  stroke={isDark ? '#B1B8AC' : '#687168'}
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </>
            ) : isAwake ? (
              /* Normal Awake Expression: Bright glowing eyes and smile */
              <>
                {/* Left eye */}
                <circle cx="26" cy="33" r="2.5" fill={isDark ? '#A3B18A' : '#202720'} />
                <circle cx="27" cy="32" r="0.8" fill="#FFFFFF" />
                {/* Right eye */}
                <circle cx="38" cy="33" r="2.5" fill={isDark ? '#A3B18A' : '#202720'} />
                <circle cx="39" cy="32" r="0.8" fill="#FFFFFF" />
                {/* Cute smile */}
                <path
                  d="M29 37C31 39 33 39 35 37"
                  stroke={isDark ? '#F0F1E9' : '#202720'}
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* Gentle whiskers */}
                <path
                  d="M14 34.5L22 35.5"
                  stroke={isDark ? '#B1B8AC' : '#687168'}
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                <path
                  d="M14 37.5L22 37"
                  stroke={isDark ? '#B1B8AC' : '#687168'}
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                <path
                  d="M50 34.5L42 35.5"
                  stroke={isDark ? '#B1B8AC' : '#687168'}
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                <path
                  d="M50 37.5L42 37"
                  stroke={isDark ? '#B1B8AC' : '#687168'}
                  strokeWidth="1"
                  strokeLinecap="round"
                />
              </>
            ) : (
              /* Sleeping Expression: Curved sleeping eyes */
              <>
                {/* Left sleeping eye */}
                <path
                  d="M24 33C25.5 35 27.5 35 29 33"
                  stroke={isDark ? '#B1B8AC' : '#687168'}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Right sleeping eye */}
                <path
                  d="M35 33C36.5 35 38.5 35 40 33"
                  stroke={isDark ? '#B1B8AC' : '#687168'}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Sleeping mouth */}
                <path
                  d="M31 37H33"
                  stroke={isDark ? '#B1B8AC' : '#687168'}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </>
            )}

            {/* Cute rosy cheeks */}
            <ellipse
              cx="22"
              cy="36"
              rx="2"
              ry="1.2"
              fill={isDark ? 'rgba(163, 177, 138, 0.4)' : 'rgba(82, 107, 82, 0.3)'}
            />
            <ellipse
              cx="42"
              cy="36"
              rx="2"
              ry="1.2"
              fill={isDark ? 'rgba(163, 177, 138, 0.4)' : 'rgba(82, 107, 82, 0.3)'}
            />
          </svg>
        </motion.button>
      </div>
    </div>
  );
}
