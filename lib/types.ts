export type Movie = {
  id: string;
  title: string;
  director: string;
  year: number;
  genre: string;
  description: string;
  poster: string;
  runtime: string;
  /** TMDB audience rating, 0–10 scale. Optional for forward-compat. */
  rating?: number;
};
