import type { Metadata } from 'next';
import './globals.css';
import { SiteShell } from '@/components/SiteShell';

const SITE_URL = 'https://1001movies.app';
const SITE_TITLE = '1001 Movies — The Cinephile Canon, Tracked';
const SITE_DESC =
  'Track your progress through the cinephile canon — the highest-rated films of every decade, ranked by 800k+ TMDB users. Check off films, see your % complete, share. Free, no signup.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: '%s · 1001 Movies' },
  description: SITE_DESC,
  applicationName: '1001 Movies Tracker',
  keywords: [
    '1001 movies before you die',
    '1001 movies tracker',
    '1001 movies checklist',
    'movies bucket list',
    'films to watch before you die',
    'movie checklist',
  ],
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESC,
    url: SITE_URL,
    siteName: '1001 Movies',
    type: 'website',
    images: [{ url: '/og.svg', width: 1200, height: 630, alt: '1001 Movies Tracker' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESC,
    images: ['/og.svg'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
  // Google Search Console site ownership verification
  // (HTML-tag method; equivalent to the file method but works around
  // Cloudflare Pages' .html URL stripping.)
  verification: {
    google: '4uFMioDU3C4EHGvt_kD7u4vNYMudvEEBPXCmRzxnm6M',
  },
  icons: {
    // Modern browsers prefer SVG (scales to any density); legacy Edge/IE fall back to ICO.
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafaf7' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0b0f' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <SiteShell>{children}</SiteShell>
        {/*
          Analytics. Cloudflare Web Analytics activates automatically once the site is
          served from Cloudflare Pages (it injects its own beacon at the edge — no
          script tag needed). If we later want event-level tracking (tick rate, share
          downloads, outbound clicks), uncomment the Plausible block below and replace
          the domain with the live one.

          <Script
            src="https://plausible.io/js/script.outbound-links.file-downloads.js"
            data-domain="1001movies.app"
            strategy="afterInteractive"
          />
        */}
      </body>
    </html>
  );
}
