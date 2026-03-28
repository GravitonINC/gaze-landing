import styles from './StatsBar.module.css';

// Placeholder data structure — wire to GET /tokens/platform
interface PlatformStat {
  label: string;
  value: string;
  description: string;
}

const PLACEHOLDER_STATS: PlatformStat[] = [
  {
    label: 'TVL',
    value: '$—',
    description: 'Total value staked',
  },
  {
    label: 'Active Watchers',
    value: '—',
    description: 'Unique viewers this month',
  },
  {
    label: 'Creator Tokens',
    value: '—',
    description: 'Bonding curves deployed',
  },
  {
    label: '24h Volume',
    value: '$—',
    description: 'Buy + sell transactions',
  },
];

export default function StatsBar() {
  return (
    <section className={styles.statsBar} aria-label="Protocol statistics">
      <div className={`container ${styles.inner}`}>
        {PLACEHOLDER_STATS.map((stat) => (
          <div key={stat.label} className={styles.stat}>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
            <span className={styles.statDescription}>{stat.description}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
