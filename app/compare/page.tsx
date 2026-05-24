import type { Metadata } from 'next';
import CompareClient from './CompareClient';
import movies from '../data/movies.json';
import type { Movie } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Compare your 1001 Movies progress with a friend',
  description:
    'Paste a friend\'s 1001 Movies share link and see how your watched lists overlap. Who\'s seen more?',
  alternates: { canonical: '/compare' },
};

export default function ComparePage() {
  return <CompareClient movies={movies as unknown as Movie[]} />;
}
