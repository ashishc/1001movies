# 1001 Movies — The Cinephile Canon, Tracked

> How many of the greatest movies of all time have you actually seen?
> 1,085 essential films across every decade, ranked by Letterboxd. Free, no signup.

Live at **https://1001movies.app**.

## What this is

An interactive tracker for the most-loved films of every decade (1900s through 2020s),
sourced from Letterboxd's per-decade popularity ranking and enriched with director,
genre, runtime, description, and high-resolution posters from TMDB.

The site uses the famous "1001 Movies You Must See Before You Die" book name as its
brand, but its data is live and community-validated rather than the frozen 2014 book canon.

## Stack

- Next.js 14 (App Router, `output: 'export'` — pure static HTML)
- React 18 + TypeScript + Tailwind CSS
- **No backend, no database** — `localStorage` is the source of truth
- Posters served from TMDB's CDN
- Hosted on **Cloudflare Pages** (free, unlimited bandwidth, edge-cached globally)
- Cloudflare Web Analytics for traffic numbers

## Local development

```bash
npm install
npm run dev          # http://localhost:3000
```

## Build

```bash
npm run build        # writes static export to ./out (1,123 pages, ~5 MB)
```

Cloudflare Pages picks this up via the connected GitHub repo. Pushes to `main`
auto-deploy in ~90 seconds.

## Refreshing the dataset

The site's canon is rebuilt from Letterboxd + TMDB. Run this on or around the 1st
of each month to keep the data current:

```bash
TMDB_TOKEN=eyJ... npm run refresh
```

What it does:
1. Re-scrapes Letterboxd's per-decade popularity pages via the microbrowser
2. Re-enriches all titles via TMDB
3. Writes `app/data/movies.json`
4. Prints a diff (films added / removed)

You then `git add`, `git commit`, `git push` after reviewing.

## Project layout

```
app/
  data/movies.json          # the canon (1,085 films, regenerated monthly)
  page.tsx                  # /  — main tracker
  stats/                    # /stats  — percentile, decade heatmap, taste profile
  compare/                  # /compare  — share-link friend comparison
  decade/[slug]/            # /decade/2020s, /decade/1970s, ... (13 SEO pages)
  genre/[slug]/             # /genre/horror, /genre/drama, ... (18 SEO pages)
  movie/[id]/               # /movie/oppenheimer-2023, ... (1,085 SEO pages)
  about/                    # /about  — methodology, EEAT
components/
  Tracker.tsx               # the main interactive grid
  ScopedTracker.tsx         # same UX scoped to one decade or genre
  ShareModal.tsx            # 4 canvas-rendered share-card templates
  Onboarding.tsx            # first-visit modal w/ endowed-progress 5 pre-ticked
  Confetti.tsx              # milestone celebration
  MilestoneModal.tsx        # 10/25/50/100/250/500/750/1000/1085
  UpNext.tsx                # 3 most-recent unwatched films
  ...
lib/
  storage.ts                # localStorage helpers (watched set + filters + streak)
  stats.ts                  # decade / genre / director / runtime / taste profile
  sharecard.ts              # canvas templates: percentile, heatmap, taste, top-4, compare
  compare.ts                # encode/decode watched-set as URL-safe bitvector
  track.ts                  # event tracking shim (Plausible-compatible, no-op fallback)
  constants.ts              # MILESTONES, ENDOWED_TITLES, percentile fn, AMAZON_TAG
scripts/
  scrape-letterboxd.mjs     # microbrowser-driven monthly scrape
  enrich-tmdb.mjs           # adds director/genre/runtime/desc/poster
  refresh-data.mjs          # one-shot wrapper for both above
  build-sitemap.mjs         # writes out/sitemap.xml + out/robots.txt
  build-og.mjs              # writes public/og.svg (1200x630 social card)
public/
  favicon.svg, apple-touch-icon.svg, og.svg
```

## Environment variables

Set in Cloudflare Pages project → Settings → Environment variables:

| Variable                    | Purpose                                            |
|-----------------------------|----------------------------------------------------|
| `NODE_VERSION`              | `20` (Wrangler v4 needs Node ≥ 20)                 |
| `NEXT_PUBLIC_AMAZON_TAG`    | Amazon Associates tag, e.g. `ashishc-20`. Optional; if unset, "Buy on Amazon" links don't render. |

For the local refresh script:

| Variable                    | Purpose                                            |
|-----------------------------|----------------------------------------------------|
| `TMDB_TOKEN`                | TMDB API "Read Access Token" (the long `eyJ...` one). [Get one](https://www.themoviedb.org/settings/api) — free. |

## Affiliate disclosure

Movie pages include outbound links to JustWatch (streaming search) and Amazon
(physical media). Both are affiliate links. The site has no display ads.

## License

MIT.
