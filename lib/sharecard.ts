// Client-side canvas share-card generator. Returns a PNG dataURL.
// Five templates: percentile, decade-heatmap, taste, top4, compare.
import type { Movie } from './types';
import { computeStats } from './stats';
import { estimatePercentile } from './constants';

export type ShareTemplate = 'percentile' | 'heatmap' | 'taste' | 'top4' | 'compare';

const W = 1080;
const H = 1080;

const COL = {
  bg: '#0b0b0f',
  ink: '#f5f5f0',
  muted: '#9ca3af',
  accent: '#ff5a3c',
  line: '#1f1f24',
  good: '#62e3a4',
};

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawWatermark(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = COL.muted;
  ctx.font = '500 22px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('1001movies.app', W - 48, H - 48);
}

function drawHeader(ctx: CanvasRenderingContext2D, kicker: string) {
  ctx.fillStyle = COL.accent;
  ctx.font = '600 22px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(kicker.toUpperCase(), 60, 80);
  ctx.fillStyle = COL.line;
  ctx.fillRect(60, 100, 80, 2);
}

export function makeCard(
  template: ShareTemplate,
  watched: Set<string>,
  movies: Movie[],
  extra?: { compareCount?: number; compareName?: string },
): string {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;

  // Background
  ctx.fillStyle = COL.bg;
  ctx.fillRect(0, 0, W, H);

  const stats = computeStats(movies, watched);

  if (template === 'percentile') {
    drawHeader(ctx, '1001 Movies · Progress');
    const pct = (stats.pct * 100).toFixed(1);
    const percentile = estimatePercentile(stats.watched);

    ctx.fillStyle = COL.ink;
    ctx.font = '700 220px Georgia, "Times New Roman", serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${stats.watched}`, 60, 360);

    ctx.fillStyle = COL.muted;
    ctx.font = '500 60px Georgia, "Times New Roman", serif';
    ctx.fillText(`/ ${stats.total}`, 60, 430);

    ctx.fillStyle = COL.ink;
    ctx.font = '600 56px system-ui, sans-serif';
    ctx.fillText(`${pct}% of the canon`, 60, 540);

    const topPct = 100 - parseFloat(percentile);
    ctx.fillStyle = COL.accent;
    ctx.font = '700 90px Georgia, serif';
    if (topPct < 50) {
      // Show "Top X%" only when it's actually a brag (top half).
      ctx.fillText(`Top ${topPct.toFixed(0)}%`, 60, 700);
    } else {
      // Otherwise lean into the journey framing instead of the rank.
      ctx.fillText(`Just getting started`, 60, 700);
    }

    ctx.fillStyle = COL.muted;
    ctx.font = '500 32px system-ui, sans-serif';
    ctx.fillText(`Ahead of ${percentile} of trackers.`, 60, 760);

    // Taste line
    ctx.fillStyle = COL.ink;
    ctx.font = '400 28px Georgia, serif';
    ctx.fillText(stats.tasteProfile, 60, 830);
  }

  if (template === 'heatmap') {
    drawHeader(ctx, '1001 Movies · Decade Heatmap');
    ctx.fillStyle = COL.ink;
    ctx.font = '700 70px Georgia, serif';
    ctx.fillText(`${stats.watched} / ${stats.total}`, 60, 200);

    ctx.fillStyle = COL.muted;
    ctx.font = '400 28px system-ui, sans-serif';
    ctx.fillText(stats.tasteProfile, 60, 240);

    // Heatmap: 12 rows (decades) × variable cells
    const decades = Object.keys(stats.decadeCounts)
      .map(Number)
      .sort((a, b) => a - b);

    const top = 320;
    const left = 60;
    const rowH = 50;
    const labelW = 110;
    const innerW = W - left - labelW - 60;

    decades.forEach((d, i) => {
      const v = stats.decadeCounts[d];
      const y = top + i * rowH;
      ctx.fillStyle = COL.muted;
      ctx.font = '600 22px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${d}s`, left, y + 28);

      // Row total bar background
      ctx.fillStyle = COL.line;
      roundRect(ctx, left + labelW, y + 8, innerW, 30, 6);
      ctx.fill();
      // Watched bar
      const w = innerW * (v.watched / Math.max(1, v.total));
      ctx.fillStyle = COL.accent;
      roundRect(ctx, left + labelW, y + 8, w, 30, 6);
      ctx.fill();
      // Count text
      ctx.fillStyle = COL.ink;
      ctx.font = '600 20px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${v.watched}/${v.total}`, W - 60, y + 28);
    });
  }

  if (template === 'taste') {
    drawHeader(ctx, '1001 Movies · Taste Profile');
    ctx.fillStyle = COL.ink;
    ctx.font = '700 64px Georgia, serif';
    ctx.fillText('My taste:', 60, 220);

    // Wrap profile text
    ctx.font = '700 56px Georgia, serif';
    ctx.fillStyle = COL.accent;
    wrapText(ctx, stats.tasteProfile, 60, 310, W - 120, 70);

    // Top directors
    ctx.fillStyle = COL.muted;
    ctx.font = '600 22px system-ui, sans-serif';
    ctx.fillText('TOP DIRECTORS', 60, 580);

    let ty = 620;
    stats.topDirectors.slice(0, 6).forEach((d) => {
      ctx.fillStyle = COL.ink;
      ctx.font = '500 32px Georgia, serif';
      ctx.textAlign = 'left';
      ctx.fillText(d.name, 60, ty);
      ctx.fillStyle = COL.muted;
      ctx.font = '400 28px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${d.watched} / ${d.total}`, W - 60, ty);
      ty += 50;
    });
  }

  if (template === 'top4') {
    // Take 4 most "important" watched films: any in user's watched, prefer earliest year + iconic.
    const watchedFilms = movies.filter((m) => watched.has(m.id));
    const top4 = watchedFilms.slice(0, 4);
    drawHeader(ctx, '1001 Movies · From My List');

    ctx.fillStyle = COL.ink;
    ctx.font = '700 56px Georgia, serif';
    ctx.fillText('Four watched, of 1001.', 60, 200);

    // 2x2 grid
    const grid = { x: 60, y: 260, gap: 24, cellW: 460, cellH: 320 };
    top4.forEach((m, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = grid.x + col * (grid.cellW + grid.gap);
      const y = grid.y + row * (grid.cellH + grid.gap + 60);
      ctx.fillStyle = COL.line;
      roundRect(ctx, x, y, grid.cellW, grid.cellH, 8);
      ctx.fill();
      ctx.fillStyle = COL.ink;
      ctx.font = '600 30px Georgia, serif';
      ctx.textAlign = 'left';
      ctx.fillText(m.title.slice(0, 28), x, y + grid.cellH + 36);
      ctx.fillStyle = COL.muted;
      ctx.font = '400 22px system-ui, sans-serif';
      ctx.fillText(`${m.year} · ${m.director.slice(0, 30)}`, x, y + grid.cellH + 64);
    });
  }

  if (template === 'compare') {
    drawHeader(ctx, '1001 Movies · Compared');
    const myCount = stats.watched;
    const theirCount = extra?.compareCount ?? 0;
    const theirName = extra?.compareName ?? 'Your friend';

    ctx.fillStyle = COL.ink;
    ctx.font = '700 56px Georgia, serif';
    ctx.fillText('Who\'s seen more?', 60, 220);

    // Side-by-side counters
    const drawCounter = (x: number, label: string, count: number, color: string) => {
      ctx.fillStyle = COL.muted;
      ctx.font = '600 26px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(label.toUpperCase(), x, 320);
      ctx.fillStyle = color;
      ctx.font = '700 200px Georgia, serif';
      ctx.fillText(String(count), x, 510);
      ctx.fillStyle = COL.muted;
      ctx.font = '500 24px system-ui, sans-serif';
      ctx.fillText(`/ ${stats.total}`, x, 560);
    };
    drawCounter(60, 'You', myCount, COL.accent);
    drawCounter(W / 2 + 30, theirName.slice(0, 14), theirCount, COL.good);

    // Diff text
    const diff = myCount - theirCount;
    ctx.fillStyle = COL.ink;
    ctx.font = '600 40px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText(
      diff === 0
        ? 'Dead even.'
        : diff > 0
        ? `You're ahead by ${diff}.`
        : `${theirName.slice(0, 14)} is ahead by ${-diff}.`,
      60,
      700,
    );
    ctx.fillStyle = COL.muted;
    ctx.font = '400 28px system-ui, sans-serif';
    ctx.fillText('Compare yours: 1001movies.app', 60, 750);
  }

  drawWatermark(ctx);
  return c.toDataURL('image/png');
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(' ');
  let line = '';
  let yy = y;
  ctx.textAlign = 'left';
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, yy);
      line = word + ' ';
      yy += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, yy);
}
