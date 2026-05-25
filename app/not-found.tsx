import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '404 — Lost reel',
  description: 'This page doesn\'t exist. Try the tracker, your stats, or browse by decade.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="font-display text-[11px] uppercase tracking-[0.25em] text-accent">
        404 · Lost reel
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">
        We couldn't find that page.
      </h1>
      <p className="mt-4 max-w-md text-[var(--muted)]">
        Maybe the link is wrong, maybe a film was removed from the canon, maybe the projector
        bulb just blew. Try one of these instead:
      </p>

      <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
        <Link
          href="/"
          className="rounded-lg border border-[var(--line)] p-4 text-left transition hover:border-accent/60"
        >
          <p className="font-display text-base font-semibold">Tracker →</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            All 1,122 films. Tap to mark watched.
          </p>
        </Link>
        <Link
          href="/stats"
          className="rounded-lg border border-[var(--line)] p-4 text-left transition hover:border-accent/60"
        >
          <p className="font-display text-base font-semibold">Your stats →</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Decade heatmap, taste profile, percentile.
          </p>
        </Link>
        <Link
          href="/decade/2020s"
          className="rounded-lg border border-[var(--line)] p-4 text-left transition hover:border-accent/60"
        >
          <p className="font-display text-base font-semibold">2020s →</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            The most recent fifty films in the canon.
          </p>
        </Link>
        <Link
          href="/genre/horror"
          className="rounded-lg border border-[var(--line)] p-4 text-left transition hover:border-accent/60"
        >
          <p className="font-display text-base font-semibold">Horror →</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            The genre cinephiles defend.
          </p>
        </Link>
      </div>

      <p className="mt-10 text-xs text-[var(--muted)]">
        Lost? <Link href="/" className="underline hover:text-accent">Back to the tracker</Link> ·{' '}
        Found a broken link? <a href="mailto:hi@1001movies.app" className="underline hover:text-accent">tell us</a>.
      </p>
    </div>
  );
}
