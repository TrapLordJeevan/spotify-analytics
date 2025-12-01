import { Play, TimeOfDayData, MonthlyData, YearlyData } from '@/types';
import { aggregateByHour, aggregateByMonth, aggregateByYear, aggregateByDay } from '../aggregators';

type Metric = 'minutes' | 'plays';

export function getTimeOfDayData(plays: Play[], metric: Metric = 'minutes'): TimeOfDayData[] {
  const hourlyData = aggregateByHour(plays, metric);
  const result: TimeOfDayData[] = [];
  
  for (let hour = 0; hour < 24; hour++) {
    result.push({
      hour,
      minutes: Math.round(hourlyData.get(hour) || 0),
    });
  }
  
  return result;
}

export function getMonthlyData(plays: Play[], metric: Metric = 'minutes'): MonthlyData[] {
  const monthlyData = aggregateByMonth(plays, metric);
  const result: MonthlyData[] = [];
  
  for (const [key, minutes] of monthlyData.entries()) {
    const [year, month] = key.split('-').map(Number);
    result.push({
      year,
      month,
      minutes: Math.round(minutes),
    });
  }
  
  return result.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });
}

export function getYearlyData(plays: Play[], metric: Metric = 'minutes'): YearlyData[] {
  const yearlyData = aggregateByYear(plays, metric);
  const result: YearlyData[] = [];
  
  for (const [year, minutes] of yearlyData.entries()) {
    result.push({
      year,
      minutes: Math.round(minutes),
    });
  }

  return result.sort((a, b) => a.year - b.year);
}

export function getDailyData(
  plays: Play[],
  year?: number,
  month?: number,
  metric: Metric = 'minutes'
): Array<{ date: Date; minutes: number }> {
  let filtered = plays;
  
  if (year !== undefined && month !== undefined) {
    filtered = plays.filter((play) => {
      const playDate = play.timestamp;
      return playDate.getFullYear() === year && playDate.getMonth() + 1 === month;
    });
  }
  
  const dailyData = aggregateByDay(filtered, metric);
  const result: Array<{ date: Date; minutes: number }> = [];
  
  for (const [dateStr, minutes] of dailyData.entries()) {
    result.push({
      date: new Date(dateStr),
      minutes: Math.round(minutes),
    });
  }
  
  return result.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function getPeakHour(plays: Play[], metric: Metric = 'minutes'): number | null {
  const hourlyData = aggregateByHour(plays, metric);
  if (hourlyData.size === 0) return null;
  
  let maxHour = 0;
  let maxMinutes = 0;
  
  for (const [hour, minutes] of hourlyData.entries()) {
    if (minutes > maxMinutes) {
      maxMinutes = minutes;
      maxHour = hour;
    }
  }
  
  return maxHour;
}

export function getTimeOfDaySummary(plays: Play[], metric: Metric = 'minutes'): string {
  const hourlyData = aggregateByHour(plays, metric);
  if (hourlyData.size === 0) return 'No listening data';
  
  // Find the hour range with most listening
  const hours: number[] = [];
  for (let hour = 0; hour < 24; hour++) {
    if (hourlyData.get(hour) && hourlyData.get(hour)! > 0) {
      hours.push(hour);
    }
  }
  
  if (hours.length === 0) return 'No listening data';
  
  const sortedHours = hours.sort((a, b) => (hourlyData.get(b) || 0) - (hourlyData.get(a) || 0));
  const topHours = sortedHours.slice(0, 3);
  const minHour = Math.min(...topHours);
  const maxHour = Math.max(...topHours);
  
  const formatHour = (h: number) => `${h.toString().padStart(2, '0')}:00`;
  
  if (minHour === maxHour) {
    return `You mostly listen at ${formatHour(minHour)}.`;
  } else {
    return `You mostly listen between ${formatHour(minHour)} and ${formatHour(maxHour)}.`;
  }
}




