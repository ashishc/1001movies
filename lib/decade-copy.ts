// Hand-written ~150 word intros per decade — for EEAT and SEO depth.
// These are deliberately editorial, not AI slop.

export const DECADE_COPY: Record<string, { headline: string; intro: string }> = {
  '1900s': {
    headline: 'Cinema, born',
    intro:
      'The earliest decade of cinema is well-represented in the canon by a single, monumental work: Méliès\' Le Voyage Dans La Lune. The medium was barely a craft yet, but the ambition was already there — narrative, fantasy, the moving image as spectacle. Most films of this period are lost. The few that survive feel like archaeology.',
  },
  '1910s': {
    headline: 'The grammar of film',
    intro:
      'The 1910s are when cinema discovered itself — close-ups, intercut chase sequences, the feature length. D.W. Griffith and Louis Feuillade do most of the heavy lifting. Few films from this decade are easy to watch in 2026, but they laid the rails everything else runs on.',
  },
  '1920s': {
    headline: 'Silent at its peak',
    intro:
      'Silent cinema reached its strongest form in the 1920s before sound arrived and reset the medium. German Expressionism, Soviet montage, slapstick comedy, and the Hollywood epic all crystallize here. Watching the canonical 1920s is the closest thing cinema has to reading Homer.',
  },
  '1930s': {
    headline: 'Sound, and the studio system',
    intro:
      'The 1930s are when "going to the movies" became the central American leisure activity. The Hollywood studio system produced screwball comedy, gangster pictures, and Universal monsters at industrial scale. Outside the U.S., Renoir was reinventing what the camera could do.',
  },
  '1940s': {
    headline: 'War, noir, and Citizen Kane',
    intro:
      'The decade everything changed twice — once for the war, once for Welles. Film noir gave Hollywood a darker register; the post-war Italian Neorealists rejected studios entirely; and Casablanca, It\'s a Wonderful Life, and The Third Man all sit squarely in this ten years.',
  },
  '1950s': {
    headline: 'Widescreen and dread',
    intro:
      'The 1950s pulled cinema in two directions. Hollywood went big — CinemaScope, Technicolor musicals, biblical epics — to compete with TV. Meanwhile Bergman, Kurosawa, and Ray were quietly producing the most interior films ever made. The decade contains everything from Vertigo to Tokyo Story.',
  },
  '1960s': {
    headline: 'The international new wave',
    intro:
      'Every national cinema seemed to wake up at once: French New Wave, British kitchen sink, Czech New Wave, Cinema Novo in Brazil. Hollywood\'s old order was dying. By the end of the decade, the New Hollywood was already arriving in Easy Rider and The Wild Bunch.',
  },
  '1970s': {
    headline: 'The decade nobody beats',
    intro:
      'Most cinephiles will tell you the 1970s are unmatched: The Godfather, Chinatown, Taxi Driver, Apocalypse Now, plus the entirety of New German Cinema. The studios briefly let directors do whatever they wanted, and what they did was make the canon. The party ends with Heaven\'s Gate.',
  },
  '1980s': {
    headline: 'High concept and high art',
    intro:
      'The blockbuster era began in earnest — Lucas, Spielberg, the rise of the franchise. But Kieślowski, Wong Kar-wai\'s early work, and Lynch were also building reputations. The 1980s in the canon is split between popular megaliths and the films cinephiles bring up to make a point.',
  },
  '1990s': {
    headline: 'Indie boom',
    intro:
      'Sundance, Miramax, the cheap availability of 16mm, the arrival of Tarantino, Anderson, the Coens at full strength. Outside the U.S.: Iranian cinema (Kiarostami), the Dogme 95 manifesto, the heyday of Hong Kong action. The 1990s feel like the last decade you could discover something on VHS.',
  },
  '2000s': {
    headline: 'Digital arrives',
    intro:
      'The 2000s are where digital cinema replaced film, where DVDs killed the second-run theatre, where peer-to-peer made cinephilia global. Korean cinema explodes, Mexican directors take over Hollywood, Pixar redefines what an animated feature can be. Bicentennially-curated and overstuffed.',
  },
  '2010s': {
    headline: 'Streaming, and the long tail',
    intro:
      'The decade streaming made cinephilia global, where Korean cinema took over the conversation, where Marvel made every other studio play catch-up. Parasite, Whiplash, Mad Max: Fury Road, La La Land, Moonlight. The 2010s in the canon is the first decade where audience taste and critic taste really started to diverge — and the gap widened every year since.',
  },
  '2020s': {
    headline: 'Mid-decade, and the canon is still settling',
    intro:
      'The 2020s are still in motion — five years of films, a global pandemic that reshaped distribution, the return of the auteur to multiplex programming. Everything Everywhere All At Once, Oppenheimer, Past Lives, Anatomy of a Fall, Sinners. This list will be wrong in a year and we\'ll fix it. Watch it grow.',
  },
};

export function decadeKeyForYear(y: number): keyof typeof DECADE_COPY | null {
  const d = Math.floor(y / 10) * 10;
  const k = `${d}s`;
  return (k in DECADE_COPY ? (k as keyof typeof DECADE_COPY) : null);
}
