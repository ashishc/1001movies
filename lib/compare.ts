// Encode/decode a watched-set into a URL-safe string for compare links.
// We use a bit-vector indexed by movies array order, then base64url it.

import type { Movie } from './types';

export function encodeWatched(movies: Movie[], watched: Set<string>): string {
  const bits = new Uint8Array(Math.ceil(movies.length / 8));
  movies.forEach((m, i) => {
    if (watched.has(m.id)) {
      bits[i >> 3] |= 1 << (i & 7);
    }
  });
  // Base64url
  let bin = '';
  for (let i = 0; i < bits.length; i++) bin += String.fromCharCode(bits[i]);
  const b64 = typeof window !== 'undefined' ? btoa(bin) : Buffer.from(bin, 'binary').toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeWatched(movies: Movie[], encoded: string): Set<string> {
  try {
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const bin = typeof window !== 'undefined' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');
    const bits = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bits[i] = bin.charCodeAt(i);
    const out = new Set<string>();
    movies.forEach((m, i) => {
      if (bits[i >> 3] & (1 << (i & 7))) out.add(m.id);
    });
    return out;
  } catch {
    return new Set();
  }
}
