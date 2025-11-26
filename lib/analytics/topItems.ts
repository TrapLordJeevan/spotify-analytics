import { Play, TopSong, TopArtist } from '@/types';
import { aggregateByMonth } from '../aggregators';

export function getTopSongs(plays: Play[], limit: number = 25): TopSong[] {
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
  
  const totalMinutes = Array.from(trackMap.values()).reduce((sum, item) => sum + item.minutes, 0);
  
  return Array.from(trackMap.entries())
    .map(([key, data]) => ({
      trackName: data.trackName,
      artistName: data.artistName,
      minutes: Math.round(data.minutes),
      percentage: totalMinutes > 0 ? (data.minutes / totalMinutes) * 100 : 0,
      playCount: data.count,
    }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, limit);
}

export function getTopArtists(plays: Play[], limit: number = 25): TopArtist[] {
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
  
  const totalMinutes = Array.from(artistMap.values()).reduce((sum, item) => sum + item.minutes, 0);
  
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
        percentage: totalMinutes > 0 ? (data.minutes / totalMinutes) * 100 : 0,
        playCount: data.count,
        peakMonth,
      };
    })
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, limit);
  
  return artists;
}

export function getTopEpisodes(plays: Play[], limit: number = 25): Array<{ episodeName: string; showName: string; minutes: number; percentage: number; playCount: number }> {
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
  
  const totalMinutes = Array.from(episodeMap.values()).reduce((sum, item) => sum + item.minutes, 0);
  
  return Array.from(episodeMap.entries())
    .map(([key, data]) => ({
      episodeName: data.episodeName,
      showName: data.showName,
      minutes: Math.round(data.minutes),
      percentage: totalMinutes > 0 ? (data.minutes / totalMinutes) * 100 : 0,
      playCount: data.count,
    }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, limit);
}




