'use client';

import styles from './CTA.module.css';

function BurningEyeSmall() {
  return (
    <svg
      className={styles.eyeIcon}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Eye shape */}
      <path
        d="M10 100 C40 50, 160 50, 190 100 C160 150, 40 150, 10 100Z"
        fill="#1a1a1a"
        stroke="rgba(255,191,0,0.5)"
        strokeWidth="2"
      />
      {/* Iris */}
      <circle cx="100" cy="100" r="38" fill="url(#ctaIrisGradient)" />
      {/* Pupil */}
      <circle cx="100" cy="100" r="18" fill="#0a0a0a" />
      {/* Pupil inner light */}
      <circle cx="108" cy="92" r="5" fill="rgba(255,191,0,0.7)" />
      <defs>
        <radialGradient id="ctaIrisGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFBF00" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#CC9900" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#664400" stopOpacity="0.5" />
        </radialGradient>
      </defs>
    </svg>
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

export default function CTA() {
  return (
    <section className={`section ${styles.cta}`} aria-labelledby="cta-heading">
      {/* Amber radial glow */}
      <div className={styles.glow} aria-hidden="true" />

      <div className={`container ${styles.inner}`}>
        <div className={styles.eyeWrapper} aria-hidden="true">
          <BurningEyeSmall />
        </div>

        <h2 id="cta-heading" className={styles.headline}>
          Your attention is already valuable.
        </h2>

        <p className={styles.subtext}>
          Gaze makes that visible. Install the extension, watch what you watch, earn every second.
        </p>

        <div className={styles.actions}>
          <a
            href="https://chrome.google.com/webstore"
            className={`btn btn-primary ${styles.btnPrimary}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ChromeIcon />
            Install Chrome Extension
          </a>
          <a
            href="https://app.gazeprotocol.com/launch"
            className={`btn btn-secondary ${styles.btnSecondary}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Launch a Token
          </a>
          <a
            href="https://app.gazeprotocol.com/creators"
            className={`btn btn-ghost ${styles.btnGhost}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Explore Creators &rarr;
          </a>
        </div>

        <p className={styles.note}>Free to install. No tokens required to start watching.</p>
      </div>
    </section>
  );
}
