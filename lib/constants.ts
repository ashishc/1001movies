// Films almost every adult has seen. Used for endowed-progress pre-tick on first visit.
// Picked for: (1) high cultural recognition, (2) range across eras, (3) all in our dataset.
export const ENDOWED_TITLES: Array<{ titleStartsWith: string; year: number }> = [
  { titleStartsWith: 'The Godfather', year: 1972 },
  { titleStartsWith: 'Star Wars', year: 1977 },
  { titleStartsWith: 'E.T.', year: 1982 },
  { titleStartsWith: 'Pulp Fiction', year: 1994 },
  { titleStartsWith: 'The Lord of the Rings', year: 2001 },
];

// Milestone thresholds (count of watched). Each triggers a celebration.
export const MILESTONES = [10, 25, 50, 100, 250, 500, 750, 1000, 1149];

export const SITE_URL = 'https://1001movies.app';
export const SITE_NAME = '1001 Movies';

// Amazon Associates tracking ID. Replace with your real one (looks like 'yourname-20').
// Until set, Amazon links are hidden on movie pages.
export const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG || '';

// Estimated percentile lookup. Based on a rough power-law approximation of how many users
// reach each count (most users plateau at <50; few reach 250+). Updated periodically.
// Returns a string like "73% of trackers".
export function estimatePercentile(watchedCount: number, total = 1149): string {
  // Smooth curve: small counts beat very few people; high counts beat almost everyone.
  // 0 → 0%, 10 → 18%, 50 → 55%, 100 → 73%, 250 → 91%, 500 → 98%, 1000+ → 99.9%
  const pct = Math.min(99.9, 100 * (1 - Math.exp(-watchedCount / 120)));
  return `${pct.toFixed(pct >= 99 ? 1 : 0)}%`;
}
