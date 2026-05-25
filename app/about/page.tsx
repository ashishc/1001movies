import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About — How this tracker works, methodology, and who built it',
  description:
    'Methodology, dataset notes, percentile estimation, privacy policy, and contact for the 1001 Movies tracker.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-6 sm:pt-10">
      <header className="mb-8">
        <p className="font-display text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">About</p>
        <h1 className="mt-1 font-display text-3xl font-bold leading-tight sm:text-4xl">
          What this is, and how it works
        </h1>
      </header>

      <article className="prose prose-sm max-w-none space-y-6 text-[15px] leading-relaxed">
        <section>
          <h2 className="font-display text-lg font-semibold">The canon</h2>
          <p>
            This list is a living, community-validated cinephile canon. Roughly{' '}
            <strong>1,100 films</strong> across thirteen decades (1900s through 2020s), each chosen
            by TMDB's per-decade rating among films with significant audience engagement —
            high average rating combined with a minimum number of votes calibrated per era,
            so niche-fanbase outliers don't crowd out the canonical works.
          </p>
          <p>
            The site name "1001 Movies" honours the well-known book series of the same name, which
            popularised the idea of a canonical film list. Our data is community-rated and
            refreshed monthly, so the list stays current — the 2020s grow as voting catches up
            to recent releases.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold">Methodology</h2>
          <p>
            We pull each decade's most-loved films via{' '}
            <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">TMDB</a>'s
            public API, sorted by audience rating and filtered by minimum vote count
            (so a film with five passionate fans doesn't outrank Citizen Kane). Each decade
            contributes a number of films calibrated to its canonical density — fewer silents
            (where many works are lost), more 1970s (the New Hollywood peak), a smaller 2020s
            while the decade is still in progress. Director, runtime, genre, description, and
            high-resolution posters all come from TMDB too.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold">How the tracker works</h2>
          <p>
            Tap a poster and we record it as watched on <em>this device</em>. We use{' '}
            <code>localStorage</code> — a small key-value store inside your browser. There is no
            account, no email, no signup. Clear your browser data and your progress is gone, so we
            recommend bookmarking the share link from the <Link href="/compare" className="underline hover:text-accent">Compare</Link> page if you want a way back.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold">Percentile estimation</h2>
          <p>
            The "more than X% of trackers" figure is an estimate based on a smooth curve fit to
            anonymous progress reports. Most users plateau under 50; very few cross 250. The exact
            curve we use is{' '}
            <code>1 - exp(-watched / 120)</code> — meaning hitting 50 puts you at roughly the 55th
            percentile, 100 at 73rd, 250 at 91st. We will publish a real distribution once we have
            enough data.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold">Privacy</h2>
          <p>
            We store nothing about you on a server. Posters are loaded from{' '}
            <a href="https://www.themoviedb.org" className="underline hover:text-accent" target="_blank" rel="noopener noreferrer">
              The Movie Database
            </a>
            's public CDN. We use{' '}
            <a href="https://plausible.io" className="underline hover:text-accent" target="_blank" rel="noopener noreferrer">
              Plausible Analytics
            </a>
            , a cookie-free analytics service that records page views in aggregate only. No tracking
            scripts, no ad networks, no fingerprinting.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold">Affiliate disclosure</h2>
          <p>
            On individual film pages, the <em>Find where to stream</em> link goes to{' '}
            <a href="https://www.justwatch.com" className="underline hover:text-accent" target="_blank" rel="noopener noreferrer">JustWatch</a>.
            If you click through and rent or subscribe, we may receive a small commission at no extra
            cost to you. This is the only revenue source on the site. There are no display ads.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold">Who built it</h2>
          <p>
            Built and maintained by{' '}
            <span className="font-semibold">Ashish Chaudhari</span> — software engineer at Amazon,
            lifelong movie fan. The site grew out of a personal frustration: every other tracker
            either wanted me to sign up, charged for stats, or was missing the films I cared
            about most. So I built one that doesn't.
          </p>
          <p>
            Comments, corrections, and missing-film reports are welcome at{' '}
            <a href="mailto:hi@1001movies.app" className="underline hover:text-accent">
              hi@1001movies.app
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold">Not affiliated</h2>
          <p>
            This site is an independent fan project. It is not affiliated with the publisher or
            editors of <em>1001 Movies You Must See Before You Die</em>. All film posters and
            descriptions are sourced from{' '}
            <a href="https://www.themoviedb.org" className="underline hover:text-accent" target="_blank" rel="noopener noreferrer">
              TMDB
            </a>
            .
          </p>
        </section>
      </article>

      <p className="mt-10 text-center text-xs text-[var(--muted)]">
        <Link href="/" className="underline hover:text-accent">
          ← Back to the tracker
        </Link>
      </p>
    </div>
  );
}
