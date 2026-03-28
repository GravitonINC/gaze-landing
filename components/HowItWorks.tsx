import styles from './HowItWorks.module.css';

function EyeIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="M4 24C4 24 12 10 24 10C36 10 44 24 44 24C44 24 36 38 24 38C12 38 4 24 4 24Z"
        stroke="#FFBF00"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="24" cy="24" r="7" fill="none" stroke="#FFBF00" strokeWidth="2" />
      <circle cx="24" cy="24" r="3" fill="#FFBF00" />
    </svg>
  );
}

function TokenIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="18" stroke="#FFBF00" strokeWidth="2" fill="none" />
      <circle cx="24" cy="24" r="12" stroke="#FFBF00" strokeWidth="1" strokeDasharray="3 3" fill="none" />
      <text
        x="24"
        y="29"
        textAnchor="middle"
        fill="#FFBF00"
        fontSize="14"
        fontWeight="700"
        fontFamily="'Space Grotesk', monospace"
      >
        G
      </text>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="10" y="22" width="28" height="20" rx="4" stroke="#FFBF00" strokeWidth="2" fill="none" />
      <path
        d="M16 22V17C16 11.477 20.477 7 26 7H22C16.477 7 12 11.477 12 17V22"
        stroke="#FFBF00"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M32 22V17C32 11.477 27.523 7 22 7"
        stroke="#FFBF00"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="24" cy="32" r="3" fill="#FFBF00" />
      <line x1="24" y1="35" x2="24" y2="39" stroke="#FFBF00" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

interface CardProps {
  icon: React.ReactNode;
  title: string;
  body: string;
  detail: string;
}

function Card({ icon, title, body, detail }: CardProps) {
  return (
    <div className={`card ${styles.card}`}>
      <div className={styles.cardIcon}>{icon}</div>
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardBody}>{body}</p>
      <span className={styles.cardDetail}>{detail}</span>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section className={`section ${styles.howItWorks}`} aria-labelledby="how-it-works-heading">
      <div className="container">
        <p className={styles.eyebrow}>How It Works</p>
        <h2 id="how-it-works-heading" className={styles.headline}>
          Three ways to participate.
        </h2>
        <div className={styles.grid}>
          <Card
            icon={<EyeIcon />}
            title="Watch"
            body="Install the Chrome extension. Watch creators on YouTube, Twitch, Kick, and 6 more platforms. Your verified watch time earns you a place on the leaderboard."
            detail="9 platforms supported"
          />
          <Card
            icon={<TokenIcon />}
            title="Create"
            body="Launch your personal token with bonding curve pricing. Your audience stakes your token and watches your content. Their attention determines your monthly rewards."
            detail="Permissionless launch"
          />
          <Card
            icon={<LockIcon />}
            title="Stake"
            body="Buy a creator token and stake it. Options accrue every second. Watch the creator while staked and contribute 9x to their leaderboard score."
            detail="9x leaderboard multiplier"
          />
        </div>
      </div>
    </section>
  );
}
