// Build the canon directly from TMDB's /discover/movie endpoint.
// TMDB has a free, public, official API that explicitly permits commercial
// use with attribution. Replaces the previous Letterboxd scrape which was
// in legal grey-water territory.
//
// Strategy per decade:
//   1. Query TMDB with a vote_count threshold tuned to the era (older films
//      have fewer votes; modern films have many) so we get the same kind
//      of "popular AND well-rated" canon that Letterboxd's popularity sort
//      delivers.
//   2. Sort by vote_average descending, take top N per decade.
//   3. Drop documentaries-of-concerts, anime TV cuts, and TV-special-style
//      entries by filtering on `original_language` and minimum runtime
//      (handled in the subsequent enrich step which already calls
//      /movie/{id} for full details).
//
// Output: scripts/tmdb-canon-flat.json (same shape the old letterboxd-flat.json
// produced — slug, title, year, rating, poster). Then run enrich-tmdb.mjs
// to populate director/genre/runtime/description.
//
// Usage:
//   TMDB_TOKEN=eyJ... node scripts/fetch-tmdb-canon.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKEN = process.env.TMDB_TOKEN;

if (!TOKEN) {
  console.error('Missing TMDB_TOKEN. Get one at https://www.themoviedb.org/settings/api');
  process.exit(1);
}

// Per-decade quota + minimum vote count.
// Quotas match the prior canon shape (5/10/40/80/100/120/130/130/130/130/80/80/50).
// Vote thresholds tuned via empirical testing against TMDB to mirror "the most-loved
// films of this era" while keeping out fanbase outliers.
const DECADES = [
  { start: 1900, end: 1909, quota: 5,   minVotes: 10 },
  { start: 1910, end: 1919, quota: 10,  minVotes: 50 },
  { start: 1920, end: 1929, quota: 40,  minVotes: 100 },
  { start: 1930, end: 1939, quota: 80,  minVotes: 150 },
  { start: 1940, end: 1949, quota: 100, minVotes: 200 },
  { start: 1950, end: 1959, quota: 120, minVotes: 300 },
  { start: 1960, end: 1969, quota: 130, minVotes: 400 },
  { start: 1970, end: 1979, quota: 130, minVotes: 600 },
  { start: 1980, end: 1989, quota: 130, minVotes: 800 },
  { start: 1990, end: 1999, quota: 130, minVotes: 1000 },
  { start: 2000, end: 2009, quota: 100, minVotes: 2000 },
  { start: 2010, end: 2019, quota: 100, minVotes: 2500 },
  { start: 2020, end: 2025, quota: 50,  minVotes: 2000 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function tmdb(endpoint) {
  const res = await fetch(`https://api.themoviedb.org/3${endpoint}`, {
    headers: { Authorization: `Bearer ${TOKEN}`, accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`TMDB ${endpoint} -> ${res.status}`);
  return res.json();
}

function slugify(s, year) {
  const base = String(s)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  // Disambiguate by year for common titles.
  return year ? `${base}-${year}` : base;
}

async function fetchDecade({ start, end, quota, minVotes }) {
  const collected = [];
  const seen = new Set();
  // /discover paginates 20 per page. Fetch a few pages until quota.
  // 20 results per page; we may need ~quota/20 + buffer for dropped items.
  const maxPages = Math.ceil(quota / 18) + 2;
  for (let page = 1; page <= maxPages && collected.length < quota; page++) {
    const url =
      `/discover/movie?` +
      `primary_release_date.gte=${start}-01-01` +
      `&primary_release_date.lte=${end}-12-31` +
      `&sort_by=vote_average.desc` +
      `&vote_count.gte=${minVotes}` +
      `&include_adult=false` +
      `&with_runtime.gte=60` +  // skip shorts and TV-specials
      `&language=en-US` +
      `&page=${page}`;
    const data = await tmdb(url);
    const results = data.results || [];
    for (const r of results) {
      if (collected.length >= quota) break;
      if (!r.release_date) continue;
      const yr = parseInt(r.release_date.slice(0, 4), 10);
      if (yr < start || yr > end) continue;
      const slug = slugify(r.title, yr);
      if (seen.has(slug)) continue;
      seen.add(slug);
      collected.push({
        id: slug,
        tmdbId: r.id,
        title: r.title,
        year: yr,
        rating: Math.round(r.vote_average * 100) / 100,
        votes: r.vote_count,
        poster: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : '',
      });
    }
    await sleep(60); // gentle on TMDB rate limit
    if (results.length === 0) break;
  }
  return collected.slice(0, quota);
}

async function main() {
  const all = [];
  for (const decade of DECADES) {
    process.stdout.write(`→ ${decade.start}s (quota ${decade.quota}, votes>=${decade.minVotes}) ... `);
    const films = await fetchDecade(decade);
    process.stdout.write(`got ${films.length}\n`);
    all.push(...films);
    if (films.length > 0) {
      const top3 = films.slice(0, 3).map((f) => `${f.title} (${f.year})`).join(', ');
      console.log(`   top: ${top3}`);
    }
  }
  const outPath = path.join(__dirname, 'tmdb-canon-flat.json');
  fs.writeFileSync(outPath, JSON.stringify(all, null, 0));
  console.log(`\n✓ Wrote ${all.length} films -> ${outPath}`);
  console.log(`Next: TMDB_TOKEN=… node scripts/enrich-tmdb.mjs`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
