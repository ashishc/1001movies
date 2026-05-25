// Build sitemap.xml + robots.txt against the current movies dataset.
// Runs after `next build` and writes into ./out (the static export folder).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const SITE = 'https://1001movies.app';

const movies = JSON.parse(fs.readFileSync(path.join(root, 'app/data/movies.json'), 'utf8'));
const decades = ['1900s', '1910s', '1920s', '1930s', '1940s', '1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];
const genres = [
  'action', 'adventure', 'animation', 'comedy', 'crime', 'documentary', 'drama',
  'family', 'fantasy', 'history', 'horror', 'music', 'mystery', 'romance',
  'science-fiction', 'thriller', 'war', 'western',
];

const today = new Date().toISOString().slice(0, 10);
const urls = [
  '',
  '/stats',
  '/compare',
  '/random',
  '/about',
  ...decades.map((d) => `/decade/${d}`),
  ...genres.map((g) => `/genre/${g}`),
  ...movies.map((m) => `/movie/${m.id}`),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => `  <url>
    <loc>${SITE}${u}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${u === '' ? '1.0' : u.startsWith('/movie/') ? '0.6' : '0.8'}</priority>
  </url>`)
  .join('\n')}
</urlset>
`;

// robots.txt:
// - Allow all standard search engine crawlers (we WANT to be indexed)
// - Block known AI-training scrapers. They take but don't link back; they're
//   visible in our logs scraping ~25% of all traffic and contribute zero
//   discoverability. Any bot that respects robots.txt should opt out here.
//   (ClaudeBot, GoogleOther, etc. all honor robots.txt per their docs.)
//
// We deliberately do NOT block GoogleBot, BingBot, DuckDuckBot, or social
// preview bots (LinkedInBot, Twitterbot, FacebookBot) — those drive humans.
const robots = `# Search engines: please index everything
User-agent: *
Allow: /

# AI training crawlers: thanks but no thanks
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Claude-Web
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: GoogleOther
Disallow: /

User-agent: PerplexityBot
Disallow: /

User-agent: Perplexity-User
Disallow: /

User-agent: cohere-ai
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: Amazonbot
Disallow: /

User-agent: meta-externalagent
Disallow: /

Sitemap: ${SITE}/sitemap.xml
`;

const outDir = path.join(root, 'out');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'sitemap.xml'), xml);
fs.writeFileSync(path.join(outDir, 'robots.txt'), robots);
console.log(`Wrote sitemap with ${urls.length} URLs → out/sitemap.xml`);
console.log(`Wrote out/robots.txt`);
