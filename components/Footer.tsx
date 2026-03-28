import styles from './Footer.module.css';

function GazeLogo() {
  return (
    <div className={styles.logo}>
      {/* Burning eye — small */}
      <svg width="20" height="20" viewBox="0 0 200 200" fill="none" aria-hidden="true">
        <path
          d="M10 100 C40 50, 160 50, 190 100 C160 150, 40 150, 10 100Z"
          fill="#1a1a1a"
          stroke="rgba(255,191,0,0.5)"
          strokeWidth="3"
        />
        <circle cx="100" cy="100" r="36" fill="url(#footerIrisGradient)" />
        <circle cx="100" cy="100" r="17" fill="#0a0a0a" />
        <circle cx="108" cy="92" r="5" fill="rgba(255,191,0,0.7)" />
        <defs>
          <radialGradient id="footerIrisGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFBF00" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#664400" stopOpacity="0.5" />
          </radialGradient>
        </defs>
      </svg>
      <span className={styles.logoText}>GAZE</span>
    </div>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.264 5.633 5.9-5.633zm-1.161 17.52h1.833L7.084 4.126H5.117z"
        fill="currentColor"
      />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.93 6.79l-1.88 8.86c-.14.62-.5.77-.99.48l-2.75-2.03-1.33 1.28c-.15.14-.27.27-.54.27l.19-2.76 4.98-4.5c.22-.19-.05-.3-.33-.11L7.69 14.54l-2.7-.84c-.59-.18-.6-.59.12-.87l10.53-4.06c.49-.18.92.12.29.98z"
        fill="currentColor"
      />
    </svg>
  );
}

const NAV_LINKS = [
  { label: 'Protocol', href: 'https://gazeprotocol.com/protocol' },
  { label: 'Creators', href: 'https://app.gazeprotocol.com/creators' },
  { label: 'Leaderboard', href: 'https://app.gazeprotocol.com/leaderboard' },
  { label: 'Docs', href: 'https://docs.gazeprotocol.com' },
  { label: 'GitHub', href: 'https://github.com/gazeprotocol' },
];

const SOCIAL_LINKS = [
  { label: 'X (Twitter)', href: 'https://x.com/gazeprotocol', icon: <XIcon /> },
  { label: 'Telegram', href: 'https://t.me/gazeprotocol', icon: <TelegramIcon /> },
];

export default function Footer() {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={`container ${styles.inner}`}>
        {/* Top row */}
        <div className={styles.topRow}>
          <GazeLogo />

          <nav className={styles.nav} aria-label="Footer navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={styles.navLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className={styles.socialLinks}>
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className={styles.socialLink}
                aria-label={social.label}
                target="_blank"
                rel="noopener noreferrer"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Bottom row */}
        <div className={styles.bottomRow}>
          <p className={styles.copyright}>© 2025 Graviton Inc. Built on Solana.</p>
        </div>
      </div>
    </footer>
  );
}
