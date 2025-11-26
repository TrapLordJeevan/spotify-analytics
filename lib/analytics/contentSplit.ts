import { Play, ContentSplit } from '@/types';
import { aggregateByYear } from '../aggregators';

export function getContentSplit(plays: Play[]): ContentSplit[] {
  const yearlyData = aggregateByYear(plays);
  const result: ContentSplit[] = [];
  
  for (const year of Array.from(yearlyData.keys())) {
    const yearPlays = plays.filter((play) => play.timestamp.getFullYear() === year);
    
    let musicMinutes = 0;
    let podcastMinutes = 0;
    
    for (const play of yearPlays) {
      const minutes = play.msPlayed / 60000;
      if (play.contentType === 'music') {
        musicMinutes += minutes;
      } else if (play.contentType === 'podcast') {
        podcastMinutes += minutes;
      }
    }
    
    const totalMinutes = musicMinutes + podcastMinutes;
    
    result.push({
      year,
      musicMinutes: Math.round(musicMinutes),
      podcastMinutes: Math.round(podcastMinutes),
      musicPercentage: totalMinutes > 0 ? (musicMinutes / totalMinutes) * 100 : 0,
      podcastPercentage: totalMinutes > 0 ? (podcastMinutes / totalMinutes) * 100 : 0,
    });
  }
  
  return result.sort((a, b) => a.year - b.year);
}




