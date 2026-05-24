'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Movie } from '@/lib/types';
import { loadWatched, saveWatched, bumpStreak } from '@/lib/storage';
import { ProgressRing } from './ProgressRing';
import { MovieCard } from './MovieCard';

type Props = {
  films: Movie[];
  scopeLabel: string; // e.g. "1970s", "Horror"
};

export default function ScopedTracker({ films, scopeLabel }: Props) {
  const [watched, setWatched] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setWatched(loadWatched());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveWatched(watched);
  }, [watched, hydrated]);

  // Newest first within scope — mirror the home tracker's order.
  const sorted = useMemo(
    () => [...films].sort((a, b) => b.year - a.year || a.title.localeCompare(b.title)),
    [films],
  );

  const watchedHere = useMemo(() => {
    let n = 0;
    sorted.forEach((f) => {
      if (watched.has(f.id)) n++;
    });
    return n;
  }, [sorted, watched]);

  const pct = sorted.length ? watchedHere / sorted.length : 0;

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

  return (
    <>
      <header className="mb-6 flex items-center gap-4">
        <ProgressRing value={pct} size={80} />
        <div>
          <p className="font-display text-2xl font-semibold tabular-nums">
            {watchedHere} <span className="text-[var(--muted)]">/ {films.length}</span>
          </p>
          <p className="text-xs text-[var(--muted)]">
            Films from {scopeLabel} you've ticked.{' '}
            <Link href="/" className="underline hover:text-accent">
              See full canon
            </Link>{' '}
            ·{' '}
            <Link href="/stats" className="underline hover:text-accent">
              All stats
            </Link>
          </p>
        </div>
      </header>

      {sorted.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--line)] p-10 text-center text-sm text-[var(--muted)]">
          No films match this view.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
          {sorted.map((m) => (
            <MovieCard key={m.id} movie={m} watched={watched.has(m.id)} onToggle={toggle} />
          ))}
        </div>
      )}
    </>
  );
}
