'use client';

import styles from './Hero.module.css';

// Burning Eye SVG — animated amber iris, obsidian pupil
function BurningEye() {
  return (
    <svg
      className={styles.burningEye}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
    >
      {/* Outer glow ring */}
      <circle
        cx="100"
        cy="100"
        r="90"
        stroke="rgba(255,191,0,0.08)"
        strokeWidth="1"
        className={styles.glowRingOuter}
      />
      <circle
        cx="100"
        cy="100"
        r="72"
        stroke="rgba(255,191,0,0.12)"
        strokeWidth="1"
        className={styles.glowRingMid}
      />

      {/* Eye shape — almond */}
      <path
        d="M10 100 C40 50, 160 50, 190 100 C160 150, 40 150, 10 100Z"
        fill="#1a1a1a"
        stroke="rgba(255,191,0,0.4)"
        strokeWidth="1.5"
      />

      {/* Iris */}
      <circle
        cx="100"
        cy="100"
        r="38"
        fill="url(#irisGradient)"
        className={styles.iris}
      />

      {/* Pupil */}
      <circle cx="100" cy="100" r="18" fill="#0a0a0a" />

      {/* Pupil inner light */}
      <circle cx="108" cy="92" r="5" fill="rgba(255,191,0,0.6)" />

      {/* Amber flame rays */}
      <g className={styles.rays} opacity="0.5">
        <line x1="100" y1="20" x2="100" y2="40" stroke="#FFBF00" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="100" y1="160" x2="100" y2="180" stroke="#FFBF00" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="20" y1="100" x2="40" y2="100" stroke="#FFBF00" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="160" y1="100" x2="180" y2="100" stroke="#FFBF00" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="36" y1="36" x2="50" y2="50" stroke="#FFBF00" strokeWidth="1" strokeLinecap="round" />
        <line x1="150" y1="150" x2="164" y2="164" stroke="#FFBF00" strokeWidth="1" strokeLinecap="round" />
        <line x1="164" y1="36" x2="150" y2="50" stroke="#FFBF00" strokeWidth="1" strokeLinecap="round" />
        <line x1="50" y1="150" x2="36" y2="164" stroke="#FFBF00" strokeWidth="1" strokeLinecap="round" />
      </g>

      <defs>
        <radialGradient id="irisGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFBF00" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#CC9900" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#664400" stopOpacity="0.5" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export default function Hero() {
  return (
    <section className={styles.hero} aria-label="Hero">
      {/* Ambient background glow */}
      <div className={styles.ambientGlow} aria-hidden="true" />

      <div className={`container ${styles.inner}`}>
        {/* Burning Eye motif */}
        <div className={styles.eyeWrapper} aria-hidden="true">
          <BurningEye />
        </div>

        {/* Eyebrow label */}
        <p className={styles.eyebrow}>Attention Protocol on Solana</p>

        {/* Main headline */}
        <h1 className={styles.headline}>
          Your attention is{' '}
          <span className={styles.headlineAccent}>already valuable.</span>
        </h1>

        {/* Subheadline */}
        <p className={styles.subheadline}>
          Watch creators. Earn rewards. Stake tokens.
          <br />
          The protocol runs silently — you just keep watching.
        </p>

        {/* CTA buttons */}
        <div className={styles.ctaGroup}>
          <a
            href="https://chrome.google.com/webstore"
            className={`btn btn-primary ${styles.ctaPrimary}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ChromeIcon />
            Install Extension
          </a>
          <a
            href="https://app.gazeprotocol.com"
            className={`btn btn-secondary ${styles.ctaSecondary}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Launch App
            <ArrowIcon />
          </a>
        </div>

        {/* Platform support note */}
        <p className={styles.platformNote}>
          Supports YouTube, Twitch, Kick, Rumble, X, Parti, Arena, Abstract, Pump.fun
        </p>
      </div>
    </section>
  );
}

function ChromeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <path
        d="M12 8h8.5M6.5 20.5L10.5 14M17.5 20.5L13.5 14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
