// Brief editorial intros per genre. Hand-written for EEAT.

export const GENRE_COPY: Record<string, { headline: string; intro: string }> = {
  Action: {
    headline: 'Where movement is meaning',
    intro:
      'The action films in the canon range from Buster Keaton\'s real-stunt era to modern set-piece spectaculars. What unites them is a belief that physical movement, edited well, can carry a story by itself.',
  },
  Adventure: {
    headline: 'The journey is the form',
    intro:
      'Adventure cinema is the original Hollywood mode — Indiana Jones, Lawrence of Arabia, Treasure of the Sierra Madre. The canonical entries here are a tour of how the medium has staged the journey out and back.',
  },
  Animation: {
    headline: 'Drawn from life, frame by frame',
    intro:
      'From Disney\'s 1937 Snow White to Studio Ghibli to Pixar, animation in the canon is a counter-history of cinema itself. The frames are made by hand or computer, but the techniques of montage and pacing apply equally.',
  },
  Comedy: {
    headline: 'Hard to do, harder to date well',
    intro:
      'Comedy is the genre most cruelly aged by time. The canon\'s comedies survive because their jokes are structural — Some Like It Hot, Groundhog Day, Annie Hall — not topical.',
  },
  Crime: {
    headline: 'A genre about systems',
    intro:
      'Crime films are the most reliable engine of American cinema. The Godfather, Goodfellas, Pulp Fiction, Reservoir Dogs — the canon\'s crime entries are studies of how groups protect themselves from outsiders, and from each other.',
  },
  Documentary: {
    headline: 'The ones that matter',
    intro:
      'A short list — most documentary heavy-hitters live outside the 1001. The ones that made it (Shoah, Hoop Dreams, Man with a Movie Camera) earned it by becoming reference points outside their own form.',
  },
  Drama: {
    headline: 'The default register',
    intro:
      'Drama is the default genre of the canon — most of the 1001 sit here. Reading them as a body, you can trace the entire shift from theatrical performance to cinema-specific psychology.',
  },
  Family: {
    headline: 'For the canon, briefly',
    intro:
      'Family films make this list when they cross over to adult cinephile interest — Spirited Away, The Wizard of Oz, E.T. The bar is high because most family fare is built to entertain twice and forget.',
  },
  Fantasy: {
    headline: 'When the world bends',
    intro:
      'Fantasy in the canon means The Lord of the Rings, Pan\'s Labyrinth, Beauty and the Beast (Cocteau). Each invents its own physics. Each takes those rules entirely seriously.',
  },
  History: {
    headline: 'Made of facts, shaped like fiction',
    intro:
      'The historical films in the canon range from Lawrence of Arabia\'s sweep to Schindler\'s List\'s unblinking specificity. Their job is to make the past feel inhabited rather than recited.',
  },
  Horror: {
    headline: 'The genre cinephiles defend',
    intro:
      'Horror in the canon includes Psycho, The Shining, Rosemary\'s Baby, The Texas Chain Saw Massacre, The Exorcist — the films that legitimized a genre critics used to dismiss. Watching these in order is a short course in what fear can do as a medium.',
  },
  Music: {
    headline: 'The musical, then everything else',
    intro:
      'Hollywood musicals dominate the canon\'s music entries — Singin\' in the Rain, West Side Story — alongside concert films and a handful of music-driven dramas where the songs are the script.',
  },
  Mystery: {
    headline: 'The puzzle and the dread',
    intro:
      'Mystery films in the canon shade into noir on one side and arthouse on the other. Vertigo, Chinatown, Memento. The genre rewards repeat viewings the way few others do.',
  },
  Romance: {
    headline: 'Two people, the rest is geography',
    intro:
      'Romance is rarely the only label on a canonical film, but the canon is rich in it: Casablanca, Annie Hall, Eternal Sunshine, Brokeback Mountain. Whatever else they\'re about, they\'re about who you can choose and what choosing costs.',
  },
  'Science Fiction': {
    headline: 'Ideas, made visible',
    intro:
      '2001, Solaris, Stalker, Blade Runner, The Matrix. Sci-fi in the canon is mostly philosophy with production design — the genre that makes abstract ideas about consciousness, time, and identity literally watchable.',
  },
  Thriller: {
    headline: 'Suspense as architecture',
    intro:
      'Hitchcock taught the canon how thrillers work: place a question in act one, withhold the answer, place a clock somewhere visible. The 1001\'s thrillers are mostly his children — Rear Window, North by Northwest, plus everyone who learned from him.',
  },
  War: {
    headline: 'The genre that argues with itself',
    intro:
      'Apocalypse Now, Saving Private Ryan, Paths of Glory, Come and See. War films in the canon don\'t agree on what war is — some are recruiting posters, some are anti-war fevers — but they all believe the camera should be there.',
  },
  Western: {
    headline: 'America, dramatized',
    intro:
      'The Western is the original American genre. The canon covers Ford, Leone, Peckinpah and Eastwood — five decades of how the country told itself a story about itself. The genre died and got reinvented twice in this list.',
  },
};

export function genreSlug(g: string) {
  return g.toLowerCase().replace(/\s+/g, '-');
}

export function genreFromSlug(slug: string): string | null {
  for (const g of Object.keys(GENRE_COPY)) {
    if (genreSlug(g) === slug) return g;
  }
  return null;
}
