// Convenience wrapper: re-scrape Letterboxd + re-enrich via TMDB + commit.
// Run this locally on or around the 1st of each month so the canon stays fresh.
//
// Requires:
//   - microbrowser running at localhost:3010 (for the Letterboxd scrape)
//   - TMDB_TOKEN env var (for enrichment)
//
// Usage:
//   TMDB_TOKEN=eyJ... node scripts/refresh-data.mjs
//
// What it does:
//   1. Backs up the current cache so we can diff
//   2. Re-runs scrape-letterboxd.mjs (writes scripts/letterboxd-flat.json)
//   3. Re-runs enrich-tmdb.mjs (writes app/data/movies.json)
//   4. Prints a summary of what changed (films added/removed)
//
// You then commit + push manually after reviewing the diff.

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

if (!process.env.TMDB_TOKEN) {
  console.error('Missing TMDB_TOKEN. Get one at https://www.themoviedb.org/settings/api');
  process.exit(1);
}

function run(cmd, args = []) {
  return new Promise((resolve, reject) => {
    console.log(`\n→ ${cmd} ${args.join(' ')}`);
    const p = spawn(cmd, args, { stdio: 'inherit', cwd: ROOT, env: process.env });
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`exit ${code}`))));
  });
}

function readMovies() {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, 'app/data/movies.json'), 'utf8'));
  } catch {
    return [];
  }
}

async function main() {
  console.log('=== refresh-data.mjs ===');

  const before = readMovies();
  const beforeIds = new Set(before.map((m) => m.id));
  console.log(`Before: ${before.length} films`);

  // Force re-scrape: nuke just the cache that the scraper checks against.
  // (The script skips decades whose count >= target; clearing forces a refresh.)
  const cachePath = path.join(__dirname, 'letterboxd-cache.json');
  if (fs.existsSync(cachePath)) {
    const backup = path.join(__dirname, `letterboxd-cache.${Date.now()}.bak.json`);
    fs.copyFileSync(cachePath, backup);
    fs.unlinkSync(cachePath);
    console.log(`Backed up old cache to ${path.basename(backup)}`);
  }

  await run('node', ['scripts/scrape-letterboxd.mjs']);
  await run('node', ['scripts/enrich-tmdb.mjs']);

  const after = readMovies();
  const afterIds = new Set(after.map((m) => m.id));
  const added = after.filter((m) => !beforeIds.has(m.id));
  const removed = before.filter((m) => !afterIds.has(m.id));

  console.log('\n=== diff ===');
  console.log(`Total films: ${before.length} → ${after.length}`);
  console.log(`Added (${added.length}):`);
  added.slice(0, 20).forEach((m) => console.log(`  + ${m.title} (${m.year})`));
  if (added.length > 20) console.log(`  … and ${added.length - 20} more`);
  console.log(`Removed (${removed.length}):`);
  removed.slice(0, 20).forEach((m) => console.log(`  - ${m.title} (${m.year})`));
  if (removed.length > 20) console.log(`  … and ${removed.length - 20} more`);

  console.log('\n✓ Done. Review the diff, then:');
  console.log('  git add app/data/movies.json scripts/letterboxd-cache.json scripts/tmdb-cache.json');
  console.log('  git commit -m "Refresh canon for [Month YYYY]"');
  console.log('  git push');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
