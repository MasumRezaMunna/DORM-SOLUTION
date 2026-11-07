/**
 * LampIntro — Interactive full-screen lamp intro experience.
 *
 * Visual style: Realistic desk lamp sitting on surface, positioned slightly left,
 * with the shade and pull chain on the RIGHT side (matching reference image).
 *
 * Interaction:
 *  - Chain hangs from inside the shade/bulb on the right side.
 *  - Dragging the pull bead moves it 1:1 with the cursor downwards.
 *  - Uses setPointerCapture so drag tracking never slips or loses focus.
 *  - Tooltip "• Pull to turn on" attached beside the bead.
 *  - Passing 65px pull distance triggers the warm light + click sound.
 *  - Click on the bead also turns it on directly.
 */
import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CHAIN_THRESHOLD = 65;   // px downward pull to activate
const LAMP_HOLD_MS    = 1500; // ms to display lit lamp before transition
const FADE_OUT_MS     = 850;  // fade-out duration

function playClickSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.009));
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1900;
    const gain = ctx.createGain();
    gain.gain.value = 0.65;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(0);
    src.onended = () => ctx.close();
  } catch { /* audio muted/unavailable */ }
}

export default function LampIntro({ onComplete }) {
  const [isOn, setIsOn]             = useState(false);
  const [isFading, setIsFading]     = useState(false);
  const [dragY, setDragY]           = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [activated, setActivated]   = useState(false);
  const [showHint, setShowHint]     = useState(false);

  const dragStartYRef = useRef(0);
  const hasMovedRef   = useRef(false);
  const cleanupRef    = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const triggerLampOn = useCallback(() => {
    if (activated) return;
    setActivated(true);
    setShowHint(false);
    setIsDragging(false);
    setDragY(0);
    setIsOn(true);
    playClickSound();

    cleanupRef.current = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => onComplete?.(), FADE_OUT_MS);
    }, LAMP_HOLD_MS);
  }, [activated, onComplete]);

  const handleSkip = useCallback(() => {
    if (cleanupRef.current) clearTimeout(cleanupRef.current);
    onComplete?.();
  }, [onComplete]);

  // Pointer drag handling with pointer capture for buttery smooth 1:1 cursor tracking
  const handlePointerDown = useCallback((e) => {
    if (activated) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch { /* ignore */ }
    dragStartYRef.current = e.clientY;
    hasMovedRef.current = false;
    setIsDragging(true);
    setShowHint(false);
  }, [activated]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging || activated) return;
    const delta = e.clientY - dragStartYRef.current;
    if (Math.abs(delta) > 3) {
      hasMovedRef.current = true;
    }
    const currentDrag = Math.max(0, delta);
    setDragY(currentDrag);

    if (currentDrag >= CHAIN_THRESHOLD) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch { /* ignore */ }
      triggerLampOn();
    }
  }, [isDragging, activated, triggerLampOn]);

  const handlePointerUp = useCallback((e) => {
    if (!isDragging) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch { /* ignore */ }
    setIsDragging(false);

    // If it was just a click without dragging, turn on
    if (!hasMovedRef.current && !activated) {
      triggerLampOn();
      return;
    }

    // Released before threshold: spring back
    setDragY(0);
  }, [isDragging, activated, triggerLampOn]);

  useEffect(() => {
    return () => {
      if (cleanupRef.current) clearTimeout(cleanupRef.current);
    };
  }, []);

  /*
   * Lamp Geometry (matches attached reference):
   * Base: x:120, y:360 (bottom-left)
   * Lower arm goes up-left to elbow at (x:95, y:260)
   * Upper arm goes up-right to shade pivot at (x:185, y:155)
   * Shade dome sits angled downward-right, rim center at (x:205, y:215)
   * Bulb is inside shade at (x:205, y:210)
   * Chain hangs from bulb at anchor: (x:205, y:215)
   * Chain goes down on the RIGHT side of the arm assembly
   * Idle bead position: (x:205, y:315)
   * When dragged, bead follows cursor: y = 315 + dragY
   */
  const ANCHOR_X = 208;
  const ANCHOR_Y = 216;
  const BASE_BEAD_Y = 320;
  const currentBeadY = BASE_BEAD_Y + dragY;
  const chainLength = currentBeadY - ANCHOR_Y;
  const linkCount = Math.max(6, Math.floor(chainLength / 9));

  return (
    <AnimatePresence>
      {!isFading && (
        <motion.div
          key="lamp-intro"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_OUT_MS / 1000, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            userSelect: 'none',
            background: 'radial-gradient(ellipse 100% 90% at 42% 50%, #1c1e17 0%, #12140f 55%, #080907 100%)',
          }}
        >
          {/* Subtle cinematic vignette */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse 110% 110% at 50% 50%, transparent 30%, rgba(0,0,0,0.7) 100%)',
              pointerEvents: 'none',
            }}
          />

          {/* Warm background light flood when lamp turns ON */}
          <motion.div
            animate={{ opacity: isOn ? 1 : 0 }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: '6%',
              left: '30%',
              width: '56vw',
              height: '54vh',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at 42% 30%, rgba(255,190,45,0.3) 0%, rgba(255,125,10,0.1) 48%, transparent 72%)',
              pointerEvents: 'none',
            }}
          />

          {/* Warm desk surface bounce light */}
          <motion.div
            animate={{ opacity: isOn ? 1 : 0 }}
            transition={{ duration: 0.85, ease: 'easeOut', delay: 0.08 }}
            style={{
              position: 'absolute',
              bottom: '16%',
              left: '26%',
              width: '45vw',
              height: '24vh',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at 50% 65%, rgba(255,200,70,0.16) 0%, rgba(255,130,20,0.04) 58%, transparent 78%)',
              pointerEvents: 'none',
            }}
          />

          {/* Skip Intro button in top right corner */}
          <motion.button
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.4 }}
            onClick={handleSkip}
            style={{
              position: 'absolute',
              top: 26,
              right: 32,
              padding: '7px 20px',
              borderRadius: 100,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: 'rgba(255,255,255,0.45)',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.03em',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s ease',
              fontFamily: 'var(--font-sans, system-ui)',
              zIndex: 20,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.10)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
            }}
          >
            Skip Intro
          </motion.button>

          {/* ── LAMP SCENE CONTAINER ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            style={{
              position: 'relative',
              width: 380,
              height: 420,
              marginLeft: '-8vw', // shifts lamp to left side as in reference
            }}
          >
            {/* Warm glow behind shade when ON */}
            <motion.div
              animate={{ opacity: isOn ? 1 : 0, scale: isOn ? 1 : 0.6 }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                top: 130,
                left: 120,
                width: 200,
                height: 180,
                borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(255,190,40,0.5) 0%, rgba(255,130,0,0.18) 50%, transparent 75%)',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />

            {/* SVG Desk Lamp */}
            <svg
              viewBox="0 0 380 420"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: '100%', height: '100%', overflow: 'visible', position: 'relative', zIndex: 2 }}
              aria-hidden="true"
            >
              <defs>
                {/* Dark arm metallic linear gradient */}
                <linearGradient id="armMetal" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10110e" />
                  <stop offset="35%" stopColor="#2a2c24" />
                  <stop offset="55%" stopColor="#C4A43A" stopOpacity="0.45" />
                  <stop offset="75%" stopColor="#1c1e18" />
                  <stop offset="100%" stopColor="#0c0d0b" />
                </linearGradient>

                {/* Base radial gradient */}
                <radialGradient id="baseRadial" cx="50%" cy="35%" r="60%">
                  <stop offset="0%" stopColor="#32352c" />
                  <stop offset="60%" stopColor="#181914" />
                  <stop offset="100%" stopColor="#0d0e0b" />
                </radialGradient>

                {/* Golden joint ball gradient */}
                <radialGradient id="jointBall" cx="35%" cy="35%" r="60%">
                  <stop offset="0%" stopColor="#FDE382" />
                  <stop offset="40%" stopColor="#D4AF37" />
                  <stop offset="85%" stopColor="#8C6D18" />
                  <stop offset="100%" stopColor="#4A380A" />
                </radialGradient>

                {/* Golden rim linear gradient */}
                <linearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8C6D18" />
                  <stop offset="30%" stopColor="#D4AF37" />
                  <stop offset="55%" stopColor="#FDE382" />
                  <stop offset="80%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#8C6D18" />
                </linearGradient>

                {/* Shade dome metallic body */}
                <linearGradient id="shadeBody" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#252720" />
                  <stop offset="35%" stopColor="#181914" />
                  <stop offset="70%" stopColor="#2c2e26" />
                  <stop offset="100%" stopColor="#0d0e0b" />
                </linearGradient>

                {/* Shade inner warm glow when ON */}
                <radialGradient id="shadeInnerLight" cx="50%" cy="75%" r="75%">
                  <stop offset="0%" stopColor="#FFF4B8" stopOpacity={isOn ? 1 : 0} />
                  <stop offset="45%" stopColor="#FFAA22" stopOpacity={isOn ? 0.7 : 0} />
                  <stop offset="100%" stopColor="#FF6600" stopOpacity={isOn ? 0.1 : 0} />
                </radialGradient>

                {/* Bulb glow filter */}
                <filter id="bulbHalo" x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur stdDeviation={isOn ? '8' : '1'} result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* ── GROUND SHADOW ── */}
              <ellipse cx="120" cy="382" rx="65" ry="9" fill="rgba(0,0,0,0.5)" />

              {/* ── BASE DISC ── */}
              <ellipse cx="120" cy="372" rx="55" ry="11" fill="url(#baseRadial)" />
              <ellipse cx="120" cy="369" rx="50" ry="7" fill="#D4AF37" fillOpacity="0.12" />
              {/* Base connector joint */}
              <rect x="113" y="348" width="14" height="24" rx="4" fill="url(#armMetal)" />
              <ellipse cx="120" cy="348" rx="10" ry="5" fill="url(#jointBall)" />

              {/* ── LOWER ARM (goes up-left toward elbow) ── */}
              <line x1="120" y1="348" x2="95" y2="255" stroke="url(#armMetal)" strokeWidth="10" strokeLinecap="round" />
              <line x1="120" y1="348" x2="95" y2="255" stroke="#D4AF37" strokeWidth="1.4" strokeLinecap="round" opacity="0.4" />

              {/* ── MIDDLE ELBOW JOINT ── */}
              <circle cx="95" cy="255" r="12" fill="url(#jointBall)" />
              <circle cx="95" cy="255" r="6.5" fill="#141511" />
              <circle cx="93" cy="253" r="2.5" fill="#FDE382" fillOpacity="0.7" />

              {/* ── UPPER ARM (goes up-right toward shade) ── */}
              <line x1="95" y1="255" x2="185" y2="155" stroke="url(#armMetal)" strokeWidth="9.5" strokeLinecap="round" />
              <line x1="95" y1="255" x2="185" y2="155" stroke="#D4AF37" strokeWidth="1.4" strokeLinecap="round" opacity="0.4" />

              {/* ── SHADE JOINT / COLLAR ── */}
              <circle cx="185" cy="155" r="10" fill="url(#jointBall)" />
              <circle cx="185" cy="155" r="5.5" fill="#141511" />
              <circle cx="183" cy="153" r="2" fill="#FDE382" fillOpacity="0.7" />

              {/* ── LAMP SHADE DOME ── */}
              {/* Dome outer shell */}
              <path
                d="M145,190 C155,130 220,135 245,185 L235,196 C215,150 160,150 152,198 Z"
                fill="url(#shadeBody)"
              />
              {/* Inside cavity of shade */}
              <ellipse
                cx="200"
                cy="208"
                rx="48"
                ry="22"
                transform="rotate(12 200 208)"
                fill="url(#shadeInnerLight)"
                style={{ transition: 'fill 0.5s ease' }}
              />
              {/* Golden rim of shade */}
              <ellipse
                cx="200"
                cy="208"
                rx="48"
                ry="22"
                transform="rotate(12 200 208)"
                stroke="url(#goldRim)"
                strokeWidth="3.5"
                fill="none"
              />
              <ellipse
                cx="200"
                cy="208"
                rx="46.5"
                ry="20.5"
                transform="rotate(12 200 208)"
                stroke="#FDE382"
                strokeWidth="1"
                fill="none"
                opacity="0.5"
              />

              {/* ── BULB ── */}
              <ellipse
                cx="206"
                cy="205"
                rx="13"
                ry="11"
                fill={isOn ? '#FFFBE6' : '#181914'}
                filter={isOn ? 'url(#bulbHalo)' : undefined}
                style={{ transition: 'fill 0.45s ease' }}
              />
              <circle cx="206" cy="205" r="7" fill={isOn ? '#FFE27A' : '#11120e'} style={{ transition: 'fill 0.45s ease' }} />

              {/* Light beam / cone projected downward when ON */}
              <motion.polygon
                points="160,225 248,228 295,370 120,370"
                fill="url(#shadeInnerLight)"
                animate={{ opacity: isOn ? 0.14 : 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />

              {/* ── PULL CHAIN IN SVG ── */}
              {/* Fixed top anchor inside shade, stretches downward to currentBeadY */}
              {!isOn && (
                <g>
                  {/* The vertical cord / chain line */}
                  <line
                    x1={ANCHOR_X}
                    y1={ANCHOR_Y}
                    x2={ANCHOR_X}
                    y2={currentBeadY}
                    stroke="#D4AF37"
                    strokeWidth="1.6"
                    strokeDasharray="2 3"
                    strokeLinecap="round"
                    opacity="0.9"
                  />
                  {/* Subtle golden links along the chain */}
                  {Array.from({ length: linkCount }).map((_, i) => {
                    const linkY = ANCHOR_Y + ((currentBeadY - ANCHOR_Y) * (i + 1)) / (linkCount + 1);
                    return (
                      <ellipse
                        key={i}
                        cx={ANCHOR_X}
                        cy={linkY}
                        rx="2"
                        ry="3"
                        fill="#FDE382"
                        stroke="#8C6D18"
                        strokeWidth="0.8"
                      />
                    );
                  })}
                </g>
              )}
            </svg>

            {/* ── INTERACTIVE PULL BEAD (DOM ELEMENT FOR PERFECT CURSOR DRAGGING) ── */}
            {!isOn && (
              <div
                style={{
                  position: 'absolute',
                  left: ANCHOR_X - 16,
                  top: currentBeadY - 8,
                  width: 32,
                  height: 38,
                  cursor: isDragging ? 'grabbing' : 'grab',
                  touchAction: 'none',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  transition: isDragging ? 'none' : 'top 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                title="Pull downward or click to turn on"
              >
                {/* Golden cylindrical bead / tassel with glowing metallic gradient */}
                <div
                  style={{
                    width: 14,
                    height: 22,
                    borderRadius: '7px 7px 5px 5px',
                    background: 'linear-gradient(135deg, #FDE382 0%, #D4AF37 50%, #8C6D18 100%)',
                    boxShadow: isDragging
                      ? '0 0 12px rgba(253,227,130,0.9), 0 3px 6px rgba(0,0,0,0.6)'
                      : '0 2px 6px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.7)',
                    border: '1px solid #73550E',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            )}

            {/* ── TOOLTIP HINT "• Pull to turn on" BESIDE THE BEAD ── */}
            <AnimatePresence>
              {showHint && !activated && (
                <motion.div
                  key="hint-tooltip"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    position: 'absolute',
                    left: ANCHOR_X + 24,
                    top: currentBeadY - 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 12px 5px 10px',
                    background: 'rgba(15, 17, 13, 0.75)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: 8,
                    backdropFilter: 'blur(6px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                    pointerEvents: 'none',
                    zIndex: 15,
                    transition: isDragging ? 'none' : 'top 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                  }}
                >
                  {/* Golden glowing dot */}
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#D4AF37',
                      boxShadow: '0 0 6px #FDE382',
                      display: 'inline-block',
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'rgba(240, 238, 228, 0.85)',
                      fontFamily: 'var(--font-sans, system-ui)',
                      letterSpacing: '0.02em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Pull to turn on
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── TEXT CONTENT ── */}
          <div
            style={{
              position: 'relative',
              zIndex: 5,
              textAlign: 'center',
              marginTop: 28,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
            }}
          >
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.65, ease: 'easeOut' }}
              style={{
                fontFamily: 'var(--font-sans, system-ui)',
                fontSize: 'clamp(28px, 3.2vw, 46px)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: isOn ? '#FFF8E8' : 'rgba(240,238,228,0.9)',
                transition: 'color 0.65s ease',
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              Welcome to{' '}
              <span
                style={{
                  color: isOn ? '#FFD060' : '#D4AF37',
                  transition: 'color 0.65s ease',
                }}
              >
                HOME
              </span>
            </motion.h1>

            {/* Instruction */}
            <motion.p
              animate={{ opacity: isOn ? 0 : 1 }}
              transition={{ duration: 0.35 }}
              style={{
                fontFamily: 'var(--font-sans, system-ui)',
                fontSize: 'clamp(13px, 1.4vw, 15px)',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.35)',
                margin: 0,
                letterSpacing: '0.02em',
              }}
            >
              Pull the switch to get started
            </motion.p>

            {/* Turning-on message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: isOn ? 1 : 0 }}
              transition={{ duration: 0.45, delay: isOn ? 0.3 : 0 }}
              style={{
                fontFamily: 'var(--font-sans, system-ui)',
                fontSize: 'clamp(13px, 1.3vw, 15px)',
                fontWeight: 600,
                color: 'rgba(255,210,70,0.85)',
                margin: 0,
                letterSpacing: '0.03em',
              }}
            >
              Opening your dashboard…
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
