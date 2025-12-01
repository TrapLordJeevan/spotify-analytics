import { Play, Rediscovery } from '@/types';

export function detectRediscoveries(plays: Play[], minGapMonths: number = 6): Rediscovery[] {
  // Group plays by artist
  const artistPlays = new Map<string, Play[]>();
  
  for (const play of plays) {
    if (!play.artistName || play.contentType !== 'music') continue;
    
    const current = artistPlays.get(play.artistName) || [];
    artistPlays.set(play.artistName, [...current, play]);
  }
  
  const rediscoveries: Rediscovery[] = [];
  
  for (const [artistName, artistPlayList] of artistPlays.entries()) {
    if (artistPlayList.length < 2) continue;
    
    // Sort plays by timestamp
    const sorted = [...artistPlayList].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Find gaps between listening periods
    // A listening period is consecutive days with plays
    const periods: Array<{ start: Date; end: Date }> = [];
    let currentPeriodStart: Date | null = null;
    let currentPeriodEnd: Date | null = null;
    
    for (let i = 0; i < sorted.length; i++) {
      const play = sorted[i];
      const playDate = new Date(play.timestamp);
      playDate.setHours(0, 0, 0, 0);
      
      if (!currentPeriodStart) {
        currentPeriodStart = playDate;
        currentPeriodEnd = playDate;
      } else {
        const daysDiff = Math.floor((playDate.getTime() - currentPeriodEnd!.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 30) {
          // Within same period (30 day threshold)
          currentPeriodEnd = playDate;
        } else {
          // New period
          periods.push({ start: currentPeriodStart, end: currentPeriodEnd! });
          currentPeriodStart = playDate;
          currentPeriodEnd = playDate;
        }
      }
    }
    
    // Add last period
    if (currentPeriodStart && currentPeriodEnd) {
      periods.push({ start: currentPeriodStart, end: currentPeriodEnd });
    }
    
    // Find gaps between periods
    for (let i = 1; i < periods.length; i++) {
      const prevPeriod = periods[i - 1];
      const currPeriod = periods[i];
      
      const gapMonths = (currPeriod.start.getFullYear() - prevPeriod.end.getFullYear()) * 12 +
                       (currPeriod.start.getMonth() - prevPeriod.end.getMonth());
      
      if (gapMonths >= minGapMonths) {
        // Check if there's significant listening after the gap
        const postGapPlays = artistPlayList.filter((play) => 
          play.timestamp >= currPeriod.start
        );
        const postGapMinutes = postGapPlays.reduce((sum, play) => sum + play.msPlayed / 60000, 0);
        
        if (postGapMinutes >= 30) { // At least 30 minutes after rediscovery
          rediscoveries.push({
            artistName,
            gapMonths,
            rediscoveryDate: currPeriod.start,
            previousPeriodEnd: prevPeriod.end,
          });
        }
      }
    }
  }
  
  // Sort by gap size and return top rediscoveries
  return rediscoveries
    .sort((a, b) => b.gapMonths - a.gapMonths)
    .slice(0, 10);
}





