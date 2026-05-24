# 1001 Movies Tracker

Interactive checklist for *1001 Movies You Must See Before You Die*. Built with Next.js + Tailwind, statically exported, deploys identically to Vercel or Cloudflare Pages.

## Stack

- Next.js 14 (App Router, `output: 'export'` — pure static HTML)
- React 18 + TypeScript
- Tailwind CSS
- localStorage for progress (no DB, no signup)
- TMDB poster CDN for images

## Local development

```bash
npm install
npm run preprocess   # one-time, builds app/data/movies.json from movies-raw.json
npm run dev          # http://localhost:3000
```

## Build & deploy

```bash
npm run build        # outputs static site to ./out
```

### Deploy to Vercel
```bash
npx vercel --prod
```

### Deploy to Cloudflare Pages
```bash
npx wrangler pages deploy out --project-name=1001movies
```

Both work; Cloudflare wins on bandwidth (unlimited free) for traffic-heavy sites.

## Adding more "before you die" lists later

`<Tracker>` is generic — any list of `{id, title, ...}` plugs in. To launch the next site (1001 Books, National Parks, 75 Hard, etc.) copy this app, swap `movies.json`, rename a few labels.
