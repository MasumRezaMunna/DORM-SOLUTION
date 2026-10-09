import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useSound } from '../../contexts/SoundContext';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * SoundToggle Component
 * A compact, accessible sound toggle control for the shared header.
 * Shows Volume2 with an active indicator when sound is on, and VolumeX when muted.
 * Strictly adheres to Scandinavian Calm tokens.
 */
export default function SoundToggle({ className = '' }) {
  const { soundEnabled, toggleSound } = useSound();
  const { isDark } = useTheme();

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      onClick={toggleSound}
      aria-label={soundEnabled ? 'Sound enabled · Click to mute' : 'Sound muted · Click to enable sound'}
      title={soundEnabled ? 'Sound effects: ON (Click to mute)' : 'Sound effects: OFF (Click to unmute)'}
      className={`relative p-2 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#748D6B] ${
        soundEnabled
          ? isDark
            ? 'bg-[#303A30] text-[#A3B18A] border border-[#A3B18A]/30 shadow-sm'
            : 'bg-[#E8EDE3] text-[#526B52] border border-[#526B52]/30 shadow-sm'
          : isDark
          ? 'text-[#B1B8AC] hover:bg-white/5 hover:text-[#F0F1E9]'
          : 'text-[#687168] hover:bg-[#ECECE4] hover:text-[#202720]'
      } ${className}`}
    >
      {soundEnabled ? (
        <>
          <Volume2 className="w-5 h-5" />
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
            aria-hidden="true"
          />
        </>
      ) : (
        <VolumeX className="w-5 h-5 opacity-75" />
      )}
    </motion.button>
  );
}
