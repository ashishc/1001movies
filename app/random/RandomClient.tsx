'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Movie } from '@/lib/types';
import { loadWatched, saveWatched, bumpStreak } from '@/lib/storage';
import { genreSlug, GENRE_COPY } from '@/lib/genre-copy';
import { track } from '@/lib/track';

type Props = { movies: Movie[] };

const ALL_DECADES = [2020, 2010, 2000, 1990, 1980, 1970, 1960, 1950, 1940, 1930, 1920, 1910, 1900];
const ALL_GENRES = Object.keys(GENRE_COPY);

export default function RandomClient({ movies }: Props) {
  const [decade, setDecade] = useState<number | 'all'>('all');
  const [genre, setGenre] = useState<string>('all');
  const [onlyUnwatched, setOnlyUnwatched] = useState(true);
  const [watched, setWatched] = useState<Set<string>>(new Set());
  const [pick, setPick] = useState<Movie | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setWatched(loadWatched());
    setHydrated(true);
  }, []);

  const pool = useMemo(() => {
    return movies.filter((m) => {
      if (decade !== 'all' && (m.year < decade || m.year >= decade + 10)) return false;
      if (genre !== 'all' && m.genre !== genre) return false;
      if (onlyUnwatched && watched.has(m.id)) return false;
      return true;
    });
  }, [movies, decade, genre, onlyUnwatched, watched]);

  function spin() {
    if (pool.length === 0) {
      setPick(null);
      return;
    }
    const next = pool[Math.floor(Math.random() * pool.length)];
    setPick(next);
    track('random_spin', { decade: String(decade), genre, onlyUnwatched });
  }

  // Auto-spin once on first load so the page is never blank
  useEffect(() => {
    if (hydrated && !pick && pool.length > 0) spin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  function markWatched() {
    if (!pick) return;
    const next = new Set(watched);
    next.add(pick.id);
    setWatched(next);
    saveWatched(next);
    bumpStreak();
    track('random_mark_watched', { movieId: pick.id });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6 sm:pt-10">
      <header className="mb-8">
        <p className="font-display text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
          Random pick
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold leading-tight sm:text-4xl">
          Spin the projector.
        </h1>
        <p className="mt-2 max-w-xl text-[var(--muted)]">
          Stuck choosing? Hit the button — get one randomly-picked film from the canon.
          Filter by decade or genre, skip ones you've seen.
        </p>
      </header>

      {/* Filters */}
      <section className="mb-6 space-y-3">
        <div className="no-scrollbar -mx-1 flex flex-wrap gap-2 px-1">
          <button
            onClick={() => setDecade('all')}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              decade === 'all' ? 'border-accent bg-accent text-white' : 'border-[var(--line)] hover:border-accent/60'
            }`}
          >
            Any decade
          </button>
          {ALL_DECADES.map((d) => (
            <button
              key={d}
              onClick={() => setDecade(d)}
              className={`rounded-full border px-3 py-1 text-xs font-medium tabular-nums transition ${
                decade === d ? 'border-accent bg-accent text-white' : 'border-[var(--line)] hover:border-accent/60'
              }`}
            >
              {d}s
            </button>
          ))}
        </div>
        <div className="no-scrollbar -mx-1 flex flex-wrap gap-2 px-1">
          <button
            onClick={() => setGenre('all')}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              genre === 'all' ? 'border-ink bg-ink text-paper dark:border-paper dark:bg-paper dark:text-ink' : 'border-[var(--line)] hover:border-[var(--fg)]/60'
            }`}
          >
            Any genre
          </button>
          {ALL_GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                genre === g ? 'border-ink bg-ink text-paper dark:border-paper dark:bg-paper dark:text-ink' : 'border-[var(--line)] hover:border-[var(--fg)]/60'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <input
            type="checkbox"
            checked={onlyUnwatched}
            onChange={(e) => setOnlyUnwatched(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-[var(--line)] accent-[var(--accent)]"
          />
          Only films I haven't watched ({pool.length} available)
        </label>
      </section>

      {/* The pick */}
      {pick ? (
        <section className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-5 sm:p-6">
          <div className="grid gap-6 sm:grid-cols-[180px_1fr]">
            <Link
              href={`/movie/${pick.id}`}
              className="block aspect-[2/3] w-full max-w-[180px] overflow-hidden rounded-lg bg-[var(--line)] transition hover:opacity-90"
            >
              {pick.poster && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pick.poster} alt="" className="h-full w-full object-cover" />
              )}
            </Link>
            <div>
              <p className="font-display text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
                Tonight, you watch
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold leading-tight sm:text-3xl">
                <Link href={`/movie/${pick.id}`} className="hover:text-accent">
                  {pick.title}
                </Link>{' '}
                <span className="font-normal text-[var(--muted)]">({pick.year})</span>
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {pick.director} · {pick.runtime || 'runtime n/a'} ·{' '}
                <Link href={`/genre/${genreSlug(pick.genre)}`} className="underline hover:text-accent">
                  {pick.genre}
                </Link>
              </p>
              {pick.description && (
                <p className="mt-3 text-sm leading-relaxed">{pick.description}</p>
              )}
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  onClick={spin}
                  className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                >
                  🎲 Spin again
                </button>
                {!watched.has(pick.id) && (
                  <button
                    onClick={markWatched}
                    className="rounded-lg border border-[var(--line)] px-4 py-2.5 text-sm font-semibold transition hover:border-accent/60"
                  >
                    Mark watched
                  </button>
                )}
                <Link
                  href={`/movie/${pick.id}`}
                  className="rounded-lg border border-[var(--line)] px-4 py-2.5 text-sm font-semibold transition hover:border-accent/60"
                >
                  Where to stream →
                </Link>
              </div>
              {watched.has(pick.id) && (
                <p className="mt-3 text-xs text-accent">✓ You've already watched this one.</p>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-lg border border-dashed border-[var(--line)] p-10 text-center">
          <p className="font-display text-lg font-semibold">No films match these filters.</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Loosen the filters or untick "Only films I haven't watched."
          </p>
        </section>
      )}

      {/* Cross-links for SEO depth */}
      <section className="mt-12 border-t border-[var(--line)] pt-8 text-sm text-[var(--muted)]">
        <p className="mb-2 font-display text-[11px] uppercase tracking-[0.2em]">More to explore</p>
        <p>
          Or browse the canon{' '}
          <Link href="/" className="underline hover:text-accent">in full</Link>, by{' '}
          <Link href="/decade/2020s" className="underline hover:text-accent">decade</Link>, by{' '}
          <Link href="/genre/horror" className="underline hover:text-accent">genre</Link>, or check{' '}
          <Link href="/stats" className="underline hover:text-accent">your stats</Link>.
        </p>
      </section>
    </div>
  );
}
