import styles from './BondingCurve.module.css';

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
}

function MetricCard({ title, value, description }: MetricCardProps) {
  return (
    <div className={`card ${styles.metricCard}`}>
      <span className={styles.metricTitle}>{title}</span>
      <span className={styles.metricValue}>{value}</span>
      <span className={styles.metricDescription}>{description}</span>
    </div>
  );
}

const HOW_STAKING_WORKS = [
  'Buy a creator token on the open market',
  'Stake it to lock in your position',
  'Watch the creator while staked',
  'Earn rewards every second you watch',
  'Unstake anytime — no lock-up period',
];

export default function BondingCurve() {
  return (
    <section className={`section ${styles.bondingCurve}`} aria-labelledby="bonding-curve-heading">
      <div className="container">
        <div className={styles.layout}>
          {/* Left: metric cards */}
          <div className={styles.metricsCol}>
            <MetricCard
              title="Starting Price"
              value="$0.001"
              description="Every token launches at the same price"
            />
            <MetricCard
              title="Stake Multiplier"
              value="9x"
              description="Watch while staked — maximum leaderboard impact"
            />
          </div>

          {/* Right: explanation text */}
          <div className={styles.textCol}>
            <p className={styles.eyebrow}>The Mechanics</p>
            <h2 id="bonding-curve-heading" className={styles.headline}>
              A market for attention.
            </h2>
            <p className={styles.body}>
              Every creator token follows the same bonding curve. Price rises automatically as more tokens are bought.
              There&apos;s no pre-sale, no insider allocation — just the market.
            </p>

            <div className={styles.stakingSection}>
              <h3 className={styles.stakingHeading}>How staking works:</h3>
              <ol className={styles.stakingList} role="list">
                {HOW_STAKING_WORKS.map((step, index) => (
                  <li key={index} className={styles.stakingItem}>
                    <span className={styles.stepNumber}>{index + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
