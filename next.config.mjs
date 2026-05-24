/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export — runs identically on Vercel and Cloudflare Pages, no functions needed.
  output: 'export',
  images: {
    // Skip Vercel's image optimizer (which has a 5k/mo free cap). TMDB posters are already small.
    unoptimized: true,
  },
  trailingSlash: false,
};

export default nextConfig;
