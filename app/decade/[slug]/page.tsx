import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import movies from '../../data/movies.json';
import type { Movie } from '@/lib/types';
import ScopedTracker from '@/components/ScopedTracker';
import { DECADE_COPY } from '@/lib/decade-copy';

const ALL_DECADES = ['1900s', '1910s', '1920s', '1930s', '1940s', '1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];

export function generateStaticParams() {
  return ALL_DECADES.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const slug = params.slug;
  if (!ALL_DECADES.includes(slug)) return {};
  const copy = DECADE_COPY[slug];
  const decade = parseInt(slug, 10);
  const list = (movies as unknown as Movie[]).filter((m) => m.year >= decade && m.year < decade + 10);
  const title = `Best ${slug} Movies — The 1001 Canon`;
  const description = `${list.length} essential ${slug} films from "1001 Movies You Must See Before You Die." ${copy?.intro?.slice(0, 120) || ''}`;
  return {
    title,
    description,
    alternates: { canonical: `/decade/${slug}` },
    openGraph: { title, description, url: `https://1001movies.app/decade/${slug}` },
  };
}

export default function DecadePage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  if (!ALL_DECADES.includes(slug)) return notFound();
  const copy = DECADE_COPY[slug];
  const decade = parseInt(slug, 10);
  const films = (movies as unknown as Movie[]).filter((m) => m.year >= decade && m.year < decade + 10);

  const idx = ALL_DECADES.indexOf(slug);
  const prev = idx > 0 ? ALL_DECADES[idx - 1] : null;
  const next = idx < ALL_DECADES.length - 1 ? ALL_DECADES[idx + 1] : null;

  // Auto-derived "decade in numbers" — gives the page substance for SEO + readers.
  const top3 = [...films].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 3);
  const directorCounts: Record<string, number> = {};
  films.forEach((f) => { if (f.director) directorCounts[f.director] = (directorCounts[f.director] || 0) + 1; });
  const topDirectors = Object.entries(directorCounts)
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const genreCounts: Record<string, number> = {};
  films.forEach((f) => { genreCounts[f.genre] = (genreCounts[f.genre] || 0) + 1; });
  const topGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best ${slug} Movies — 1001 Canon`,
    description: copy?.intro,
    numberOfItems: films.length,
    itemListElement: films.slice(0, 50).map((m, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Movie',
        name: m.title,
        director: { '@type': 'Person', name: m.director },
        datePublished: String(m.year),
        genre: m.genre,
      },
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:pt-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <header className="mb-8 max-w-3xl">
        <p className="font-display text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
          Best of the {slug} · 1001 canon
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold leading-tight sm:text-5xl">
          {copy?.headline || `The ${slug}`}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">{copy?.intro}</p>
        <p className="mt-3 text-sm">
          <span className="font-semibold">{films.length} films</span> from this decade are in the canon.
          Tick what you've seen — your progress saves on this device.
        </p>
      </header>

      <ScopedTracker films={films} scopeLabel={`the ${slug}`} />

      {/* Decade in numbers — auto-derived from the data */}
      <section className="mt-12 border-t border-[var(--line)] pt-8">
        <h2 className="mb-5 font-display text-xl font-semibold">The {slug} in numbers</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <p className="font-display text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
              Highest-rated
            </p>
            <ol className="mt-2 space-y-2 text-sm">
              {top3.map((m, i) => (
                <li key={m.id}>
                  <Link href={`/movie/${m.id}`} className="font-medium hover:text-accent">
                    {i + 1}. {m.title}
                  </Link>
                  <span className="ml-1 text-xs text-[var(--muted)]">
                    ({m.year}){m.rating ? ` · ${m.rating.toFixed(2)}` : ''}
                  </span>
                </li>
              ))}
            </ol>
          </div>
          {topDirectors.length > 0 && (
            <div>
              <p className="font-display text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
                Most films in the canon
              </p>
              <ol className="mt-2 space-y-2 text-sm">
                {topDirectors.map(([name, n]) => (
                  <li key={name}>
                    <span className="font-medium">{name}</span>
                    <span className="ml-1 text-xs text-[var(--muted)]">· {n} films</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          <div>
            <p className="font-display text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
              Genre mix
            </p>
            <ul className="mt-2 space-y-2 text-sm">
              {topGenres.map(([g, n]) => (
                <li key={g}>
                  <Link href={`/genre/${g.toLowerCase().replace(/\s+/g, '-')}`} className="font-medium hover:text-accent">
                    {g}
                  </Link>
                  <span className="ml-1 text-xs text-[var(--muted)]">
                    · {n} films · {Math.round((n / films.length) * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* About the list */}
      <section className="mt-10 max-w-3xl">
        <h2 className="mb-3 font-display text-xl font-semibold">How this list is ranked</h2>
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          This is the {films.length} most-loved {slug} films according to{' '}
          <a href="https://letterboxd.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">Letterboxd</a>'s
          per-decade popularity ranking — a function of how many people have watched each film and
          how highly they rate it. We refresh the list monthly so it stays current.
          See <Link href="/about" className="underline hover:text-accent">our methodology</Link> for the full picture.
        </p>
      </section>

      <nav className="mt-12 flex items-center justify-between border-t border-[var(--line)] pt-6 text-sm">
        <div>
          {prev && (
            <Link href={`/decade/${prev}`} className="text-[var(--muted)] underline hover:text-accent">
              ← {prev}
            </Link>
          )}
        </div>
        <Link href="/" className="text-[var(--muted)] underline hover:text-accent">
          Full canon
        </Link>
        <div>
          {next && (
            <Link href={`/decade/${next}`} className="text-[var(--muted)] underline hover:text-accent">
              {next} →
            </Link>
          )}
        </div>
      </nav>

      {/* Cross-link to all decade pages */}
      <section className="mt-10">
        <h2 className="mb-3 font-display text-sm uppercase tracking-wider text-[var(--muted)]">
          Browse another decade
        </h2>
        <div className="flex flex-wrap gap-2">
          {ALL_DECADES.map((d) => (
            <Link
              key={d}
              href={`/decade/${d}`}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                d === slug
                  ? 'border-accent bg-accent text-white'
                  : 'border-[var(--line)] hover:border-accent/60'
              }`}
            >
              {d}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
