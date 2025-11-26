import {
  calculateStreaks,
  calculateTotalListeningTime,
  calculateTotalPlays,
  getGoldenYear,
  getPeakDay,
  getTopArtists,
  getTopSongs,
} from '../overview';
import { singleAccountPlays, multiYearPlays } from '@/tests/fixtures/plays';

describe('overview analytics', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2023-03-06T12:00:00Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('summarizes totals', () => {
    expect(calculateTotalPlays(singleAccountPlays)).toBe(5);
    expect(calculateTotalListeningTime(singleAccountPlays)).toBe(0); // rounds hours
  });

  it('computes top songs and honors metric', () => {
    const byMinutes = getTopSongs(singleAccountPlays, 3, 'minutes');
    expect(byMinutes[0].trackName).toBe('Here Comes the Sun');

    const byPlays = getTopSongs(multiYearPlays, 3, 'plays');
    expect(byPlays[0].trackName).toBe('Return Single');
    expect(byPlays[0].playCount).toBe(2);
  });

  it('computes top artists across music and podcasts', () => {
    const artists = getTopArtists(singleAccountPlays, 5, 'minutes');
    const newsDaily = artists.find((artist) => artist.artistName === 'News Daily');
    expect(artists[0].artistName).toBe('Taylor Swift');
    expect(newsDaily?.playCount).toBe(1);
  });

  it('finds golden year and peak day', () => {
    expect(getGoldenYear(multiYearPlays)).toBe(2023);
    expect(getPeakDay(singleAccountPlays)).toEqual(new Date('2023-02-01'));
  });

  it('calculates streaks based on filtered plays', () => {
    const streaks = calculateStreaks(singleAccountPlays);
    expect(streaks.longestStreak).toBe(2);
    expect(streaks.currentStreak).toBe(1);
    expect(streaks.lastListeningDate?.toISOString().slice(0, 10)).toBe('2023-03-05');
  });
});
