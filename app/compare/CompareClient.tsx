'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Movie } from '@/lib/types';
import { loadWatched } from '@/lib/storage';
import { decodeWatched, encodeWatched } from '@/lib/compare';
import { ShareModal } from '@/components/ShareModal';
import { makeCard } from '@/lib/sharecard';
import { track } from '@/lib/track';

type Props = { movies: Movie[] };

type Mode = 'idle' | 'paste' | 'compared';

export default function CompareClient({ movies }: Props) {
  const [mine, setMine] = useState<Set<string>>(new Set());
  const [theirs, setTheirs] = useState<Set<string>>(new Set());
  const [theirName, setTheirName] = useState('Friend');
  const [paste, setPaste] = useState('');
  const [mode, setMode] = useState<Mode>('idle');
  const [shareUrl, setShareUrl] = useState('');
  const [showShare, setShowShare] = useState(false);
  const [downloadDataUrl, setDownloadDataUrl] = useState('');

  useEffect(() => {
    const w = loadWatched();
    setMine(w);
    if (typeof window !== 'undefined') {
      const enc = encodeWatched(movies, w);
      setShareUrl(`${window.location.origin}/?vs=${enc}`);

      // If page was opened with ?vs=, treat the URL's set as "theirs" automatically.
      const url = new URL(window.location.href);
      const vs = url.searchParams.get('vs');
      const name = url.searchParams.get('n');
      if (vs) {
        setTheirs(decodeWatched(movies, vs));
        if (name) setTheirName(name.slice(0, 16));
        setMode('compared');
        track('compare_visit', { hasName: !!name });
      }
    }
  }, [movies]);

  function applyPaste() {
    let v = paste.trim();
    try {
      const u = new URL(v);
      v = u.searchParams.get('vs') || v.replace(/^.*\?vs=/, '');
    } catch {
      v = v.replace(/^.*\?vs=/, '');
    }
    if (!v) return;
    const set = decodeWatched(movies, v);
    setTheirs(set);
    setMode('compared');
  }

  const stats = useMemo(() => {
    const both = new Set<string>();
    mine.forEach((id) => {
      if (theirs.has(id)) both.add(id);
    });
    const onlyMine = new Set<string>();
    mine.forEach((id) => {
      if (!theirs.has(id)) onlyMine.add(id);
    });
    const onlyTheirs = new Set<string>();
    theirs.forEach((id) => {
      if (!mine.has(id)) onlyTheirs.add(id);
    });
    return { both, onlyMine, onlyTheirs };
  }, [mine, theirs]);

  function copyShare() {
    navigator.clipboard?.writeText(shareUrl);
    track('compare_copy_link', {});
    alert('Link copied. Send to a friend; they can paste it back here.');
  }

  function downloadCompareCard() {
    const url = makeCard('compare', mine, movies, {
      compareCount: theirs.size,
      compareName: theirName,
    });
    setDownloadDataUrl(url);
    const a = document.createElement('a');
    a.href = url;
    a.download = '1001movies-compare.png';
    a.click();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-6 sm:pt-10">
      <ShareModal open={showShare} onClose={() => setShowShare(false)} watched={mine} movies={movies} />

      <header className="mb-8">
        <p className="font-display text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
          Compare
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">
          You vs. anyone with the canon.
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Send a friend your share link. Or paste theirs below to see what they've seen that you haven't —
          and vice versa.
        </p>
      </header>

      {/* Send your link */}
      <section className="mb-8 rounded-xl border border-[var(--line)] p-5">
        <p className="font-display text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
          Your share link
        </p>
        <div className="mt-2 flex gap-2">
          <input
            readOnly
            value={shareUrl}
            className="flex-1 rounded-lg border border-[var(--line)] bg-transparent px-3 py-2 text-xs"
            onFocus={(e) => e.currentTarget.select()}
          />
          <button
            onClick={copyShare}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Copy
          </button>
        </div>
        <p className="mt-2 text-xs text-[var(--muted)]">
          The link encodes only your watched checkmarks. No name, no email, no account.
        </p>
      </section>

      {/* Paste theirs */}
      <section className="mb-8 rounded-xl border border-[var(--line)] p-5">
        <p className="font-display text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
          Compare with someone
        </p>
        <div className="mt-2 flex gap-2">
          <input
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            placeholder="Paste their share link here…"
            className="flex-1 rounded-lg border border-[var(--line)] bg-transparent px-3 py-2 text-sm focus:border-accent/60 focus:outline-none"
          />
          <button
            onClick={applyPaste}
            className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-semibold hover:border-accent/60"
          >
            Compare
          </button>
        </div>
      </section>

      {/* Result */}
      {mode === 'compared' && (
        <>
          <section className="mb-6 grid gap-4 sm:grid-cols-3">
            <Stat label={`You`} count={mine.size} accent />
            <Stat label="Both" count={stats.both.size} />
            <Stat label={theirName} count={theirs.size} />
          </section>

          <section className="mb-6 grid gap-4 sm:grid-cols-2">
            <DiffList
              title={`${theirName} has seen, you haven't`}
              ids={stats.onlyTheirs}
              movies={movies}
              emptyMessage={`Nothing — ${theirName} hasn't seen any film you haven't.`}
            />
            <DiffList
              title={`You've seen, ${theirName} hasn't`}
              ids={stats.onlyMine}
              movies={movies}
              emptyMessage="Nothing — they're equally cultured."
            />
          </section>

          <section className="mb-8 rounded-xl border border-[var(--line)] bg-black/[0.02] p-5 dark:bg-white/[0.03]">
            <p className="font-display text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
              Verdict
            </p>
            <p className="mt-2 font-display text-2xl font-semibold">
              {mine.size === theirs.size
                ? 'A perfect tie.'
                : mine.size > theirs.size
                ? `You're ahead by ${mine.size - theirs.size} films.`
                : `${theirName} is ahead by ${theirs.size - mine.size} films.`}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={downloadCompareCard}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Download compare card
              </button>
              <button
                onClick={() => setShowShare(true)}
                className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-semibold hover:border-accent/60"
              >
                Share my own stats
              </button>
            </div>
            {downloadDataUrl && (
              <p className="mt-2 text-xs text-[var(--muted)]">Saved 1001movies-compare.png to downloads.</p>
            )}
          </section>
        </>
      )}

      <p className="text-center text-xs text-[var(--muted)]">
        <Link href="/" className="underline hover:text-accent">
          ← Back to the tracker
        </Link>
      </p>
    </div>
  );
}

function Stat({ label, count, accent }: { label: string; count: number; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-5 ${accent ? 'border-accent/40' : 'border-[var(--line)]'}`}>
      <p className="font-display text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">{label}</p>
      <p className={`mt-2 font-display text-3xl font-bold tabular-nums ${accent ? 'text-accent' : ''}`}>
        {count}
      </p>
    </div>
  );
}

function DiffList({
  title,
  ids,
  movies,
  emptyMessage,
}: {
  title: string;
  ids: Set<string>;
  movies: Movie[];
  emptyMessage: string;
}) {
  const films = movies.filter((m) => ids.has(m.id)).slice(0, 25);
  return (
    <div className="rounded-xl border border-[var(--line)] p-5">
      <p className="font-display text-sm font-semibold">{title}</p>
      <p className="text-xs text-[var(--muted)]">{ids.size} films</p>
      <ul className="mt-3 space-y-1 text-sm">
        {films.length === 0 ? (
          <li className="text-[var(--muted)]">{emptyMessage}</li>
        ) : (
          films.map((m) => (
            <li key={m.id} className="truncate">
              <span className="font-medium">{m.title}</span>{' '}
              <span className="text-[var(--muted)]">· {m.year}</span>
            </li>
          ))
        )}
        {ids.size > 25 && (
          <li className="text-xs text-[var(--muted)]">… and {ids.size - 25} more.</li>
        )}
      </ul>
    </div>
  );
}
