import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import movies from '../../data/movies.json';
import type { Movie } from '@/lib/types';
import ScopedTracker from '@/components/ScopedTracker';
import { GENRE_COPY, genreFromSlug, genreSlug } from '@/lib/genre-copy';

const ALL_GENRES = Object.keys(GENRE_COPY);

export function generateStaticParams() {
  return ALL_GENRES.map((g) => ({ slug: genreSlug(g) }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const genre = genreFromSlug(params.slug);
  if (!genre) return {};
  const copy = GENRE_COPY[genre];
  const list = (movies as unknown as Movie[]).filter((m) => m.genre === genre);
  const title = `Best ${genre} Movies — The 1001 Canon`;
  const description = `${list.length} essential ${genre.toLowerCase()} films from "1001 Movies You Must See Before You Die." ${copy?.intro?.slice(0, 120) || ''}`;
  return {
    title,
    description,
    alternates: { canonical: `/genre/${params.slug}` },
    openGraph: { title, description, url: `https://1001movies.app/genre/${params.slug}` },
  };
}

export default function GenrePage({ params }: { params: { slug: string } }) {
  const genre = genreFromSlug(params.slug);
  if (!genre) return notFound();
  const copy = GENRE_COPY[genre];
  const films = (movies as unknown as Movie[]).filter((m) => m.genre === genre);

  // Genre in numbers: highest-rated, top directors, decade spread
  const top3 = [...films].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 3);
  const directorCounts: Record<string, number> = {};
  films.forEach((f) => { if (f.director) directorCounts[f.director] = (directorCounts[f.director] || 0) + 1; });
  const topDirectors = Object.entries(directorCounts)
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const decadeCounts: Record<string, number> = {};
  films.forEach((f) => {
    const d = `${Math.floor(f.year / 10) * 10}s`;
    decadeCounts[d] = (decadeCounts[d] || 0) + 1;
  });
  const topDecades = Object.entries(decadeCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best ${genre} Movies — 1001 Canon`,
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
          Best {genre.toLowerCase()} films · 1001 canon
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold leading-tight sm:text-5xl">
          {copy.headline}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">{copy.intro}</p>
        <p className="mt-3 text-sm">
          <span className="font-semibold">{films.length} films</span> in this genre are in the canon.
          Tick what you've seen — your progress saves on this device.
        </p>
      </header>

      <ScopedTracker films={films} scopeLabel={genre} />

      {/* Genre in numbers */}
      <section className="mt-12 border-t border-[var(--line)] pt-8">
        <h2 className="mb-5 font-display text-xl font-semibold">{genre} in numbers</h2>
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
                Most-canonised directors
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
              Decade spread
            </p>
            <ul className="mt-2 space-y-2 text-sm">
              {topDecades.map(([d, n]) => (
                <li key={d}>
                  <Link href={`/decade/${d}`} className="font-medium hover:text-accent">
                    {d}
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

      <section className="mt-10 max-w-3xl">
        <h2 className="mb-3 font-display text-xl font-semibold">How this list is ranked</h2>
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          The {films.length} most-loved {genre.toLowerCase()} films from the cinephile canon, ranked
          by audience rating on{' '}
          <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">TMDB</a>{' '}
          and filtered by minimum vote count so niche-fanbase outliers don't dominate. Refreshed
          monthly. See <Link href="/about" className="underline hover:text-accent">our methodology</Link>.
        </p>
      </section>

      <section className="mt-12 border-t border-[var(--line)] pt-6">
        <h2 className="mb-3 font-display text-sm uppercase tracking-wider text-[var(--muted)]">
          Browse another genre
        </h2>
        <div className="flex flex-wrap gap-2">
          {ALL_GENRES.map((g) => (
            <Link
              key={g}
              href={`/genre/${genreSlug(g)}`}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                g === genre
                  ? 'border-accent bg-accent text-white'
                  : 'border-[var(--line)] hover:border-accent/60'
              }`}
            >
              {g}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
