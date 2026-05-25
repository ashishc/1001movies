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

// Amazon Associates tracking ID. Hardcoded because Cloudflare Pages env var
// inlining for NEXT_PUBLIC_* was being flaky. Affiliate IDs are not secret —
// they appear in every affiliate URL anyway, so committing this is safe.
// To override, still set NEXT_PUBLIC_AMAZON_TAG (env wins over default).
export const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG || 'ashishc-20';

// Estimated percentile lookup. Based on a rough power-law approximation of how many users
// reach each count (most users plateau at <50; few reach 250+). Updated periodically as we
// gather real data. Returns a string like "73% of trackers".
//
// Curve: 1 - exp(-n/120). Tuned so:
//   0   → 0%       (we hide the brag line in this case)
//   10  → 8%
//   50  → 34%
//   100 → 56%
//   250 → 88%
//   500 → 98%
//   1000+ → 99.9%
export function estimatePercentile(watchedCount: number): string {
  if (watchedCount <= 0) return '0%';
  const pct = Math.min(99.9, 100 * (1 - Math.exp(-watchedCount / 120)));
  return `${pct.toFixed(pct >= 99 ? 1 : 0)}%`;
}
