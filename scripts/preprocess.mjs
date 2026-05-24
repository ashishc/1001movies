// Reads movies-raw.json (Rooyca/1001M dataset) and emits a clean app/data/movies.json.
// Drops obviously-bad rows, normalizes fields, assigns stable IDs, sorts by year.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const raw = JSON.parse(fs.readFileSync(path.join(root, 'movies-raw.json'), 'utf8'));
const list = raw.movies || [];

// Heuristic: real entries from the book have a recognised genre tag.
// "#Movie" tag entries are dataset noise — drop them.
const VALID_GENRES = new Set([
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery',
  'Romance', 'Science Fiction', 'Thriller', 'War', 'Western',
]);

function slugify(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

const seen = new Set();
const cleaned = [];

for (const m of list) {
  const tag = (m.tags || '').trim();
  if (!VALID_GENRES.has(tag)) continue; // drop "#Movie" noise
  const yearNum = parseInt(m.year, 10);
  if (Number.isNaN(yearNum) || yearNum < 1880 || yearNum > 2030) continue;

  const id = `${slugify(m.title)}-${yearNum}`;
  if (seen.has(id)) continue;
  seen.add(id);

  cleaned.push({
    id,
    title: (m.title || '').trim(),
    director: (m.director || '').trim(),
    year: yearNum,
    genre: tag,
    description: (m.desc || '').trim(),
    poster: m.img || '',
    runtime: (m.length || '').trim(),
  });
}

cleaned.sort((a, b) => a.year - b.year || a.title.localeCompare(b.title));

const outDir = path.join(root, 'app', 'data');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'movies.json'), JSON.stringify(cleaned, null, 0));

const decadeCounts = {};
for (const m of cleaned) {
  const d = Math.floor(m.year / 10) * 10;
  decadeCounts[d] = (decadeCounts[d] || 0) + 1;
}

console.log(`Wrote ${cleaned.length} movies → app/data/movies.json`);
console.log(`Decades:`, decadeCounts);
console.log(`Genres:`, [...new Set(cleaned.map(m => m.genre))].sort());
