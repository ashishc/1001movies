import Tracker from '@/components/Tracker';
import movies from './data/movies.json';
import type { Movie } from '@/lib/types';

const SITE_URL = 'https://1001movies.app';

export default function Home() {
  const list = movies as unknown as Movie[];

  // JSON-LD ItemList schema — eligible for Google rich results.
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '1001 Movies You Must See Before You Die',
    description:
      'The complete list of films from the book "1001 Movies You Must See Before You Die" with an interactive watched tracker.',
    numberOfItems: list.length,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    itemListElement: list.slice(0, 100).map((m, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Movie',
        name: m.title,
        director: { '@type': 'Person', name: m.director },
        datePublished: String(m.year),
        genre: m.genre,
      },
    })),
  };

  const webAppLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: '1001 Movies Tracker',
    url: SITE_URL,
    applicationCategory: 'EntertainmentApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppLd) }}
      />
      <Tracker movies={list} />
    </>
  );
}
