'use client';
import { useEffect, useState } from 'react';

type Props = {
  open: boolean;
  preTickedCount: number;
  onClose: () => void;
};

export function Onboarding({ open, preTickedCount, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Welcome"
        className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-7 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-display text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          A free tracker
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold leading-tight">
          1001 Movies <span className="text-accent">·</span> Tracker
        </h2>
        <p className="mt-4 text-sm text-[var(--muted)]">
          The cinephile canon — the most-loved films of every decade, ranked by{' '}
          <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">TMDB</a> users.
          Tap any poster you've watched. Progress lives on this device — no signup, no email.
        </p>
        <div className="my-5 rounded-lg border border-[var(--line)] bg-black/[0.02] p-3 text-left text-sm dark:bg-white/[0.03]">
          <p className="text-xs uppercase tracking-wider text-[var(--muted)]">We started you with</p>
          <p className="mt-1 font-display font-semibold">
            {preTickedCount} films most adults have seen
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Untick any you haven't watched. We'll keep score.
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
        >
          Begin
        </button>
        <p className="mt-3 text-[11px] text-[var(--muted)]">
          1,122 films · 18 genres · 13 decades · 1904 – present
        </p>
      </div>
    </div>
  );
}
