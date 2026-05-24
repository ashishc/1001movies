'use client';
import type { Movie } from '@/lib/types';

type Props = {
  movie: Movie;
  watched: boolean;
  onToggle: (id: string) => void;
};

export function MovieCard({ movie, watched, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={() => onToggle(movie.id)}
      aria-pressed={watched}
      aria-label={`${watched ? 'Mark unwatched' : 'Mark watched'}: ${movie.title}`}
      className={`group relative flex w-full flex-col overflow-hidden rounded-lg border text-left transition
        ${watched
          ? 'border-accent/50 bg-accent/5'
          : 'border-[var(--line)] hover:border-accent/40 hover:bg-black/[0.02] dark:hover:bg-white/[0.03]'
        }`}
    >
      <div className="relative aspect-[2/3] w-full bg-[var(--line)]">
        {movie.poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={movie.poster}
            alt=""
            loading="lazy"
            decoding="async"
            className={`h-full w-full object-cover transition ${watched ? '' : 'group-hover:scale-[1.02]'}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]">
            no poster
          </div>
        )}
        {watched && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
              ✓ watched
            </span>
          </div>
        )}
      </div>
      <div className="px-3 py-2">
        <h3 className="font-display text-sm font-semibold leading-tight">{movie.title}</h3>
        <p className="mt-0.5 text-xs text-[var(--muted)]">
          {movie.year} · {movie.director}
        </p>
      </div>
    </button>
  );
}
