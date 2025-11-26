export type ContentType = 'music' | 'podcast' | 'other';

export interface Play {
  id: string;
  timestamp: Date;
  artistName: string | null;
  trackName: string | null;
  albumName: string | null;
  spotifyUri: string | null;
  msPlayed: number;
  contentType: ContentType;
  sourceId: string;
  username?: string | null;
}

export interface Source {
  id: string;
  name: string;
  detectedUsername?: string | null;
}

export interface FilterState {
  selectedSources: string[]; // Empty array means "All accounts"
  contentType: 'music' | 'podcasts' | 'both';
  dateRange: {
    type: 'all' | 'last12' | 'last6' | 'last3' | 'custom';
    start?: Date;
    end?: Date;
  };
}

export interface TopSong {
  trackName: string;
  artistName: string;
  minutes: number;
  percentage: number;
  playCount: number;
}

export interface TopArtist {
  artistName: string;
  minutes: number;
  percentage: number;
  playCount: number;
  peakMonth?: { year: number; month: number };
}

export interface TopGenre {
  genre: string;
  minutes: number;
  percentage: number;
}

export interface GenreEvolution {
  year: number;
  genres: { genre: string; percentage: number }[];
}

export interface TimeOfDayData {
  hour: number;
  minutes: number;
}

export interface MonthlyData {
  year: number;
  month: number;
  minutes: number;
}

export interface YearlyData {
  year: number;
  minutes: number;
}

export interface StreakData {
  longestStreak: number;
  currentStreak: number;
  lastListeningDate?: Date;
}

export interface Phase {
  artistName: string;
  startMonth: { year: number; month: number };
  endMonth: { year: number; month: number };
  intensity: number; // percentage of listening during this phase
}

export interface Rediscovery {
  artistName: string;
  gapMonths: number;
  rediscoveryDate: Date;
  previousPeriodEnd: Date;
}

export interface ContentSplit {
  year: number;
  musicMinutes: number;
  podcastMinutes: number;
  musicPercentage: number;
  podcastPercentage: number;
}




