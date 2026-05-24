'use client';
import { estimatePercentile } from '@/lib/constants';

type Props = {
  threshold: number | null;
  totalWatched: number;
  total: number;
  onClose: () => void;
  onShare: () => void;
};

const FLAVOR: Record<number, { title: string; sub: string }> = {
  10: { title: 'You\'re on your way.', sub: 'Ten down. The journey starts here.' },
  25: { title: 'A real start.', sub: 'You\'re past the curious-tourist phase.' },
  50: { title: 'Fifty films deep.', sub: 'You\'re officially writing a taste.' },
  100: { title: 'Triple digits.', sub: 'You\'ve watched more of the canon than most film majors.' },
  250: { title: 'Two hundred fifty.', sub: 'You\'ve crossed into rare territory.' },
  500: { title: 'Halfway there.', sub: 'Five hundred films of cinema history, ticked.' },
  750: { title: 'Three quarters.', sub: 'You see things most people only read about.' },
  1000: { title: 'A thousand.', sub: 'A round number for a remarkable obsession.' },
  1149: { title: 'Completed.', sub: 'You have watched the entire 1001 canon. Now what?' },
};

export function MilestoneModal({ threshold, totalWatched, total, onClose, onShare }: Props) {
  if (threshold == null) return null;
  const flavor = FLAVOR[threshold] || { title: `${threshold} films.`, sub: 'A meaningful step.' };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl border border-accent/30 bg-[var(--bg)] p-7 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-display text-xs uppercase tracking-[0.25em] text-accent">
          Milestone · {threshold}
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold leading-tight">{flavor.title}</h2>
        <p className="mt-3 text-sm text-[var(--muted)]">{flavor.sub}</p>
        <div className="my-5 grid grid-cols-2 gap-2 text-left">
          <div className="rounded-lg border border-[var(--line)] p-3">
            <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Watched</p>
            <p className="font-display text-2xl font-semibold tabular-nums">
              {totalWatched.toLocaleString()}
              <span className="text-base text-[var(--muted)]"> / {total.toLocaleString()}</span>
            </p>
          </div>
          <div className="rounded-lg border border-[var(--line)] p-3">
            <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Ahead of</p>
            <p className="font-display text-2xl font-semibold tabular-nums">
              {estimatePercentile(totalWatched)}
            </p>
            <p className="text-[10px] text-[var(--muted)]">of trackers</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onShare}
            className="flex-1 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            Share milestone
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-[var(--line)] px-4 py-3 text-sm font-semibold transition hover:border-[var(--fg)]/60"
          >
            Keep watching
          </button>
        </div>
      </div>
    </div>
  );
}
