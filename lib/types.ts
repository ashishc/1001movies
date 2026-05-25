export type Movie = {
  id: string;
  title: string;
  director: string;
  year: number;
  genre: string;
  description: string;
  poster: string;
  runtime: string;
  /** Letterboxd weighted-average rating (0–5). Optional for forward-compat. */
  rating?: number;
};
