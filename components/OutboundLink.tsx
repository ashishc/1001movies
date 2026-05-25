'use client';
import { track } from '@/lib/track';
import type { ReactNode } from 'react';

type Props = {
  href: string;
  event: string;
  props?: Record<string, string | number | boolean>;
  className?: string;
  children: ReactNode;
};

// Clickable anchor that fires a track event before navigating.
// Used for affiliate / outbound links whose CTR we want to know.
export default function OutboundLink({ href, event, props = {}, className, children }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={className}
      onClick={() => track(event, props)}
    >
      {children}
    </a>
  );
}
