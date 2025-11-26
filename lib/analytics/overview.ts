import { Play, TopSong, TopArtist, StreakData } from '@/types';
import { aggregateByDay, aggregateByYear } from '../aggregators';

export function calculateTotalListeningTime(plays: Play[]): number {
  const totalMs = plays.reduce((sum, play) => sum + play.msPlayed, 0);
  return Math.round(totalMs / 60000 / 60); // Convert to hours
}

export function calculateTotalPlays(plays: Play[]): number {
  return plays.length;
}

export function getTopSongs(plays: Play[], limit: number = 5): TopSong[] {
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

export function getTopArtists(plays: Play[], limit: number = 5): TopArtist[] {
  const artistMap = new Map<string, { minutes: number; count: number }>();
  
  for (const play of plays) {
    // Filter by content type - for artists, include both music and podcast
    // (but we can filter by contentType in the calling code if needed)
    if (!play.artistName) continue;
    
    const current = artistMap.get(play.artistName) || { minutes: 0, count: 0 };
    artistMap.set(play.artistName, {
      minutes: current.minutes + play.msPlayed / 60000,
      count: current.count + 1,
    });
  }
  
  const totalMinutes = Array.from(artistMap.values()).reduce((sum, item) => sum + item.minutes, 0);
  
  return Array.from(artistMap.entries())
    .map(([artistName, data]) => ({
      artistName,
      minutes: Math.round(data.minutes),
      percentage: totalMinutes > 0 ? (data.minutes / totalMinutes) * 100 : 0,
      playCount: data.count,
    }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, limit);
}

export function getGoldenYear(plays: Play[]): number | null {
  const yearlyData = aggregateByYear(plays);
  if (yearlyData.size === 0) return null;
  
  let maxYear = 0;
  let maxMinutes = 0;
  
  for (const [year, minutes] of yearlyData.entries()) {
    if (minutes > maxMinutes) {
      maxMinutes = minutes;
      maxYear = year;
    }
  }
  
  return maxYear;
}

export function getPeakDay(plays: Play[]): Date | null {
  const dailyData = aggregateByDay(plays);
  if (dailyData.size === 0) return null;
  
  let maxDate = '';
  let maxMinutes = 0;
  
  for (const [date, minutes] of dailyData.entries()) {
    if (minutes > maxMinutes) {
      maxMinutes = minutes;
      maxDate = date;
    }
  }
  
  return maxDate ? new Date(maxDate) : null;
}

export function calculateStreaks(plays: Play[]): StreakData {
  const dailyData = aggregateByDay(plays);
  if (dailyData.size === 0) {
    return { longestStreak: 0, currentStreak: 0 };
  }
  
  // Get all dates with at least 1 minute of listening
  const listeningDays = new Set<string>();
  for (const [date, minutes] of dailyData.entries()) {
    if (minutes >= 1) {
      listeningDays.add(date);
    }
  }
  
  if (listeningDays.size === 0) {
    return { longestStreak: 0, currentStreak: 0 };
  }
  
  // Sort dates
  const sortedDates = Array.from(listeningDays).sort();
  
  // Calculate longest streak
  let longestStreak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    const daysDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  
  // Calculate current streak (from last listening day backwards)
  let currentStreakFromEnd = 1;
  const lastDate = new Date(sortedDates[sortedDates.length - 1]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if last listening day is today or yesterday
  const lastDateNormalized = new Date(lastDate);
  lastDateNormalized.setHours(0, 0, 0, 0);
  const daysSinceLastListen = Math.floor((today.getTime() - lastDateNormalized.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSinceLastListen > 1) {
    // Streak is broken
    currentStreakFromEnd = 0;
  } else {
    // Count backwards from last date
    for (let i = sortedDates.length - 2; i >= 0; i--) {
      const currDate = new Date(sortedDates[i + 1]);
      const prevDate = new Date(sortedDates[i]);
      const daysDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        currentStreakFromEnd++;
      } else {
        break;
      }
    }
  }
  
  return {
    longestStreak,
    currentStreak: currentStreakFromEnd,
    lastListeningDate: lastDate,
  };
}




