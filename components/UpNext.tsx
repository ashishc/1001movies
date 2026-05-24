'use client';
import { useMemo } from 'react';
import type { Movie } from '@/lib/types';

type Props = {
  movies: Movie[];
  watched: Set<string>;
  onToggle: (id: string) => void;
};

function runtimeMinutes(s: string): number {
  // "2h 14m" -> 134; "1h 30m" -> 90; "0h 5m" -> 5
  const h = /(\d+)h/.exec(s);
  const m = /(\d+)m/.exec(s);
  return (h ? parseInt(h[1], 10) * 60 : 0) + (m ? parseInt(m[1], 10) : 0);
}

export function UpNext({ movies, watched, onToggle }: Props) {
  const picks = useMemo(() => {
    const candidates = movies
      .filter((m) => !watched.has(m.id) && runtimeMinutes(m.runtime) >= 60) // skip dataset noise
      .map((m) => ({ m, mins: runtimeMinutes(m.runtime) }))
      .sort((a, b) => a.mins - b.mins);
    return candidates.slice(0, 3);
  }, [movies, watched]);

  if (!picks.length) return null;

  return (
    <section className="mb-8 rounded-xl border border-[var(--line)] bg-black/[0.02] p-4 sm:p-5 dark:bg-white/[0.03]">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-lg font-semibold">Up next</h2>
        <p className="text-xs text-[var(--muted)]">Shortest you haven't watched</p>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
        {picks.map(({ m, mins }) => (
          <button
            key={m.id}
            onClick={() => onToggle(m.id)}
            className="group flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] p-2 text-left transition hover:border-accent/60"
          >
            <div className="aspect-[2/3] w-12 flex-none overflow-hidden rounded bg-[var(--line)]">
              {m.poster ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.poster} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-semibold leading-tight group-hover:text-accent">
                {m.title}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-[var(--muted)]">
                {mins}m · {m.year} · {m.director}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
