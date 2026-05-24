import Link from 'next/link';
import type { ReactNode } from 'react';

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <header className="border-b border-[var(--line)]/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 text-sm">
          <Link href="/" className="font-display font-bold tracking-tight">
            1001 Movies
          </Link>
          <nav className="flex items-center gap-4 text-[13px] text-[var(--muted)]">
            <Link href="/stats" className="hover:text-accent">Stats</Link>
            <Link href="/compare" className="hover:text-accent">Compare</Link>
            <Link href="/decade/1970s" className="hidden hover:text-accent sm:inline">By decade</Link>
            <Link href="/genre/horror" className="hidden hover:text-accent sm:inline">By genre</Link>
            <Link href="/about" className="hover:text-accent">About</Link>
          </nav>
        </div>
      </header>
      <main id="main">{children}</main>
      <footer className="border-t border-[var(--line)]/70">
        <div className="mx-auto max-w-6xl px-4 py-8 text-xs text-[var(--muted)]">
          <p>
            <strong className="text-[var(--fg)]">1001 Movies Tracker</strong> · A free, no-signup
            tracker for the canonical film list. Independent fan project, not affiliated with the
            book.
          </p>
          <p className="mt-2">
            <Link href="/" className="hover:text-accent">Tracker</Link> ·{' '}
            <Link href="/stats" className="hover:text-accent">Stats</Link> ·{' '}
            <Link href="/compare" className="hover:text-accent">Compare</Link> ·{' '}
            <Link href="/about" className="hover:text-accent">About / Privacy</Link>
          </p>
        </div>
      </footer>
    </>
  );
}
