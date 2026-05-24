import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import movies from '../../data/movies.json';
import type { Movie } from '@/lib/types';
import MovieMarkButton from '@/components/MovieMarkButton';
import { genreSlug } from '@/lib/genre-copy';
import { AMAZON_TAG } from '@/lib/constants';

const ALL: Movie[] = movies as unknown as Movie[];
const BY_ID = new Map<string, Movie>(ALL.map((m) => [m.id, m]));

export function generateStaticParams() {
  return ALL.map((m) => ({ id: m.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const m = BY_ID.get(params.id);
  if (!m) return {};
  const title = `${m.title} (${m.year}) — Where to Watch & Add to Tracker`;
  const desc = `${m.title}, directed by ${m.director} (${m.year}). One of the 1001 Movies You Must See Before You Die. ${m.description?.slice(0, 140) || ''}`;
  return {
    title,
    description: desc,
    alternates: { canonical: `/movie/${m.id}` },
    openGraph: {
      title,
      description: desc,
      url: `https://1001movies.app/movie/${m.id}`,
      images: m.poster ? [{ url: m.poster }] : [],
    },
  };
}

function justWatchUrl(m: Movie) {
  const q = encodeURIComponent(`${m.title} ${m.year}`);
  return `https://www.justwatch.com/us/search?q=${q}`;
}

function amazonUrl(m: Movie) {
  if (!AMAZON_TAG) return null;
  const q = encodeURIComponent(`${m.title} ${m.year} blu-ray`);
  return `https://www.amazon.com/s?k=${q}&tag=${AMAZON_TAG}`;
}

function relatedFilms(m: Movie): Movie[] {
  // Same director first, then same decade + genre, capped at 5.
  const sameDir = ALL.filter((x) => x.id !== m.id && x.director === m.director).slice(0, 3);
  const decade = Math.floor(m.year / 10) * 10;
  const sameDecadeGenre = ALL.filter(
    (x) =>
      x.id !== m.id &&
      x.genre === m.genre &&
      x.year >= decade &&
      x.year < decade + 10 &&
      !sameDir.find((s) => s.id === x.id),
  ).slice(0, 5);
  return [...sameDir, ...sameDecadeGenre].slice(0, 5);
}

export default function MoviePage({ params }: { params: { id: string } }) {
  const m = BY_ID.get(params.id);
  if (!m) return notFound();
  const related = relatedFilms(m);
  const decade = `${Math.floor(m.year / 10) * 10}s`;

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: m.title,
    director: { '@type': 'Person', name: m.director },
    datePublished: String(m.year),
    genre: m.genre,
    description: m.description,
    image: m.poster || undefined,
    duration: m.runtime
      ? `PT${(/(\d+)h/.exec(m.runtime)?.[1] || '0')}H${(/(\d+)m/.exec(m.runtime)?.[1] || '0')}M`
      : undefined,
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:pt-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <nav className="mb-6 text-xs text-[var(--muted)]">
        <Link href="/" className="hover:text-accent">All 1001</Link>
        {' · '}
        <Link href={`/decade/${decade}`} className="hover:text-accent">{decade}</Link>
        {' · '}
        <Link href={`/genre/${genreSlug(m.genre)}`} className="hover:text-accent">{m.genre}</Link>
      </nav>

      <article className="grid gap-8 sm:grid-cols-[260px_1fr]">
        <div className="aspect-[2/3] w-full max-w-[260px] overflow-hidden rounded-lg bg-[var(--line)]">
          {m.poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.poster} alt={`Poster for ${m.title}`} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]">
              no poster
            </div>
          )}
        </div>

        <div>
          <p className="font-display text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
            From the 1001 canon
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold leading-tight sm:text-4xl">
            {m.title}{' '}
            <span className="font-normal text-[var(--muted)]">({m.year})</span>
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Directed by <span className="text-[var(--fg)]">{m.director}</span> ·{' '}
            {m.runtime || 'runtime n/a'} · {m.genre}
          </p>

          {m.description && (
            <p className="mt-5 text-base leading-relaxed">{m.description}</p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <MovieMarkButton id={m.id} />
            <a
              href={justWatchUrl(m)}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="rounded-lg border border-[var(--line)] px-5 py-3 text-sm font-semibold transition hover:border-accent/60"
            >
              Find where to stream →
            </a>
            {amazonUrl(m) && (
              <a
                href={amazonUrl(m)!}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="rounded-lg border border-[var(--line)] px-5 py-3 text-sm font-semibold transition hover:border-accent/60"
              >
                Buy on Amazon →
              </a>
            )}
          </div>

          <p className="mt-4 text-xs text-[var(--muted)]">
            Streaming links via JustWatch{AMAZON_TAG ? '; physical-media links via Amazon Associates' : ''}.
            We may earn a small commission if you buy through them.
          </p>
        </div>
      </article>

      {related.length > 0 && (
        <section className="mt-12 border-t border-[var(--line)] pt-8">
          <h2 className="mb-4 font-display text-lg font-semibold">If you liked this</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/movie/${r.id}`}
                className="group block overflow-hidden rounded-lg border border-[var(--line)] transition hover:border-accent/60"
              >
                <div className="aspect-[2/3] bg-[var(--line)]">
                  {r.poster && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.poster} alt="" loading="lazy" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="px-2 py-2">
                  <p className="truncate font-display text-sm font-semibold group-hover:text-accent">
                    {r.title}
                  </p>
                  <p className="truncate text-[11px] text-[var(--muted)]">
                    {r.year} · {r.director}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
