// Polite Letterboxd scraper: pulls top-rated films per decade via the microbrowser
// service running on localhost:3010 (which handles Cloudflare's JS challenge).
//
// Targets ~1001 films total across 12 decades, weighted by canonical density:
//   1900s 5  · 1910s 10 · 1920s 40 · 1930s 80 · 1940s 100
//   1950s 120 · 1960s 130 · 1970s 130 · 1980s 130 · 1990s 130 · 2000s 80 · 2020s 50
// (totals ~1005 with some headroom for de-duping)
//
// Data is cached to scripts/letterboxd-cache.json so re-runs are cheap.
// Run: node scripts/scrape-letterboxd.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CACHE = path.join(__dirname, 'letterboxd-cache.json');
const OUT = path.join(ROOT, 'app/data/movies.json');
const MB = 'http://localhost:3010';

const TARGETS = {
  '1900s': 5,
  '1910s': 10,
  '1920s': 40,
  '1930s': 80,
  '1940s': 100,
  '1950s': 120,
  '1960s': 130,
  '1970s': 130,
  '1980s': 130,
  '1990s': 130,
  '2000s': 80,
  '2010s': 80,
  '2020s': 50,
};
const MIN_RATING = 3.4; // safety floor — anything below isn't really "canon"

async function mb(method, pathname, body) {
  const res = await fetch(`${MB}${pathname}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${pathname} → ${res.status}`);
  return res.json();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function newBrowser() {
  const r = await mb('POST', '/browsers', {});
  return r.id;
}
async function closeBrowser(id) {
  try {
    await mb('DELETE', `/browsers/${id}`);
  } catch {}
}

async function evalScript(id, script) {
  const r = await mb('POST', `/browsers/${id}/evaluate`, { script });
  return r.result;
}

async function navigate(id, url) {
  await mb('POST', `/browsers/${id}/navigate`, { url });
}

const EXTRACT = `(() => {
  const els = document.querySelectorAll('.film-poster');
  return Array.from(els).map(el => {
    const a = el.querySelector('a.frame');
    const img = el.querySelector('img');
    const t = (a?.getAttribute('data-original-title') || '').trim();
    // "Title (YYYY) 4.52"  — sometimes no year, sometimes no rating
    const m = t.match(/^(.*) \\((\\d{4})\\) (\\d+\\.\\d+)$/);
    if (!m) return null;
    return {
      slug: (a?.getAttribute('href') || '').replace(/^\\/film\\//, '').replace(/\\/$/, ''),
      title: m[1],
      year: parseInt(m[2], 10),
      rating: parseFloat(m[3]),
      poster: img?.src || '',
    };
  }).filter(Boolean);
})()`;

async function scrapeDecade(id, decadeSlug, target) {
  const results = [];
  const seenSlugs = new Set();
  // Letterboxd shows ~72 per page. We need ~target / 72 pages. Cap aggressively.
  const maxPages = Math.min(20, Math.ceil(target / 50) + 3);

  for (let page = 1; page <= maxPages; page++) {
    // /popular/decade/ ranks by Letterboxd's popularity (views × rating) — far cleaner
    // than /by/rating/ which surfaces niche-fanbase outliers (anime cuts, recap films).
    const url = `https://letterboxd.com/films/popular/decade/${decadeSlug}/page/${page}/`;
    process.stdout.write(`  page ${page}…`);
    await navigate(id, url);
    await sleep(2500); // give CF challenge + JS render time

    const films = await evalScript(id, EXTRACT);
    if (!films || films.length === 0) {
      // try once more with a longer pause
      await sleep(2500);
      const retry = await evalScript(id, EXTRACT);
      if (!retry || retry.length === 0) {
        console.log(' empty page, stopping');
        break;
      }
      films.push(...retry);
    }
    let added = 0;
    for (const f of films) {
      if (seenSlugs.has(f.slug)) continue;
      if (f.rating < MIN_RATING) continue;
      // Verify the year actually falls in this decade (some films span eras)
      const decadeStart = parseInt(decadeSlug, 10);
      if (f.year < decadeStart || f.year >= decadeStart + 10) continue;
      seenSlugs.add(f.slug);
      results.push(f);
      added++;
    }
    process.stdout.write(` got ${added}, total ${results.length}\n`);
    if (results.length >= target) break;

    // Polite: sleep 1s between pages
    await sleep(1000);
  }

  return results.slice(0, target);
}

async function main() {
  const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {};
  const id = await newBrowser();
  console.log(`Browser ${id} ready.`);

  try {
    for (const [decade, target] of Object.entries(TARGETS)) {
      if (cache[decade] && cache[decade].length >= target) {
        console.log(`✓ ${decade}: cached ${cache[decade].length}`);
        continue;
      }
      console.log(`→ ${decade} (target ${target})`);
      const films = await scrapeDecade(id, decade, target);
      cache[decade] = films;
      fs.writeFileSync(CACHE, JSON.stringify(cache, null, 2));
      console.log(`✓ ${decade}: ${films.length} cached.`);
    }
  } finally {
    await closeBrowser(id);
  }

  // Flatten + write a draft movies.json (still missing genre/director/desc/runtime —
  // those come from a TMDB enrichment step in scripts/enrich-tmdb.mjs).
  const flat = [];
  for (const [decade, films] of Object.entries(cache)) {
    for (const f of films) {
      flat.push({
        id: f.slug,
        title: f.title,
        year: f.year,
        rating: f.rating,
        poster: f.poster,
        decade,
        // placeholders, will be filled by TMDB enrichment
        director: '',
        genre: 'Drama',
        description: '',
        runtime: '',
      });
    }
  }
  console.log(`Total films before enrichment: ${flat.length}`);
  fs.writeFileSync(path.join(__dirname, 'letterboxd-flat.json'), JSON.stringify(flat, null, 0));
  console.log(`→ scripts/letterboxd-flat.json written. Next: enrich-tmdb.mjs`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
