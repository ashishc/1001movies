'use client';
import { useEffect, useState } from 'react';
import type { Movie } from '@/lib/types';
import { makeCard, type ShareTemplate } from '@/lib/sharecard';

type Props = {
  open: boolean;
  onClose: () => void;
  watched: Set<string>;
  movies: Movie[];
};

const TEMPLATES: Array<{ id: ShareTemplate; label: string; sub: string }> = [
  { id: 'percentile', label: 'Percentile', sub: 'Big number, brag mode' },
  { id: 'heatmap', label: 'Decade heatmap', sub: 'The screenshot one' },
  { id: 'taste', label: 'Taste profile', sub: 'Identity reveal' },
  { id: 'top4', label: 'From my list', sub: 'Four films, your pick' },
];

export function ShareModal({ open, onClose, watched, movies }: Props) {
  const [tpl, setTpl] = useState<ShareTemplate>('percentile');
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDataUrl(makeCard(tpl, watched, movies));
  }, [open, tpl, watched, movies]);

  if (!open) return null;

  async function copyImage() {
    try {
      const blob = await (await fetch(dataUrl)).blob();
      // @ts-ignore — ClipboardItem may be missing in older lib.dom
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      alert('Copy failed — try the Download button.');
    }
  }

  function download() {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `1001movies-${tpl}.png`;
    a.click();
  }

  function nativeShare() {
    if (!navigator.share) {
      alert('Native share not supported on this device.');
      return;
    }
    fetch(dataUrl)
      .then((r) => r.blob())
      .then((blob) => {
        const file = new File([blob], `1001movies-${tpl}.png`, { type: 'image/png' });
        navigator
          .share({
            title: '1001 Movies Tracker',
            text: 'My progress through the 1001 Movies canon.',
            url: 'https://1001movies.app',
            files: [file],
          })
          .catch(() => {});
      });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-2 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
          <div>
            <p className="font-display text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">Share</p>
            <h3 className="font-display text-lg font-semibold">A card you'll be proud to post</h3>
          </div>
          <button onClick={onClose} className="text-[var(--muted)] hover:text-[var(--fg)]" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTpl(t.id)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  tpl === t.id
                    ? 'border-accent bg-accent text-white'
                    : 'border-[var(--line)] hover:border-accent/60'
                }`}
                title={t.sub}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-lg border border-[var(--line)] bg-black/[0.04] dark:bg-white/[0.05]">
            {dataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={dataUrl} alt="Share card preview" className="block w-full" />
            ) : (
              <div className="aspect-square w-full animate-pulse bg-black/[0.06] dark:bg-white/[0.06]" />
            )}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <button
              onClick={download}
              className="rounded-lg border border-[var(--line)] px-3 py-2.5 text-sm font-medium transition hover:border-accent/60"
            >
              Download
            </button>
            <button
              onClick={copyImage}
              className="rounded-lg border border-[var(--line)] px-3 py-2.5 text-sm font-medium transition hover:border-accent/60"
            >
              {copied ? 'Copied ✓' : 'Copy image'}
            </button>
            <button
              onClick={nativeShare}
              className="rounded-lg bg-accent px-3 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Share…
            </button>
          </div>

          <p className="mt-3 text-center text-[11px] text-[var(--muted)]">
            1080×1080 PNG — fits Instagram, X, and iMessage.
          </p>
        </div>
      </div>
    </div>
  );
}
