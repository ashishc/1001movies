// Tiny localStorage helpers. Keeps progress + ancillary metadata local-first, no DB.
import type { Movie } from './types';
import { ENDOWED_TITLES, MILESTONES } from './constants';

const KEY_WATCHED = '1001m:watched:v1';
const KEY_ONBOARDED = '1001m:onboarded:v1';
const KEY_MILESTONES = '1001m:milestones:v1';
const KEY_LAST_TICK = '1001m:last-tick:v1'; // ISO date strings of week-Mondays
const KEY_GOAL = '1001m:goal:v1'; // yearly goal count
const KEY_FILTERS = '1001m:filters:v1'; // last-picked decade/genre/hide-watched

export type SavedFilters = {
  decade: number | 'all';
  genre: string;
  hideWatched: boolean;
};

export function loadFilters(): SavedFilters | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY_FILTERS);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Be defensive — anything written by an older version of the app might be malformed.
    const decade = parsed.decade === 'all' || typeof parsed.decade === 'number' ? parsed.decade : 'all';
    const genre = typeof parsed.genre === 'string' ? parsed.genre : 'all';
    const hideWatched = typeof parsed.hideWatched === 'boolean' ? parsed.hideWatched : false;
    return { decade, genre, hideWatched };
  } catch {
    return null;
  }
}

export function saveFilters(f: SavedFilters) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY_FILTERS, JSON.stringify(f));
  } catch {
    /* quota exceeded — ignore */
  }
}

export function loadWatched(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(KEY_WATCHED);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

export function saveWatched(watched: Set<string>) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY_WATCHED, JSON.stringify([...watched]));
  } catch {
    /* quota exceeded — silently ignore */
  }
}

export function isOnboarded(): boolean {
  if (typeof window === 'undefined') return true;
  return window.localStorage.getItem(KEY_ONBOARDED) === '1';
}

export function markOnboarded() {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY_ONBOARDED, '1');
}

export function getCelebratedMilestones(): Set<number> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(KEY_MILESTONES);
    if (!raw) return new Set();
    return new Set((JSON.parse(raw) as number[]).filter(Number.isFinite));
  } catch {
    return new Set();
  }
}

export function recordCelebratedMilestone(threshold: number) {
  if (typeof window === 'undefined') return;
  const set = getCelebratedMilestones();
  set.add(threshold);
  window.localStorage.setItem(KEY_MILESTONES, JSON.stringify([...set]));
}

/** Returns the most recently *crossed* milestone since last call, or null. */
export function findNewlyCrossedMilestone(prevCount: number, newCount: number): number | null {
  if (newCount <= prevCount) return null;
  for (const m of MILESTONES) {
    if (prevCount < m && newCount >= m) {
      const celebrated = getCelebratedMilestones();
      if (!celebrated.has(m)) return m;
    }
  }
  return null;
}

/** Returns the Monday of the given week as YYYY-MM-DD. */
function weekMonday(d = new Date()): string {
  const day = d.getUTCDay(); // 0 = Sun, 1 = Mon
  const diff = (day + 6) % 7; // days since Monday
  const monday = new Date(d.getTime() - diff * 86400000);
  return monday.toISOString().slice(0, 10);
}

/** Stamps "this week" as logged. Returns weeks streak count. */
export function bumpStreak(): number {
  if (typeof window === 'undefined') return 0;
  const today = weekMonday();
  let weeks: string[] = [];
  try {
    weeks = JSON.parse(window.localStorage.getItem(KEY_LAST_TICK) || '[]');
  } catch {}
  if (!Array.isArray(weeks)) weeks = [];
  if (weeks[weeks.length - 1] !== today) {
    weeks.push(today);
    if (weeks.length > 200) weeks = weeks.slice(-200);
    window.localStorage.setItem(KEY_LAST_TICK, JSON.stringify(weeks));
  }
  return computeStreakFrom(weeks);
}

export function getStreak(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const weeks: string[] = JSON.parse(window.localStorage.getItem(KEY_LAST_TICK) || '[]');
    return computeStreakFrom(weeks);
  } catch {
    return 0;
  }
}

function computeStreakFrom(weeks: string[]): number {
  if (!weeks.length) return 0;
  // Count consecutive weeks ending at the most recent recorded week.
  const mondayMs = (s: string) => Date.parse(s + 'T00:00:00Z');
  const sorted = [...new Set(weeks)].sort();
  let streak = 1;
  for (let i = sorted.length - 1; i > 0; i--) {
    const diff = mondayMs(sorted[i]) - mondayMs(sorted[i - 1]);
    if (diff === 7 * 86400000) streak++;
    else break;
  }
  // If the latest recorded week is older than last week, streak is broken.
  const latestMs = mondayMs(sorted[sorted.length - 1]);
  const lastWeekMs = mondayMs(weekMonday(new Date(Date.now() - 7 * 86400000)));
  if (latestMs < lastWeekMs) return 0;
  return streak;
}

export function getYearlyGoal(): number {
  if (typeof window === 'undefined') return 26;
  const v = parseInt(window.localStorage.getItem(KEY_GOAL) || '', 10);
  return Number.isFinite(v) && v > 0 ? v : 26;
}

export function setYearlyGoal(n: number) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY_GOAL, String(Math.max(1, Math.floor(n))));
}

/** Pre-tick the universal classics on a fresh tracker. */
export function applyEndowedProgress(movies: Movie[]): Set<string> {
  const watched = new Set<string>();
  for (const seed of ENDOWED_TITLES) {
    const m = movies.find(
      (x) =>
        x.year === seed.year &&
        x.title.toLowerCase().startsWith(seed.titleStartsWith.toLowerCase()),
    );
    if (m) watched.add(m.id);
  }
  return watched;
}
