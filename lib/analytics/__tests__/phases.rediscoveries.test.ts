import { detectPhases } from '../phases';
import { detectRediscoveries } from '../rediscoveries';
import { phasesAndRediscoveriesPlays } from '@/tests/fixtures/plays';

describe('phases and rediscoveries analytics', () => {
  it('detects artist phases across consecutive months', () => {
    const phases = detectPhases(phasesAndRediscoveriesPlays, 5, 'minutes');
    const phase = phases.find((p) => p.artistName === 'Phase Artist');

    expect(phase).toBeTruthy();
    expect(phase?.startMonth).toEqual({ year: 2022, month: 3 });
    expect(phase?.endMonth).toEqual({ year: 2022, month: 5 });
    expect(phase?.intensity).toBeGreaterThan(60);
  });

  it('flags rediscoveries after long gaps', () => {
    const rediscoveries = detectRediscoveries(phasesAndRediscoveriesPlays, 6);
    const comeback = rediscoveries.find((item) => item.artistName === 'Comeback Artist');

    expect(comeback).toBeTruthy();
    expect(comeback?.gapMonths).toBeGreaterThanOrEqual(12);
    expect(comeback?.rediscoveryDate.getFullYear()).toBe(2022);
    expect(comeback?.rediscoveryDate.getMonth()).toBe(0);
    expect(comeback?.rediscoveryDate.getDate()).toBe(10);
  });
});
