'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Movie } from '@/lib/types';
import { computeStats } from '@/lib/stats';
import { estimatePercentile } from '@/lib/constants';
import { loadWatched, getStreak, getYearlyGoal, setYearlyGoal } from '@/lib/storage';
import { ProgressRing } from '@/components/ProgressRing';
import { ShareModal } from '@/components/ShareModal';

type Props = { movies: Movie[] };

export default function StatsClient({ movies }: Props) {
  const [watched, setWatched] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState(0);
  const [goal, setGoal] = useState(26);
  const [showShare, setShowShare] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setWatched(loadWatched());
    setStreak(getStreak());
    setGoal(getYearlyGoal());
    setHydrated(true);
  }, []);

  const stats = useMemo(() => computeStats(movies, watched), [movies, watched]);

  // This-year count by year of … hmm we don't store dates per-tick. So we approximate
  // "year goal" against total watched. Honest but conservative; a real diary feature comes later.
  const thisYear = stats.watched;
  const goalPct = Math.min(1, thisYear / goal);

  function updateGoal(n: number) {
    if (!Number.isFinite(n) || n < 1) return;
    setGoal(n);
    setYearlyGoal(n);
  }

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-sm text-[var(--muted)]">
        Loading your stats…
      </div>
    );
  }

  if (watched.size === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-semibold">No stats yet.</h1>
        <p className="mt-2 text-[var(--muted)]">Tick a few films to start your profile.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90"
        >
          Go to the tracker
        </Link>
      </div>
    );
  }

  const decadeRows = Object.keys(stats.decadeCounts)
    .map(Number)
    .sort((a, b) => a - b);
  const genreRows = Object.entries(stats.genreCounts)
    .filter(([, v]) => v.total > 0)
    .sort((a, b) => b[1].watched - a[1].watched);

  const percentile = estimatePercentile(stats.watched);

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-6 sm:pt-10">
      <ShareModal open={showShare} onClose={() => setShowShare(false)} watched={watched} movies={movies} />

      {/* Hero */}
      <header className="mb-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
            Your stats
          </p>
          <h1 className="mt-1 font-display text-4xl font-bold leading-tight sm:text-5xl">
            <span className="tabular-nums">{stats.watched}</span>
            <span className="text-[var(--muted)]"> / {stats.total}</span>
          </h1>
          <p className="mt-3 max-w-xl text-base">
            <span className="font-semibold">{(stats.pct * 100).toFixed(1)}% of the canon.</span>{' '}
            <span className="text-[var(--muted)]">Ahead of {percentile} of trackers.</span>
          </p>
          <p className="mt-2 text-sm italic text-[var(--muted)]">{stats.tasteProfile}</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <ProgressRing value={stats.pct} size={120} stroke={10} />
          <button
            onClick={() => setShowShare(true)}
            className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
          >
            Share my stats
          </button>
        </div>
      </header>

      {/* Decade heatmap */}
      <section className="mb-10">
        <h2 className="mb-4 font-display text-xl font-semibold">By decade</h2>
        <div className="space-y-2">
          {decadeRows.map((d) => {
            const v = stats.decadeCounts[d];
            const pct = v.watched / Math.max(1, v.total);
            return (
              <Link
                key={d}
                href={`/decade/${d}s`}
                className="group block rounded-lg border border-[var(--line)] p-3 transition hover:border-accent/60"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-display font-semibold">{d}s</span>
                  <span className="tabular-nums text-[var(--muted)]">
                    {v.watched} / {v.total}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--line)]">
                  <div
                    className="h-full bg-accent transition-all group-hover:bg-accent"
                    style={{ width: `${pct * 100}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Genres */}
      <section className="mb-10">
        <h2 className="mb-4 font-display text-xl font-semibold">By genre</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {genreRows.map(([g, v]) => {
            const pct = v.watched / Math.max(1, v.total);
            return (
              <Link
                key={g}
                href={`/genre/${g.toLowerCase().replace(/\s+/g, '-')}`}
                className="group flex items-center gap-3 rounded-lg border border-[var(--line)] p-3 transition hover:border-accent/60"
              >
                <span className="flex-1 truncate text-sm font-medium">{g}</span>
                <div className="h-2 w-24 overflow-hidden rounded-full bg-[var(--line)]">
                  <div className="h-full bg-accent" style={{ width: `${pct * 100}%` }} />
                </div>
                <span className="tabular-nums text-xs text-[var(--muted)]">
                  {v.watched}/{v.total}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Top directors */}
      {stats.topDirectors.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 font-display text-xl font-semibold">Top directors covered</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {stats.topDirectors.map((d) => (
              <div
                key={d.name}
                className="flex items-center justify-between rounded-lg border border-[var(--line)] p-3 text-sm"
              >
                <span className="font-medium">{d.name}</span>
                <span className="tabular-nums text-[var(--muted)]">
                  {d.watched} / {d.total}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Runtime */}
      <section className="mb-10 rounded-xl border border-[var(--line)] bg-black/[0.02] p-5 dark:bg-white/[0.03]">
        <h2 className="font-display text-xl font-semibold">Time spent in front of the canon</h2>
        <p className="mt-1 font-display text-3xl font-bold tabular-nums">{stats.runtimeLabel}</p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Sum of running times of every film you've ticked.
        </p>
      </section>

      {/* Streak + goal */}
      <section className="mb-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--line)] p-5">
          <p className="font-display text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
            Weekly streak
          </p>
          <p className="mt-2 font-display text-3xl font-bold">{streak} weeks</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {streak > 0
              ? 'Tick at least one film per week to keep it alive.'
              : 'Tick a film this week to start a streak.'}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--line)] p-5">
          <p className="font-display text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
            Year goal
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold tabular-nums">{thisYear}</span>
            <span className="text-[var(--muted)]">/</span>
            <input
              type="number"
              min={1}
              value={goal}
              onChange={(e) => updateGoal(parseInt(e.target.value, 10))}
              className="w-20 rounded border border-[var(--line)] bg-transparent px-2 py-1 font-display text-2xl font-semibold tabular-nums focus:border-accent/60 focus:outline-none"
            />
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--line)]">
            <div className="h-full bg-accent" style={{ width: `${goalPct * 100}%` }} />
          </div>
          <p className="mt-1 text-xs text-[var(--muted)]">Edit the number to set your goal.</p>
        </div>
      </section>

      {/* Email opt-in (soft) */}
      <section className="mb-10 rounded-xl border border-dashed border-[var(--line)] p-5">
        <p className="font-display text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
          Quarterly recap (optional)
        </p>
        <p className="mt-1 text-sm">
          Want a beautifully designed email of your stats every 3 months? Drop your address. No spam, easy unsubscribe.
        </p>
        <form
          className="mt-3 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const email = String(fd.get('email') || '').trim();
            if (!email) return;
            // Replace with a real endpoint when you set one up. For now we store locally so we don't lose signups.
            try {
              const list = JSON.parse(localStorage.getItem('1001m:emails:v1') || '[]');
              list.push({ email, ts: Date.now() });
              localStorage.setItem('1001m:emails:v1', JSON.stringify(list));
            } catch {}
            (e.currentTarget as HTMLFormElement).reset();
            alert('Saved on this device. (Server endpoint not yet wired — see /about.)');
          }}
        >
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="flex-1 rounded-lg border border-[var(--line)] bg-transparent px-3 py-2 text-sm focus:border-accent/60 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-[var(--fg)] px-4 py-2 text-sm font-semibold text-[var(--bg)] hover:opacity-90"
          >
            Recap me
          </button>
        </form>
      </section>

      <p className="text-center text-xs text-[var(--muted)]">
        <Link href="/" className="underline hover:text-accent">← Back to the tracker</Link>
      </p>
    </div>
  );
}
