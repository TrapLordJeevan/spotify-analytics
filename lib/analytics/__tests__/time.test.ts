import {
  getDailyData,
  getMonthlyData,
  getPeakHour,
  getTimeOfDayData,
  getTimeOfDaySummary,
  getYearlyData,
} from '../time';
import { singleAccountPlays, multiYearPlays } from '@/tests/fixtures/plays';

describe('time analytics', () => {
  it('builds time-of-day data with full 24 hours', () => {
    const data = getTimeOfDayData(singleAccountPlays, 'minutes');
    const targetHour = singleAccountPlays[0].timestamp.getHours();
    const entry = data.find((e) => e.hour === targetHour);

    expect(data).toHaveLength(24);
    expect(entry?.minutes).toBeCloseTo(3);
  });

  it('aggregates monthly and yearly data', () => {
    const monthly = getMonthlyData(singleAccountPlays, 'minutes');
    const feb = monthly.find((entry) => entry.month === 2 && entry.year === 2023);

    expect(feb?.minutes).toBeCloseTo(7); // 5 music + 2 podcast minutes

    const yearly = getYearlyData(multiYearPlays, 'plays');
    expect(yearly.map((y) => y.year)).toEqual([2021, 2022, 2023]);
  });

  it('aggregates daily data with optional filters', () => {
    const allDays = getDailyData(singleAccountPlays);
    const febDays = getDailyData(singleAccountPlays, 2023, 2);

    expect(allDays.length).toBeGreaterThan(febDays.length);
    expect(febDays[0].date).toEqual(new Date('2023-02-01'));
  });

  it('finds peak hour and summary text', () => {
    const peak = getPeakHour(singleAccountPlays, 'minutes');
    const summary = getTimeOfDaySummary(singleAccountPlays, 'minutes');

    expect(peak).toBeGreaterThanOrEqual(0);
    expect(peak).toBeLessThan(24);
    expect(summary).toMatch(/mostly listen/);
  });
});
