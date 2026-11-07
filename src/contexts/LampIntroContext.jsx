/**
 * LampIntroContext
 *
 * Manages whether the lamp intro has already been shown this session.
 * The intro is shown ONCE per browser session for authenticated desktop users.
 * sessionStorage is used so it clears when the tab is closed.
 */
import { createContext, useContext, useState, useCallback } from 'react';

const LampIntroContext = createContext(null);

export const useLampIntro = () => useContext(LampIntroContext);

/** Returns true if the current viewport is a desktop (≥ 1024 px wide). */
export const isDesktop = () =>
  typeof window !== 'undefined' && window.innerWidth >= 1024;

/** Returns true if the intro should be suppressed (already shown this session). */
const wasShown = () => sessionStorage.getItem('lampIntroShown') === 'true';

export function LampIntroProvider({ children }) {
  /**
   * showIntro starts as true only when:
   *  - The window is desktop-width
   *  - The intro has NOT yet been shown this session
   */
  const [showIntro, setShowIntro] = useState(() => isDesktop() && !wasShown());

  const dismissIntro = useCallback(() => {
    sessionStorage.setItem('lampIntroShown', 'true');
    setShowIntro(false);
  }, []);

  return (
    <LampIntroContext.Provider value={{ showIntro, dismissIntro }}>
      {children}
    </LampIntroContext.Provider>
  );
}

