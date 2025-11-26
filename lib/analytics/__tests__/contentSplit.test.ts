import { getContentSplit } from '../contentSplit';
import { multiYearPlays } from '@/tests/fixtures/plays';

describe('contentSplit analytics', () => {
  it('splits music vs podcast minutes per year', () => {
    const split = getContentSplit(multiYearPlays);
    const in2023 = split.find((entry) => entry.year === 2023);

    expect(split.map((entry) => entry.year)).toEqual([2021, 2022, 2023]);
    expect(in2023?.musicMinutes).toBeGreaterThan(in2023?.podcastMinutes || 0);
    expect(in2023?.musicPercentage).toBeGreaterThan(70);
    expect(in2023?.podcastPercentage).toBeLessThan(30);
  });
});
