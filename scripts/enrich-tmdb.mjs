// Enriches scripts/letterboxd-flat.json with director/genre/runtime/description from TMDB.
// TMDB has a free API. To run, get a free read-access token at:
//   https://www.themoviedb.org/settings/api  ("API Read Access Token")
// Then export TMDB_TOKEN=... before running this script.
//
// Output: app/data/movies.json (the production dataset).
// Caches per-film fetch results in scripts/tmdb-cache.json so re-runs are cheap.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const TOKEN = process.env.TMDB_TOKEN;
if (!TOKEN) {
  console.error('Missing TMDB_TOKEN env var. Get a free token at https://www.themoviedb.org/settings/api');
  process.exit(1);
}

const FLAT = path.join(__dirname, 'letterboxd-flat.json');
const CACHE = path.join(__dirname, 'tmdb-cache.json');
const OUT = path.join(ROOT, 'app/data/movies.json');

const films = JSON.parse(fs.readFileSync(FLAT, 'utf8'));
const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const TMDB_GENRE_PRIORITY = [
  'Horror', 'Science Fiction', 'War', 'Western', 'Animation', 'Documentary',
  'Music', 'Fantasy', 'Mystery', 'Thriller', 'Crime', 'Comedy', 'Romance',
  'Adventure', 'Action', 'Family', 'History', 'Drama',
];

function pickGenre(genres) {
  if (!Array.isArray(genres) || genres.length === 0) return 'Drama';
  const names = genres.map((g) => g.name);
  for (const g of TMDB_GENRE_PRIORITY) {
    if (names.includes(g)) return g;
  }
  return names[0] || 'Drama';
}

function formatRuntime(min) {
  if (!min || !Number.isFinite(min)) return '';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

async function tmdb(endpoint) {
  const url = `https://api.themoviedb.org/3${endpoint}`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}`, accept: 'application/json' } });
  if (!r.ok) throw new Error(`TMDB ${endpoint} → ${r.status}`);
  return r.json();
}

async function findTmdbId(title, year) {
  const q = encodeURIComponent(title);
  const search = await tmdb(`/search/movie?query=${q}&year=${year}&include_adult=false&language=en-US`);
  const exact = (search.results || []).find((r) => {
    const ry = (r.release_date || '').slice(0, 4);
    return ry === String(year);
  });
  return (exact || search.results?.[0])?.id || null;
}

async function getDetails(tmdbId) {
  return tmdb(`/movie/${tmdbId}?language=en-US&append_to_response=credits`);
}

async function enrichFilm(film) {
  if (cache[film.id]) return { ...film, ...cache[film.id] };

  let tmdbId;
  try {
    tmdbId = await findTmdbId(film.title, film.year);
  } catch (e) {
    console.warn(`  search failed for ${film.title}: ${e.message}`);
    return film;
  }
  if (!tmdbId) return film;

  await sleep(40); // TMDB rate limit ~50 req/s; we go gentler.
  let d;
  try {
    d = await getDetails(tmdbId);
  } catch (e) {
    console.warn(`  details failed for ${film.title}: ${e.message}`);
    return film;
  }

  const director = (d.credits?.crew || []).find((c) => c.job === 'Director')?.name || '';
  const genre = pickGenre(d.genres || []);
  const runtime = formatRuntime(d.runtime);
  const description = d.overview || '';
  // Prefer a higher-res TMDB poster over the small Letterboxd thumbnail.
  const poster = d.poster_path
    ? `https://image.tmdb.org/t/p/w500${d.poster_path}`
    : film.poster;

  const enriched = { director, genre, runtime, description, poster, tmdbId };
  cache[film.id] = enriched;
  return { ...film, ...enriched };
}

async function main() {
  const out = [];
  let done = 0;
  for (const f of films) {
    const e = await enrichFilm(f);
    out.push(e);
    done++;
    if (done % 25 === 0) {
      fs.writeFileSync(CACHE, JSON.stringify(cache, null, 2));
      console.log(`  enriched ${done}/${films.length}`);
    }
  }
  fs.writeFileSync(CACHE, JSON.stringify(cache, null, 2));

  // Final shape — match what app/data/movies.json expects
  const cleaned = out
    .filter((f) => f.title && f.year)
    .map((f) => ({
      id: f.id,
      title: f.title,
      director: f.director || '',
      year: f.year,
      genre: f.genre || 'Drama',
      description: f.description || '',
      poster: f.poster || '',
      runtime: f.runtime || '',
      rating: f.rating, // Letterboxd weighted average
    }))
    .sort((a, b) => a.year - b.year || a.title.localeCompare(b.title));

  fs.writeFileSync(OUT, JSON.stringify(cleaned, null, 0));
  console.log(`\n✓ Wrote ${cleaned.length} films to ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
