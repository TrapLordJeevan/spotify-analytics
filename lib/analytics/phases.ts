import { Play, Phase } from '@/types';
import { aggregateByMonth } from '../aggregators';

export function detectPhases(plays: Play[], threshold: number = 5): Phase[] {
  // Group plays by artist
  const artistPlays = new Map<string, Play[]>();
  
  for (const play of plays) {
    if (!play.artistName || play.contentType !== 'music') continue;
    
    const current = artistPlays.get(play.artistName) || [];
    artistPlays.set(play.artistName, [...current, play]);
  }
  
  const phases: Phase[] = [];
  
  for (const [artistName, artistPlayList] of artistPlays.entries()) {
    // Aggregate by month for this artist
    const monthlyData = aggregateByMonth(artistPlayList);
    
    // Calculate total listening time for this artist
    const totalArtistMinutes = artistPlayList.reduce((sum, play) => sum + play.msPlayed / 60000, 0);
    
    // Calculate total listening time per month (all music)
    const allMusicPlays = plays.filter((p) => p.contentType === 'music');
    const allMonthlyData = aggregateByMonth(allMusicPlays);
    
    // Find consecutive months where artist exceeds threshold percentage
    const sortedMonths = Array.from(monthlyData.entries())
      .map(([key, minutes]) => {
        const [year, month] = key.split('-').map(Number);
        const allMinutes = allMonthlyData.get(key) || 1; // Avoid division by zero
        const percentage = (minutes / allMinutes) * 100;
        return { year, month, minutes, percentage, key };
      })
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });
    
    // Find phases (consecutive months above threshold)
    let phaseStart: { year: number; month: number } | null = null;
    let phaseEnd: { year: number; month: number } | null = null;
    let phaseIntensity = 0;
    
    for (let i = 0; i < sortedMonths.length; i++) {
      const month = sortedMonths[i];
      
      if (month.percentage >= threshold) {
        if (!phaseStart) {
          phaseStart = { year: month.year, month: month.month };
        }
        phaseEnd = { year: month.year, month: month.month };
        phaseIntensity = Math.max(phaseIntensity, month.percentage);
      } else {
        // End of potential phase
        if (phaseStart && phaseEnd) {
          // Check if phase is at least 2 months
          const startDate = new Date(phaseStart.year, phaseStart.month - 1);
          const endDate = new Date(phaseEnd.year, phaseEnd.month - 1);
          const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                            (endDate.getMonth() - startDate.getMonth()) + 1;
          
          if (monthsDiff >= 2) {
            phases.push({
              artistName,
              startMonth: phaseStart,
              endMonth: phaseEnd,
              intensity: phaseIntensity,
            });
          }
        }
        phaseStart = null;
        phaseEnd = null;
        phaseIntensity = 0;
      }
    }
    
    // Handle phase that extends to the end
    if (phaseStart && phaseEnd) {
      const startDate = new Date(phaseStart.year, phaseStart.month - 1);
      const endDate = new Date(phaseEnd.year, phaseEnd.month - 1);
      const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                        (endDate.getMonth() - startDate.getMonth()) + 1;
      
      if (monthsDiff >= 2) {
        phases.push({
          artistName,
          startMonth: phaseStart,
          endMonth: phaseEnd,
          intensity: phaseIntensity,
        });
      }
    }
  }
  
  // Sort by intensity and return top phases
  return phases
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, 5);
}




