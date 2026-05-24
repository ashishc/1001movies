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
