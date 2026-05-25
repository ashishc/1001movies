import type { Metadata } from 'next';
import RandomClient from './RandomClient';
import movies from '../data/movies.json';
import type { Movie } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Random Movie Generator — From the Cinephile Canon',
  description:
    'Stuck on what to watch? Spin the projector — get one random film from the 1,085 most-loved movies of every decade. Filter by decade or genre. Free, no signup.',
  alternates: { canonical: '/random' },
  openGraph: {
    title: 'Random Movie Generator — 1001 Movies',
    description:
      'One random pick from 1,085 of the greatest films ever made. Filter by decade or genre.',
    url: 'https://1001movies.app/random',
  },
};

export default function RandomPage() {
  return <RandomClient movies={movies as unknown as Movie[]} />;
}
