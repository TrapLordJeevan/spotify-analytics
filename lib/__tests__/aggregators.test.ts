import {
  aggregateByArtist,
  aggregateByDay,
  aggregateByHour,
  aggregateByMonth,
  aggregateByTrack,
  aggregateByYear,
} from '../aggregators';
import { singleAccountPlays, multiYearPlays } from '@/tests/fixtures/plays';

describe('aggregators', () => {
  it('aggregates by day respecting metric', () => {
    const plays = singleAccountPlays.slice(0, 2);
    const minutesMap = aggregateByDay(plays, 'minutes');
    const playsMap = aggregateByDay(plays, 'plays');

    expect(minutesMap.get('2023-01-01')).toBeCloseTo(3); // 180000ms
    expect(minutesMap.get('2023-01-02')).toBeCloseTo(4); // 240000ms
    expect(playsMap.get('2023-01-01')).toBe(1);
  });

  it('aggregates by month and year', () => {
    const monthMap = aggregateByMonth(singleAccountPlays, 'minutes');
    const yearMap = aggregateByYear(multiYearPlays, 'minutes');

    expect(monthMap.get('2023-02')).toBeCloseTo(7); // 5 + 2 minutes
    expect(yearMap.get(2021)).toBeCloseTo(4);
    expect(yearMap.get(2023)).toBeGreaterThan(yearMap.get(2022)!);
  });

  it('aggregates by hour', () => {
    const hourMap = aggregateByHour(singleAccountPlays, 'minutes');
    const firstHour = singleAccountPlays[0].timestamp.getHours();
    const secondHour = singleAccountPlays[1].timestamp.getHours();

    expect(hourMap.get(firstHour)).toBeCloseTo(3);
    expect(hourMap.get(secondHour)).toBeCloseTo(4);
  });

  it('aggregates by artist', () => {
    const artistMap = aggregateByArtist(singleAccountPlays);
    const taylor = artistMap.get('Taylor Swift');
    const beatles = artistMap.get('The Beatles');

    expect(taylor?.minutes).toBeCloseTo(7);
    expect(taylor?.count).toBe(2);
    expect(beatles?.minutes).toBeCloseTo(5);
  });

  it('aggregates by track', () => {
    const trackMap = aggregateByTrack(singleAccountPlays);
    const key = 'Taylor Swift|||Anti-Hero';
    const track = trackMap.get(key);

    expect(track?.trackName).toBe('Anti-Hero');
    expect(track?.minutes).toBeCloseTo(4);
    expect(track?.count).toBe(1);
  });
});
