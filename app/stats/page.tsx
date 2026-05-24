import type { Metadata } from 'next';
import StatsClient from './StatsClient';
import movies from '../data/movies.json';
import type { Movie } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Your stats — taste profile, decade heatmap, percentile',
  description:
    'See your taste profile, decade-by-decade heatmap, top directors, and how you compare to other 1001-Movies trackers.',
  alternates: { canonical: '/stats' },
};

export default function StatsPage() {
  return <StatsClient movies={movies as unknown as Movie[]} />;
}
