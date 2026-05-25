// Tiny analytics shim. Fires named events to whatever provider is loaded.
// Safe to call with no provider configured (silently no-ops).
//
// Today: writes events to Plausible if window.plausible exists, otherwise
//   sends a beacon to /api/event (a Cloudflare Pages Function we may add
//   later). Either way: never throws, never blocks.
//
// Sample call sites:
//   track('share_open',     { template: 'percentile' });
//   track('milestone',      { count: 100 });
//   track('compare_visit',  {});
//   track('justwatch_click',{ movieId: 'oppenheimer-2023' });

type EventProps = Record<string, string | number | boolean>;

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: EventProps }) => void;
  }
}

export function track(event: string, props: EventProps = {}) {
  if (typeof window === 'undefined') return;
  try {
    if (typeof window.plausible === 'function') {
      window.plausible(event, { props });
      return;
    }
    // Optional fallback: a CF Pages Function at /api/event we may wire later.
    // Use sendBeacon so it doesn't block navigation on outbound link clicks.
    const payload = JSON.stringify({ event, props, ts: Date.now(), path: location.pathname });
    if ('sendBeacon' in navigator) {
      navigator.sendBeacon('/api/event', new Blob([payload], { type: 'application/json' }));
    }
  } catch {
    /* never throw from analytics */
  }
}
