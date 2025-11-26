import { getGenreEvolution, getTopGenres } from '../genres';
import { singleAccountPlays, multiYearPlays } from '@/tests/fixtures/plays';

describe('genre analytics', () => {
  it('ranks top genres for music plays', () => {
    const genres = getTopGenres(singleAccountPlays, 'minutes');

    expect(genres[0].genre).toBe('Pop'); // Taylor Swift dominates minutes
    expect(genres.find((g) => g.genre === 'Podcast')).toBeUndefined();
  });

  it('builds yearly genre evolution', () => {
    const evolution = getGenreEvolution(multiYearPlays);
    const year2021 = evolution.find((entry) => entry.year === 2021);

    expect(evolution[0].year).toBe(2021);
    expect(year2021?.genres[0].genre).toBe('Pop');
    expect(year2021?.genres[0].percentage).toBeCloseTo(100);
  });
});
