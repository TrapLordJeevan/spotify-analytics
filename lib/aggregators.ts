import { Play } from '@/types';

type Metric = 'minutes' | 'plays';

const metricValue = (play: Play, metric: Metric) =>
  metric === 'minutes' ? play.msPlayed / 60000 : 1;

/**
 * Aggregate plays by day
 */
export function aggregateByDay(plays: Play[], metric: Metric = 'minutes'): Map<string, number> {
  const map = new Map<string, number>();
  
  for (const play of plays) {
    const dateKey = play.timestamp.toISOString().split('T')[0];
    const current = map.get(dateKey) || 0;
    map.set(dateKey, current + metricValue(play, metric));
  }
  
  return map;
}

/**
 * Aggregate plays by month
 */
export function aggregateByMonth(plays: Play[], metric: Metric = 'minutes'): Map<string, number> {
  const map = new Map<string, number>();
  
  for (const play of plays) {
    const year = play.timestamp.getFullYear();
    const month = play.timestamp.getMonth() + 1;
    const key = `${year}-${month.toString().padStart(2, '0')}`;
    const current = map.get(key) || 0;
    map.set(key, current + metricValue(play, metric));
  }
  
  return map;
}

/**
 * Aggregate plays by year
 */
export function aggregateByYear(plays: Play[], metric: Metric = 'minutes'): Map<number, number> {
  const map = new Map<number, number>();
  
  for (const play of plays) {
    const year = play.timestamp.getFullYear();
    const current = map.get(year) || 0;
    map.set(year, current + metricValue(play, metric));
  }
  
  return map;
}

/**
 * Aggregate plays by hour of day
 */
export function aggregateByHour(plays: Play[], metric: Metric = 'minutes'): Map<number, number> {
  const map = new Map<number, number>();
  
  for (const play of plays) {
    const hour = play.timestamp.getHours();
    const current = map.get(hour) || 0;
    map.set(hour, current + metricValue(play, metric));
  }
  
  return map;
}

/**
 * Aggregate plays by artist
 */
export function aggregateByArtist(plays: Play[]): Map<string, { minutes: number; count: number }> {
  const map = new Map<string, { minutes: number; count: number }>();
  
  for (const play of plays) {
    if (!play.artistName) continue;
    
    const current = map.get(play.artistName) || { minutes: 0, count: 0 };
    map.set(play.artistName, {
      minutes: current.minutes + play.msPlayed / 60000,
      count: current.count + 1,
    });
  }
  
  return map;
}

/**
 * Aggregate plays by track
 */
export function aggregateByTrack(plays: Play[]): Map<string, { trackName: string; artistName: string; minutes: number; count: number }> {
  const map = new Map<string, { trackName: string; artistName: string; minutes: number; count: number }>();
  
  for (const play of plays) {
    if (!play.trackName || !play.artistName) continue;
    
    const key = `${play.artistName}|||${play.trackName}`;
    const current = map.get(key) || { trackName: play.trackName, artistName: play.artistName, minutes: 0, count: 0 };
    map.set(key, {
      ...current,
      minutes: current.minutes + play.msPlayed / 60000,
      count: current.count + 1,
    });
  }
  
  return map;
}



