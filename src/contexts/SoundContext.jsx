import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import soundManager from '../utils/soundEffects';

const SoundContext = createContext({
  soundEnabled: false,
  toggleSound: () => {},
  setSoundEnabled: () => {},
  playSound: () => {},
});

export const useSound = () => useContext(SoundContext);

export function SoundProvider({ children }) {
  const [soundEnabled, setSoundEnabledState] = useState(() => soundManager.isEnabled());

  // Keep soundManager in sync
  useEffect(() => {
    soundManager.setEnabled(soundEnabled);
  }, [soundEnabled]);

  const setSoundEnabled = useCallback((enabled) => {
    setSoundEnabledState(enabled);
    soundManager.setEnabled(enabled);
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabledState((prev) => {
      const next = !prev;
      soundManager.setEnabled(next);
      if (next) {
        // Play a short pleasant chime preview when toggled on
        setTimeout(() => {
          soundManager.playSuccess();
        }, 50);
      }
      return next;
    });
  }, []);

  const playSound = useCallback((type) => {
    soundManager.play(type);
  }, []);

  return (
    <SoundContext.Provider
      value={{
        soundEnabled,
        toggleSound,
        setSoundEnabled,
        playSound,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export default SoundContext;
