// Computes derived stats from a watched set + the movies dataset.
import type { Movie } from './types';

export type DerivedStats = {
  total: number;
  watched: number;
  pct: number; // 0..1
  decadeCounts: Record<number, { watched: number; total: number }>;
  genreCounts: Record<string, { watched: number; total: number }>;
  topDirectors: Array<{ name: string; watched: number; total: number }>;
  runtimeMinutes: number;
  runtimeLabel: string;
  tasteProfile: string;
};

function runtimeMinutes(s: string): number {
  const h = /(\d+)h/.exec(s);
  const m = /(\d+)m/.exec(s);
  return (h ? parseInt(h[1], 10) * 60 : 0) + (m ? parseInt(m[1], 10) : 0);
}

function decadeFor(year: number): number {
  return Math.floor(year / 10) * 10;
}

export function computeStats(movies: Movie[], watched: Set<string>): DerivedStats {
  const decadeCounts: DerivedStats['decadeCounts'] = {};
  const genreCounts: DerivedStats['genreCounts'] = {};
  const directorMap: Record<string, { watched: number; total: number }> = {};
  let mins = 0;

  for (const m of movies) {
    const d = decadeFor(m.year);
    decadeCounts[d] ||= { watched: 0, total: 0 };
    decadeCounts[d].total++;
    genreCounts[m.genre] ||= { watched: 0, total: 0 };
    genreCounts[m.genre].total++;
    directorMap[m.director] ||= { watched: 0, total: 0 };
    directorMap[m.director].total++;

    if (watched.has(m.id)) {
      decadeCounts[d].watched++;
      genreCounts[m.genre].watched++;
      directorMap[m.director].watched++;
      mins += runtimeMinutes(m.runtime);
    }
  }

  const topDirectors = Object.entries(directorMap)
    .filter(([, v]) => v.watched >= 2 && v.total >= 2)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.watched - a.watched || b.total - a.total)
    .slice(0, 8);

  // Taste profile = top decade + top genre (weighted by watched ratio, not raw count).
  let topDecade: number | null = null;
  let topGenre: string | null = null;
  let bestDecadeRatio = 0;
  let bestGenreRatio = 0;
  for (const [d, v] of Object.entries(decadeCounts)) {
    if (v.total >= 30 && v.watched >= 5) {
      const r = v.watched / v.total;
      if (r > bestDecadeRatio) {
        bestDecadeRatio = r;
        topDecade = parseInt(d, 10);
      }
    }
  }
  for (const [g, v] of Object.entries(genreCounts)) {
    if (v.total >= 15 && v.watched >= 3) {
      const r = v.watched / v.total;
      if (r > bestGenreRatio) {
        bestGenreRatio = r;
        topGenre = g;
      }
    }
  }
  const tasteProfile =
    watched.size < 10
      ? 'Tick more films to reveal your taste.'
      : topDecade != null && topGenre
      ? `Your taste favors ${topDecade}s ${topGenre.toLowerCase()}.`
      : topDecade != null
      ? `Your taste leans ${topDecade}s.`
      : topGenre
      ? `Your taste leans ${topGenre.toLowerCase()}.`
      : 'A widely varied palate.';

  const days = mins / 60 / 24;
  const runtimeLabel =
    mins < 60
      ? `${mins} minutes`
      : days < 1
      ? `${Math.round(mins / 60)} hours`
      : days < 2
      ? `${Math.round(mins / 60)} hours · 1 day straight`
      : `${Math.round(mins / 60)} hours · ${Math.round(days)} days straight`;

  return {
    total: movies.length,
    watched: watched.size,
    pct: movies.length ? watched.size / movies.length : 0,
    decadeCounts,
    genreCounts,
    topDirectors,
    runtimeMinutes: mins,
    runtimeLabel,
    tasteProfile,
  };
}
