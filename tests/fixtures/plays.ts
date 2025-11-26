import { Play, Source } from '@/types';

type PlayInput = {
  id: string;
  timestamp: string;
  artistName: string | null;
  trackName: string | null;
  albumName?: string | null;
  artistId?: string | null;
  msPlayed: number;
  contentType: 'music' | 'podcast';
  sourceId: string;
  spotifyTrackUri?: string | null;
  skipped?: boolean;
};

const toPlay = (input: PlayInput): Play => ({
  id: input.id,
  timestamp: new Date(input.timestamp),
  artistName: input.artistName,
  trackName: input.trackName,
  albumName: input.albumName ?? null,
  artistId: input.artistId ?? null,
  spotifyTrackUri: input.spotifyTrackUri ?? null,
  msPlayed: input.msPlayed,
  contentType: input.contentType,
  sourceId: input.sourceId,
  skipped: input.skipped,
});

export const sources: Source[] = [
  { id: 'source-a', name: 'Main account' },
  { id: 'source-b', name: 'Alt account' },
];

/**
 * Single-account fixture concentrated in 2023 with mixed content.
 */
export const singleAccountPlays: Play[] = [
  toPlay({
    id: 'sa-1',
    timestamp: '2023-01-01T08:00:00Z',
    artistName: 'Taylor Swift',
    trackName: 'Lavender Haze',
    albumName: 'Midnights',
    artistId: 'artist-taylor',
    msPlayed: 180000,
    contentType: 'music',
    sourceId: 'source-a',
  }),
  toPlay({
    id: 'sa-2',
    timestamp: '2023-01-02T09:00:00Z',
    artistName: 'Taylor Swift',
    trackName: 'Anti-Hero',
    albumName: 'Midnights',
    artistId: 'artist-taylor',
    msPlayed: 240000,
    contentType: 'music',
    sourceId: 'source-a',
  }),
  toPlay({
    id: 'sa-3',
    timestamp: '2023-02-01T10:00:00Z',
    artistName: 'The Beatles',
    trackName: 'Here Comes the Sun',
    albumName: 'Abbey Road',
    artistId: 'artist-beatles',
    msPlayed: 300000,
    contentType: 'music',
    sourceId: 'source-a',
  }),
  toPlay({
    id: 'sa-4',
    timestamp: '2023-02-10T14:00:00Z',
    artistName: 'News Daily',
    trackName: 'Morning Briefing',
    albumName: null,
    msPlayed: 120000,
    contentType: 'podcast',
    sourceId: 'source-a',
  }),
  toPlay({
    id: 'sa-5',
    timestamp: '2023-03-05T12:00:00Z',
    artistName: 'Radiohead',
    trackName: 'Creep',
    albumName: 'Pablo Honey',
    artistId: 'artist-radiohead',
    msPlayed: 200000,
    contentType: 'music',
    sourceId: 'source-a',
  }),
];

/**
 * Multi-account fixture spanning a few months and podcasts.
 */
export const multiAccountPlays: Play[] = [
  ...singleAccountPlays,
  toPlay({
    id: 'ma-1',
    timestamp: '2022-12-25T18:00:00Z',
    artistName: 'Taylor Swift',
    trackName: 'Cardigan',
    albumName: 'Folklore',
    artistId: 'artist-taylor',
    msPlayed: 300000,
    contentType: 'music',
    sourceId: 'source-b',
  }),
  toPlay({
    id: 'ma-2',
    timestamp: '2023-03-06T13:00:00Z',
    artistName: 'Daily Tech',
    trackName: 'Tech Roundup',
    msPlayed: 150000,
    contentType: 'podcast',
    sourceId: 'source-b',
  }),
  toPlay({
    id: 'ma-3',
    timestamp: '2023-04-01T16:00:00Z',
    artistName: 'The Beatles',
    trackName: 'Something',
    albumName: 'Abbey Road',
    artistId: 'artist-beatles',
    msPlayed: 260000,
    contentType: 'music',
    sourceId: 'source-b',
  }),
  toPlay({
    id: 'ma-4',
    timestamp: '2023-04-02T17:00:00Z',
    artistName: 'Podcast Universe',
    trackName: 'Deep Dive',
    msPlayed: 180000,
    contentType: 'podcast',
    sourceId: 'source-b',
  }),
];

/**
 * Broader fixture across years with skip flags and more artists.
 */
export const multiYearPlays: Play[] = [
  toPlay({
    id: 'my-1',
    timestamp: '2021-06-01T10:00:00Z',
    artistName: 'Taylor Swift',
    trackName: 'Love Story',
    albumName: 'Fearless',
    artistId: 'artist-taylor',
    msPlayed: 240000,
    contentType: 'music',
    sourceId: 'source-a',
  }),
  toPlay({
    id: 'my-2',
    timestamp: '2022-02-10T09:00:00Z',
    artistName: 'The Beatles',
    trackName: 'Let It Be',
    albumName: 'Let It Be',
    artistId: 'artist-beatles',
    msPlayed: 300000,
    contentType: 'music',
    sourceId: 'source-a',
  }),
  toPlay({
    id: 'my-3',
    timestamp: '2022-03-15T18:00:00Z',
    artistName: 'Phase Artist',
    trackName: 'Phase One',
    albumName: 'Seasons',
    artistId: 'artist-phase',
    msPlayed: 360000,
    contentType: 'music',
    sourceId: 'source-a',
  }),
  toPlay({
    id: 'my-4',
    timestamp: '2022-04-15T18:00:00Z',
    artistName: 'Phase Artist',
    trackName: 'Phase Two',
    albumName: 'Seasons',
    artistId: 'artist-phase',
    msPlayed: 420000,
    contentType: 'music',
    sourceId: 'source-a',
  }),
  toPlay({
    id: 'my-5',
    timestamp: '2022-04-16T12:00:00Z',
    artistName: 'Another Artist',
    trackName: 'Background',
    albumName: 'B-Sides',
    artistId: 'artist-background',
    msPlayed: 120000,
    contentType: 'music',
    sourceId: 'source-a',
  }),
  ...multiAccountPlays,
  toPlay({
    id: 'my-6',
    timestamp: '2023-05-10T08:00:00Z',
    artistName: 'Comeback Artist',
    trackName: 'Return Single',
    albumName: 'Chapter Two',
    artistId: 'artist-comeback',
    msPlayed: 210000,
    contentType: 'music',
    sourceId: 'source-b',
    skipped: true,
  }),
  toPlay({
    id: 'my-7',
    timestamp: '2023-05-11T09:00:00Z',
    artistName: 'Comeback Artist',
    trackName: 'Return Single',
    albumName: 'Chapter Two',
    artistId: 'artist-comeback',
    msPlayed: 210000,
    contentType: 'music',
    sourceId: 'source-b',
  }),
];

/**
 * Focused fixture for phases and rediscoveries with clear month gaps.
 */
export const phasesAndRediscoveriesPlays: Play[] = [
  // First listening period for rediscovery artist
  toPlay({
    id: 'pr-1',
    timestamp: '2021-01-05T10:00:00Z',
    artistName: 'Comeback Artist',
    trackName: 'Early Days',
    albumName: 'Origins',
    artistId: 'artist-comeback',
    msPlayed: 200000,
    contentType: 'music',
    sourceId: 'source-a',
  }),
  toPlay({
    id: 'pr-2',
    timestamp: '2021-01-06T11:00:00Z',
    artistName: 'Comeback Artist',
    trackName: 'Early Days',
    albumName: 'Origins',
    artistId: 'artist-comeback',
    msPlayed: 220000,
    contentType: 'music',
    sourceId: 'source-a',
  }),
  // Long gap then rediscovery
  toPlay({
    id: 'pr-3',
    timestamp: '2022-01-10T12:00:00Z',
    artistName: 'Comeback Artist',
    trackName: 'The Return',
    albumName: 'Chapter Two',
    artistId: 'artist-comeback',
    msPlayed: 900000,
    contentType: 'music',
    sourceId: 'source-a',
  }),
  toPlay({
    id: 'pr-4',
    timestamp: '2022-01-12T12:00:00Z',
    artistName: 'Comeback Artist',
    trackName: 'The Return',
    albumName: 'Chapter Two',
    artistId: 'artist-comeback',
    msPlayed: 900000,
    contentType: 'music',
    sourceId: 'source-a',
  }),
  // Phase artist dominating multiple months
  toPlay({
    id: 'pr-5',
    timestamp: '2022-03-01T09:00:00Z',
    artistName: 'Phase Artist',
    trackName: 'March Anthem',
    albumName: 'Seasons',
    artistId: 'artist-phase',
    msPlayed: 360000,
    contentType: 'music',
    sourceId: 'source-a',
  }),
  toPlay({
    id: 'pr-6',
    timestamp: '2022-04-02T09:00:00Z',
    artistName: 'Phase Artist',
    trackName: 'April Anthem',
    albumName: 'Seasons',
    artistId: 'artist-phase',
    msPlayed: 420000,
    contentType: 'music',
    sourceId: 'source-a',
  }),
  toPlay({
    id: 'pr-7',
    timestamp: '2022-05-05T09:00:00Z',
    artistName: 'Phase Artist',
    trackName: 'May Anthem',
    albumName: 'Seasons',
    artistId: 'artist-phase',
    msPlayed: 300000,
    contentType: 'music',
    sourceId: 'source-a',
  }),
  // Other listening to keep totals realistic
  toPlay({
    id: 'pr-8',
    timestamp: '2022-03-10T11:00:00Z',
    artistName: 'Taylor Swift',
    trackName: 'Mirrorball',
    albumName: 'Folklore',
    artistId: 'artist-taylor',
    msPlayed: 180000,
    contentType: 'music',
    sourceId: 'source-a',
  }),
  toPlay({
    id: 'pr-9',
    timestamp: '2022-04-11T11:00:00Z',
    artistName: 'Taylor Swift',
    trackName: 'Seven',
    albumName: 'Folklore',
    artistId: 'artist-taylor',
    msPlayed: 180000,
    contentType: 'music',
    sourceId: 'source-a',
  }),
];
