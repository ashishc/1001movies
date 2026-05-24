'use client';
import { useEffect, useState } from 'react';
import { loadWatched, saveWatched, bumpStreak } from '@/lib/storage';

export default function MovieMarkButton({ id }: { id: string }) {
  const [watched, setWatched] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const w = loadWatched();
    setWatched(w.has(id));
    setHydrated(true);
  }, [id]);

  function toggle() {
    const w = loadWatched();
    if (w.has(id)) w.delete(id);
    else {
      w.add(id);
      bumpStreak();
    }
    saveWatched(w);
    setWatched(w.has(id));
  }

  return (
    <button
      onClick={toggle}
      className={`rounded-lg px-5 py-3 text-sm font-semibold transition ${
        watched
          ? 'border border-accent/40 bg-accent/10 text-accent hover:bg-accent/20'
          : 'bg-accent text-white hover:opacity-90'
      }`}
      aria-pressed={watched}
    >
      {hydrated ? (watched ? '✓ Watched · click to undo' : 'Mark watched') : 'Mark watched'}
    </button>
  );
}
