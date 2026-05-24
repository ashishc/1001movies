'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Movie } from '@/lib/types';
import {
  loadWatched,
  saveWatched,
  isOnboarded,
  markOnboarded,
  applyEndowedProgress,
  findNewlyCrossedMilestone,
  recordCelebratedMilestone,
  bumpStreak,
  loadFilters,
  saveFilters,
} from '@/lib/storage';
import { estimatePercentile } from '@/lib/constants';
import { ProgressRing } from './ProgressRing';
import { MovieCard } from './MovieCard';
import { Onboarding } from './Onboarding';
import { UpNext } from './UpNext';
import { Confetti } from './Confetti';
import { MilestoneModal } from './MilestoneModal';
import { ShareModal } from './ShareModal';

type Props = { movies: Movie[] };

// Newest first to match the grid's newest-first sort.
const ALL_DECADES = [2020, 2010, 2000, 1990, 1980, 1970, 1960, 1950, 1940, 1930, 1920, 1910, 1900];

export default function Tracker({ movies }: Props) {
  const [watched, setWatched] = useState<Set<string>>(() => new Set());
  const [hydrated, setHydrated] = useState(false);
  const [decade, setDecade] = useState<number | 'all'>('all');
  const [genre, setGenre] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [hideWatched, setHideWatched] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [milestone, setMilestone] = useState<number | null>(null);
  const [showShare, setShowShare] = useState(false);
  const prevWatchedSize = useRef(0);

  // First-load: pull progress from localStorage, or pre-tick endowed classics on first visit.
  // If URL has ?vs=…, hand off to /compare so the user lands directly in the friend-compare flow.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('vs')) {
        window.location.replace(`/compare${url.search}`);
        return;
      }
    }
    const stored = loadWatched();
    if (stored.size === 0 && !isOnboarded()) {
      const seeded = applyEndowedProgress(movies);
      setWatched(seeded);
      saveWatched(seeded);
      setShowOnboarding(true);
    } else {
      setWatched(stored);
    }
    prevWatchedSize.current = stored.size;

    // Restore last-picked filters so returning users land where they left off.
    const f = loadFilters();
    if (f) {
      setDecade(f.decade);
      setGenre(f.genre);
      setHideWatched(f.hideWatched);
    }

    setHydrated(true);
  }, [movies]);

  // Persist filter choices on every change (only after hydration to avoid stomping
  // saved values with the initial defaults).
  useEffect(() => {
    if (!hydrated) return;
    saveFilters({ decade, genre, hideWatched });
  }, [decade, genre, hideWatched, hydrated]);

  // Persist + check for milestone crossings whenever the watched set changes.
  useEffect(() => {
    if (!hydrated) return;
    saveWatched(watched);
    const crossed = findNewlyCrossedMilestone(prevWatchedSize.current, watched.size);
    if (crossed != null) {
      recordCelebratedMilestone(crossed);
      setMilestone(crossed);
    }
    prevWatchedSize.current = watched.size;
  }, [watched, hydrated]);

  const genres = useMemo(() => {
    const s = new Set<string>();
    movies.forEach((m) => s.add(m.genre));
    return ['all', ...[...s].sort()];
  }, [movies]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return movies
      .filter((m) => {
        if (decade !== 'all' && (m.year < decade || m.year >= decade + 10)) return false;
        if (genre !== 'all' && m.genre !== genre) return false;
        if (hideWatched && watched.has(m.id)) return false;
        if (q && !`${m.title} ${m.director}`.toLowerCase().includes(q)) return false;
        return true;
      })
      // Newest first — recent films feel current and recognisable on landing.
      // Within the same year, fall back to title for stable ordering.
      .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
  }, [movies, decade, genre, query, hideWatched, watched]);

  const totalWatched = watched.size;
  const totalMovies = movies.length;
  const pct = totalMovies > 0 ? totalWatched / totalMovies : 0;

  function toggle(id: string) {
    setWatched((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        bumpStreak();
      }
      return next;
    });
  }

  function reset() {
    if (!confirm('Reset your progress? This clears all watched marks on this device.')) return;
    setWatched(new Set());
    prevWatchedSize.current = 0;
  }

  function closeOnboarding() {
    markOnboarded();
    setShowOnboarding(false);
  }

  function openShare() {
    setMilestone(null);
    setShowShare(true);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:pt-10">
      <Onboarding open={showOnboarding} preTickedCount={watched.size} onClose={closeOnboarding} />
      <Confetti active={milestone != null} />
      <MilestoneModal
        threshold={milestone}
        totalWatched={totalWatched}
        total={totalMovies}
        onClose={() => setMilestone(null)}
        onShare={openShare}
      />
      <ShareModal
        open={showShare}
        onClose={() => setShowShare(false)}
        watched={watched}
        movies={movies}
      />

      {/* Header */}
      <header className="mb-6 flex flex-col items-start gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
            A free tracker
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold leading-tight sm:text-5xl">
            1001 Movies <span className="text-accent">·</span> Tracker
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--muted)] sm:text-base">
            The cinephile canon — the most-loved films of every decade, ranked by Letterboxd.
            Tap a poster to mark it watched. Progress saves on this device.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ProgressRing value={pct} size={92} />
          <div className="text-sm">
            <div className="font-display text-2xl font-semibold tabular-nums">
              {totalWatched.toLocaleString()}{' '}
              <span className="text-[var(--muted)]">/ {totalMovies.toLocaleString()}</span>
            </div>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Ahead of {estimatePercentile(totalWatched)} of trackers
            </p>
            <div className="mt-2 flex gap-2 text-xs">
              <button
                onClick={() => setShowShare(true)}
                className="rounded-full border border-[var(--line)] px-3 py-1 hover:border-accent/60 hover:text-accent"
              >
                Share
              </button>
              <a
                href="/stats"
                className="rounded-full border border-[var(--line)] px-3 py-1 hover:border-accent/60 hover:text-accent"
              >
                Stats
              </a>
              <button
                onClick={reset}
                className="rounded-full border border-[var(--line)] px-3 py-1 hover:border-red-500/60 hover:text-red-500"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Up next */}
      {hydrated && totalWatched < totalMovies && (
        <UpNext movies={movies} watched={watched} onToggle={toggle} />
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:gap-4">
        <input
          type="search"
          placeholder="Search title or director…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-[var(--line)] bg-transparent px-4 py-2.5 text-sm placeholder:text-[var(--muted)] focus:border-accent/60 focus:outline-none"
        />
        <div className="no-scrollbar scroll-fade -mx-1 flex gap-2 overflow-x-auto px-1 sm:flex-wrap">
          <button
            onClick={() => setDecade('all')}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition ${
              decade === 'all'
                ? 'border-accent bg-accent text-white'
                : 'border-[var(--line)] hover:border-accent/60'
            }`}
          >
            All decades
          </button>
          {ALL_DECADES.map((d) => (
            <button
              key={d}
              onClick={() => setDecade(d)}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium tabular-nums transition ${
                decade === d
                  ? 'border-accent bg-accent text-white'
                  : 'border-[var(--line)] hover:border-accent/60'
              }`}
            >
              {d}s
            </button>
          ))}
        </div>
        <div className="no-scrollbar -mx-1 flex flex-wrap items-center gap-2 px-1">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition ${
                genre === g
                  ? 'border-ink bg-ink text-paper dark:border-paper dark:bg-paper dark:text-ink'
                  : 'border-[var(--line)] hover:border-[var(--fg)]/60'
              }`}
            >
              {g === 'all' ? 'All genres' : g}
            </button>
          ))}
          <label className="ml-auto flex items-center gap-2 text-xs text-[var(--muted)]">
            <input
              type="checkbox"
              checked={hideWatched}
              onChange={(e) => setHideWatched(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-[var(--line)] accent-[var(--accent)]"
            />
            Hide watched
          </label>
        </div>
      </div>

      {/* Result counter */}
      <div className="mb-4 text-xs text-[var(--muted)]">
        Showing {filtered.length.toLocaleString()} of {totalMovies.toLocaleString()} films
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--line)] p-10 text-center text-sm text-[var(--muted)]">
          No films match these filters.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((m) => (
            <MovieCard key={m.id} movie={m} watched={watched.has(m.id)} onToggle={toggle} />
          ))}
        </div>
      )}
    </div>
  );
}
