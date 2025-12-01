import { Play, TopSong, TopArtist, TopAlbum } from '@/types';
import { aggregateByMonth } from '../aggregators';

type Metric = 'minutes' | 'plays';

const metricValue = (minutes: number, count: number, metric: Metric) =>
  metric === 'minutes' ? minutes : count;

export function getTopSongs(plays: Play[], limit: number = 25, metric: Metric = 'minutes'): TopSong[] {
  const trackMap = new Map<string, { trackName: string; artistName: string; minutes: number; count: number }>();
  
  for (const play of plays) {
    // Only process music plays
    if (play.contentType !== 'music') continue;
    // Require both trackName and artistName
    if (!play.trackName || !play.artistName) continue;
    
    const key = `${play.artistName}|||${play.trackName}`;
    const current = trackMap.get(key) || { trackName: play.trackName, artistName: play.artistName, minutes: 0, count: 0 };
    trackMap.set(key, {
      ...current,
      minutes: current.minutes + play.msPlayed / 60000,
      count: current.count + 1,
    });
  }
  
  const totalMetric = Array.from(trackMap.values()).reduce(
    (sum, item) => sum + metricValue(item.minutes, item.count, metric),
    0
  );
  
  return Array.from(trackMap.entries())
    .map(([, data]) => ({
      trackName: data.trackName,
      artistName: data.artistName,
      minutes: Math.round(data.minutes),
      percentage:
        totalMetric > 0
          ? (metricValue(data.minutes, data.count, metric) / totalMetric) * 100
          : 0,
      playCount: data.count,
    }))
    .sort(
      (a, b) =>
        metricValue(b.minutes, b.playCount, metric) -
        metricValue(a.minutes, a.playCount, metric)
    )
    .slice(0, limit);
}

export function getTopArtists(plays: Play[], limit: number = 25, metric: Metric = 'minutes'): TopArtist[] {
  const artistMap = new Map<string, { minutes: number; count: number; plays: Play[] }>();
  
  for (const play of plays) {
    if (!play.artistName) continue;
    
    const current = artistMap.get(play.artistName) || { minutes: 0, count: 0, plays: [] };
    artistMap.set(play.artistName, {
      minutes: current.minutes + play.msPlayed / 60000,
      count: current.count + 1,
      plays: [...current.plays, play],
    });
  }
  
  const totalMetric = Array.from(artistMap.values()).reduce(
    (sum, item) => sum + metricValue(item.minutes, item.count, metric),
    0
  );
  
  const artists = Array.from(artistMap.entries())
    .map(([artistName, data]) => {
      // Calculate peak month
      const monthlyData = aggregateByMonth(data.plays);
      let peakMonth: { year: number; month: number } | undefined;
      let peakMinutes = 0;
      
      for (const [key, minutes] of monthlyData.entries()) {
        if (minutes > peakMinutes) {
          peakMinutes = minutes;
          const [year, month] = key.split('-').map(Number);
          peakMonth = { year, month };
        }
      }
      
      return {
        artistName,
        minutes: Math.round(data.minutes),
        percentage:
          totalMetric > 0
            ? (metricValue(data.minutes, data.count, metric) / totalMetric) * 100
            : 0,
        playCount: data.count,
        peakMonth,
      };
    })
    .sort(
      (a, b) =>
        metricValue(b.minutes, b.playCount, metric) -
        metricValue(a.minutes, a.playCount, metric)
    )
    .slice(0, limit);
  
  return artists;
}

export function getTopEpisodes(
  plays: Play[],
  limit: number = 25,
  metric: Metric = 'minutes'
): Array<{ episodeName: string; showName: string; minutes: number; percentage: number; playCount: number }> {
  const episodeMap = new Map<string, { episodeName: string; showName: string; minutes: number; count: number }>();
  
  for (const play of plays) {
    // Only process podcast plays
    if (play.contentType !== 'podcast') continue;
    if (!play.trackName) continue; // For podcasts, trackName is episode name
    
    // Try to extract show name from artistName or use a fallback
    const showName = play.artistName || 'Unknown Show';
    const key = `${showName}|||${play.trackName}`;
    
    const current = episodeMap.get(key) || { episodeName: play.trackName, showName, minutes: 0, count: 0 };
    episodeMap.set(key, {
      ...current,
      minutes: current.minutes + play.msPlayed / 60000,
      count: current.count + 1,
    });
  }
  
  const totalMetric = Array.from(episodeMap.values()).reduce(
    (sum, item) => sum + metricValue(item.minutes, item.count, metric),
    0
  );
  
  return Array.from(episodeMap.entries())
    .map(([, data]) => ({
      episodeName: data.episodeName,
      showName: data.showName,
      minutes: Math.round(data.minutes),
      percentage:
        totalMetric > 0
          ? (metricValue(data.minutes, data.count, metric) / totalMetric) * 100
          : 0,
      playCount: data.count,
    }))
    .sort(
      (a, b) =>
        metricValue(b.minutes, b.playCount, metric) -
        metricValue(a.minutes, a.playCount, metric)
    )
    .slice(0, limit);
}

export function getTopSkippedSongs(
  plays: Play[],
  limit: number = 100
): Array<{ trackName: string; artistName: string; skipCount: number; totalPlays: number; skipRate: number }> {
  const map = new Map<
    string,
    { trackName: string; artistName: string; skipCount: number; totalPlays: number }
  >();

  for (const play of plays) {
    if (play.contentType !== 'music') continue;
    if (!play.trackName || !play.artistName) continue;
    const key = `${play.artistName}|||${play.trackName}`;
    const current = map.get(key) || {
      trackName: play.trackName,
      artistName: play.artistName,
      skipCount: 0,
      totalPlays: 0,
    };
    map.set(key, {
      ...current,
      skipCount: current.skipCount + (play.skipped ? 1 : 0),
      totalPlays: current.totalPlays + 1,
    });
  }

  return Array.from(map.values())
    .filter((entry) => entry.skipCount > 0)
    .map((entry) => ({
      ...entry,
      skipRate: entry.totalPlays > 0 ? (entry.skipCount / entry.totalPlays) * 100 : 0,
    }))
    .sort((a, b) => b.skipCount - a.skipCount || b.skipRate - a.skipRate)
    .slice(0, limit);
}

export function getTopAlbums(plays: Play[], limit: number = 50, metric: Metric = 'minutes'): TopAlbum[] {
  const albumMap = new Map<string, { albumName: string; artistName: string; minutes: number; count: number }>();

  for (const play of plays) {
    if (play.contentType !== 'music') continue;
    if (!play.albumName || !play.artistName) continue;
    const key = `${play.artistName}|||${play.albumName}`;
    const current = albumMap.get(key) || { albumName: play.albumName, artistName: play.artistName, minutes: 0, count: 0 };
    albumMap.set(key, {
      ...current,
      minutes: current.minutes + play.msPlayed / 60000,
      count: current.count + 1,
    });
  }

  const totalMetric = Array.from(albumMap.values()).reduce(
    (sum, item) => sum + metricValue(item.minutes, item.count, metric),
    0
  );

  return Array.from(albumMap.entries())
    .map(([, data]) => ({
      albumName: data.albumName,
      artistName: data.artistName,
      minutes: Math.round(data.minutes),
      playCount: data.count,
      percentage:
        totalMetric > 0
          ? (metricValue(data.minutes, data.count, metric) / totalMetric) * 100
          : 0,
    }))
    .sort(
      (a, b) =>
        metricValue(b.minutes, b.playCount, metric) -
        metricValue(a.minutes, a.playCount, metric)
    )
    .slice(0, limit);
}

