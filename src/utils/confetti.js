/**
 * confetti.js
 * ──────────────────────────────────────────────────────────────────────────
 * Reusable celebration confetti utility built on top of `canvas-confetti`.
 *
 * Usage:
 *   import { triggerConfetti } from '../utils/confetti';
 *   triggerConfetti();                  // default celebration burst
 *   triggerConfetti('payment');         // payment-specific palette
 *   triggerConfetti('member');          // member-specific palette
 *
 * All animations are short, non-blocking, and pointer-events-free so they
 * never interfere with user interaction.
 * ──────────────────────────────────────────────────────────────────────────
 */

import confetti from 'canvas-confetti';

/** Shared base options for all bursts */
const BASE = {
  startVelocity: 30,
  spread: 360,
  ticks: 60,
  zIndex: 9999,
  disableForReducedMotion: true,
};

/** Color palettes keyed by action type */
const PALETTES = {
  default: ['#a855f7', '#6366f1', '#22d3ee', '#34d399', '#fbbf24', '#f472b6'],
  payment:  ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#fbbf24', '#fcd34d'],
  member:   ['#8b5cf6', '#a78bfa', '#c4b5fd', '#6366f1', '#60a5fa', '#93c5fd'],
  meal:     ['#f59e0b', '#fbbf24', '#fcd34d', '#fb923c', '#f87171', '#34d399'],
  market:   ['#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc', '#f0abfc', '#e879f9'],
};

/**
 * Fire a small side-burst from each edge of the screen.
 * @param {string[]} colors
 */
function sideBursts(colors) {
  // Left burst
  confetti({
    ...BASE,
    particleCount: 30,
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 0.65 },
    colors,
  });
  // Right burst
  confetti({
    ...BASE,
    particleCount: 30,
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 0.65 },
    colors,
  });
}

/**
 * Fire a central top-centre shower of confetti.
 * @param {string[]} colors
 * @param {number}   count    number of particles
 */
function topShower(colors, count = 80) {
  confetti({
    ...BASE,
    particleCount: count,
    angle: 90,
    spread: 70,
    origin: { x: 0.5, y: 0 },
    gravity: 1.2,
    scalar: 0.9,
    colors,
  });
}

/**
 * Trigger a premium confetti celebration effect.
 *
 * @param {'default'|'payment'|'member'|'meal'|'market'} [type='default']
 *   The type of action — selects a matching colour palette.
 */
export function triggerConfetti(type = 'default') {
  const colors = PALETTES[type] ?? PALETTES.default;

  // Small delay so the toast has time to appear first, then confetti follows
  setTimeout(() => {
    topShower(colors, 90);

    // Second wave from sides slightly delayed for a layered feel
    setTimeout(() => sideBursts(colors), 150);
  }, 80);
}
