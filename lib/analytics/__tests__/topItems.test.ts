import {
  getTopAlbums,
  getTopArtists,
  getTopEpisodes,
  getTopSkippedSongs,
  getTopSongs,
} from '../topItems';
import { multiYearPlays } from '@/tests/fixtures/plays';

describe('topItems analytics', () => {
  it('returns top songs with percentages by metric', () => {
    const songsByMinutes = getTopSongs(multiYearPlays, 3, 'minutes');
    expect(songsByMinutes[0].trackName).toBe('Phase Two'); // longest single listen

    const songsByPlays = getTopSongs(multiYearPlays, 3, 'plays');
    expect(songsByPlays[0].trackName).toBe('Return Single'); // played twice
    expect(songsByPlays[0].playCount).toBe(2);
  });

  it('returns top artists with peak months', () => {
    const artists = getTopArtists(multiYearPlays, 10, 'minutes');
    const phase = artists.find((artist) => artist.artistName === 'Phase Artist');

    expect(artists[0].artistName).toBe('Taylor Swift');
    expect(phase?.peakMonth).toEqual({ year: 2022, month: 4 });
  });

  it('returns podcast episodes as top episodes', () => {
    const episodes = getTopEpisodes(multiYearPlays, 5, 'minutes');
    const showNames = episodes.map((ep) => ep.showName);

    expect(showNames).toContain('News Daily');
    expect(episodes[0].minutes).toBeGreaterThan(1);
  });

  it('returns skipped songs ordered by skip count', () => {
    const skipped = getTopSkippedSongs(multiYearPlays, 5);
    const comeback = skipped.find((item) => item.trackName === 'Return Single');

    expect(comeback?.skipCount).toBe(1);
    expect(comeback?.skipRate).toBeCloseTo(50);
  });

  it('returns top albums', () => {
    const albums = getTopAlbums(multiYearPlays, 5, 'minutes');
    const midnights = albums.find((album) => album.albumName === 'Midnights');

    expect(midnights?.artistName).toBe('Taylor Swift');
    expect(albums.length).toBeGreaterThan(1);
  });
});
