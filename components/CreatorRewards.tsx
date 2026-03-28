import styles from './CreatorRewards.module.css';

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={styles.checkIcon}>
      <circle cx="12" cy="12" r="10" fill="rgba(255,191,0,0.12)" stroke="rgba(255,191,0,0.3)" strokeWidth="1" />
      <path
        d="M7 12.5l3.5 3.5 6.5-7"
        stroke="#FFBF00"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const FEATURES = [
  'Bonding curve pricing — fair for early supporters',
  'Monthly USDC rewards from protocol treasury',
  'On-chain transparency — every payout is auditable',
  'No platform fees — Gaze takes 0% of creator rewards',
];

function TokenStatsCard() {
  return (
    <div className={styles.statsCard}>
      <div className={styles.statsCardHeader}>
        <span className={styles.statsCardLabel}>Creator Token</span>
        <span className={styles.statsCardBadge}>LIVE</span>
      </div>
      <div className={styles.tokenName}>CREATOR</div>
      <div className={styles.statsGrid}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Price</span>
          <span className={styles.statValue}>$0.042</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Holders</span>
          <span className={styles.statValue}>1,247</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Monthly Rewards</span>
          <span className={styles.statValue}>~$890 USDC</span>
        </div>
      </div>
      <div className={styles.statsCardPowered}>Powered by Gaze Protocol</div>
    </div>
  );
}

export default function CreatorRewards() {
  return (
    <section className={`section ${styles.creatorRewards}`} aria-labelledby="creator-rewards-heading">
      <div className="container">
        <div className={styles.layout}>
          {/* Left: text content */}
          <div className={styles.textCol}>
            <p className={styles.eyebrow}>For Creators</p>
            <h2 id="creator-rewards-heading" className={styles.headline}>
              Your audience rewards you.
            </h2>
            <p className={styles.body}>
              Launch your creator token in minutes. Your audience buys and stakes it. Every second they watch while
              staked, they earn — and so do you. Rewards flow monthly, on-chain, without intermediaries.
            </p>
            <ul className={styles.featureList} role="list">
              {FEATURES.map((feature) => (
                <li key={feature} className={styles.featureItem}>
                  <CheckIcon />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: token stats visual */}
          <div className={styles.visualCol}>
            <TokenStatsCard />
          </div>
        </div>
      </div>
    </section>
  );
}
