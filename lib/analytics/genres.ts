import { Play, TopGenre, GenreEvolution } from '@/types';
import { getGenreForArtist } from '../genreMapper';
import { aggregateByYear } from '../aggregators';

type Metric = 'minutes' | 'plays';

const metricValue = (minutes: number, count: number, metric: Metric) =>
  metric === 'minutes' ? minutes : count;

export function getTopGenres(plays: Play[], metric: Metric = 'minutes'): TopGenre[] {
  const genreMap = new Map<string, { minutes: number; count: number }>();
  
  for (const play of plays) {
    if (play.contentType !== 'music') continue; // Only music has genres
    
    const genre = getGenreForArtist(play.artistId, play.artistName);
    const current = genreMap.get(genre) || { minutes: 0, count: 0 };
    genreMap.set(genre, {
      minutes: current.minutes + play.msPlayed / 60000,
      count: current.count + 1,
    });
  }
  
  const totalMetric = Array.from(genreMap.values()).reduce(
    (sum, entry) => sum + metricValue(entry.minutes, entry.count, metric),
    0
  );
  
  return Array.from(genreMap.entries())
    .map(([genre, entry]) => ({
      genre,
      minutes: Math.round(entry.minutes),
      playCount: entry.count,
      percentage:
        totalMetric > 0
          ? (metricValue(entry.minutes, entry.count, metric) / totalMetric) * 100
          : 0,
    }))
    .sort(
      (a, b) =>
        metricValue(b.minutes, b.playCount || 0, metric) -
        metricValue(a.minutes, a.playCount || 0, metric)
    );
}

export function getGenreEvolution(plays: Play[]): GenreEvolution[] {
  const yearlyData = aggregateByYear(plays);
  const result: GenreEvolution[] = [];
  
  for (const [year, yearPlays] of Array.from(yearlyData.entries()).map(([year]) => {
    const yearPlays = plays.filter((play) => play.timestamp.getFullYear() === year);
    return [year, yearPlays] as [number, Play[]];
  })) {
    const genreMap = new Map<string, number>();
    
    for (const play of yearPlays) {
      if (play.contentType !== 'music') continue;
      
      const genre = getGenreForArtist(play.artistId, play.artistName);
      const current = genreMap.get(genre) || 0;
      genreMap.set(genre, current + play.msPlayed / 60000);
    }
    
    const totalMinutes = Array.from(genreMap.values()).reduce((sum, minutes) => sum + minutes, 0);
    
    const genres = Array.from(genreMap.entries())
      .map(([genre, minutes]) => ({
        genre,
        percentage: totalMinutes > 0 ? (minutes / totalMinutes) * 100 : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage);
    
    result.push({
      year,
      genres,
    });
  }
  
  return result.sort((a, b) => a.year - b.year);
}




