/**
 * soundEffects.js
 * ──────────────────────────────────────────────────────────────────────────
 * Lightweight, zero-dependency Sound Effects System using the Web Audio API.
 * Synthesizes short, soft, non-intrusive UI tones adhering to the
 * Scandinavian Calm design system.
 *
 * Audio Features:
 *  - OFF by default; requires explicit user enablement
 *  - Persisted in localStorage (`home_sound_enabled`)
 *  - Lazy AudioContext initialization conforming to browser autoplay policies
 *  - Debounced / spam-protected playback with individual cooldowns
 *  - Fail-safe execution: audio failures never interrupt UI workflows
 * ──────────────────────────────────────────────────────────────────────────
 */

class SoundEffectsManager {
  constructor() {
    this.audioCtx = null;
    this.enabled = false;
    this.lastPlayed = {};

    // Sound is OFF by default until explicitly enabled
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('home_sound_enabled');
        this.enabled = stored === 'true';
      } catch {
        this.enabled = false;
      }
    }
  }

  /**
   * Lazily get or create the AudioContext on user interaction
   */
  getAudioContext() {
    if (typeof window === 'undefined') return null;

    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }

      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

      return this.audioCtx;
    } catch {
      return null;
    }
  }

  /**
   * Check if sound is currently enabled
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Update the sound enabled state and persist to localStorage
   */
  setEnabled(val) {
    this.enabled = Boolean(val);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('home_sound_enabled', String(this.enabled));
      } catch {}
    }
  }

  /**
   * Check if sound can be played based on enabled status and cooldown
   */
  canPlay(type, cooldownMs = 80) {
    if (!this.enabled) return false;
    const now = Date.now();
    const last = this.lastPlayed[type] || 0;
    if (now - last < cooldownMs) return false;
    this.lastPlayed[type] = now;
    return true;
  }

  /**
   * Helper to play an individual tone
   */
  playTone(ctx, { freq, type = 'sine', startTime, duration, startGain = 0.1, endGain = 0.0001, pitchDecayTo = null }) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      if (pitchDecayTo) {
        osc.frequency.exponentialRampToValueAtTime(pitchDecayTo, startTime + duration);
      }

      gain.gain.setValueAtTime(startGain, startTime);
      gain.gain.exponentialRampToValueAtTime(endGain, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.02);
    } catch {
      // Fail safely
    }
  }

  /**
   * 1. Button click: soft, short tactile UI tap (~45ms)
   */
  playClick() {
    if (!this.canPlay('click', 80)) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      this.playTone(ctx, {
        freq: 460,
        pitchDecayTo: 180,
        type: 'sine',
        startTime: t,
        duration: 0.045,
        startGain: 0.08,
      });
    } catch {}
  }

  /**
   * 2. Success: warm, pleasant confirmation harmonic chime (E5 -> A5)
   */
  playSuccess() {
    if (!this.canPlay('success', 350)) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      // Note 1: E5 (659.25Hz)
      this.playTone(ctx, {
        freq: 659.25,
        type: 'sine',
        startTime: t,
        duration: 0.16,
        startGain: 0.1,
      });

      // Note 2: A5 (880Hz)
      this.playTone(ctx, {
        freq: 880.0,
        type: 'sine',
        startTime: t + 0.08,
        duration: 0.28,
        startGain: 0.12,
      });
    } catch {}
  }

  /**
   * 3. Error: subtle, polite warning pulse (280Hz -> 210Hz)
   */
  playError() {
    if (!this.canPlay('error', 400)) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      this.playTone(ctx, {
        freq: 280,
        type: 'triangle',
        startTime: t,
        duration: 0.09,
        startGain: 0.09,
      });

      this.playTone(ctx, {
        freq: 210,
        type: 'triangle',
        startTime: t + 0.1,
        duration: 0.16,
        startGain: 0.09,
      });
    } catch {}
  }

  /**
   * 4. Mascot: cute ascending chirp / bubbly wake-up sound (C5 -> E5 -> G5)
   */
  playMascot() {
    if (!this.canPlay('mascot', 350)) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      // C5
      this.playTone(ctx, {
        freq: 523.25,
        type: 'sine',
        startTime: t,
        duration: 0.08,
        startGain: 0.09,
      });
      // E5
      this.playTone(ctx, {
        freq: 659.25,
        type: 'sine',
        startTime: t + 0.06,
        duration: 0.1,
        startGain: 0.1,
      });
      // G5
      this.playTone(ctx, {
        freq: 783.99,
        type: 'sine',
        startTime: t + 0.12,
        duration: 0.22,
        startGain: 0.11,
      });
    } catch {}
  }

  /**
   * 5. Easter Egg: celebratory arcade-style discovery fanfare (C5 -> G5 -> C6 -> E6)
   */
  playEasterEgg() {
    if (!this.canPlay('easterEgg', 800)) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      const notes = [
        { freq: 523.25, delay: 0,    dur: 0.1,  gain: 0.09 }, // C5
        { freq: 783.99, delay: 0.07, dur: 0.12, gain: 0.1  }, // G5
        { freq: 1046.5, delay: 0.14, dur: 0.16, gain: 0.12 }, // C6
        { freq: 1318.5, delay: 0.22, dur: 0.38, gain: 0.14 }, // E6
      ];

      notes.forEach(({ freq, delay, dur, gain }) => {
        this.playTone(ctx, {
          freq,
          type: 'sine',
          startTime: t + delay,
          duration: dur,
          startGain: gain,
        });
      });
    } catch {}
  }

  /**
   * General playback dispatcher
   */
  play(type = 'click') {
    switch (type) {
      case 'click':
        return this.playClick();
      case 'success':
        return this.playSuccess();
      case 'error':
        return this.playError();
      case 'mascot':
        return this.playMascot();
      case 'easterEgg':
        return this.playEasterEgg();
      default:
        return this.playClick();
    }
  }
}

// Singleton manager instance
export const soundManager = new SoundEffectsManager();

export default soundManager;
