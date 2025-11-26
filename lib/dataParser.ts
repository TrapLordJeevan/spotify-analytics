import { Play } from '@/types';
import { classifyContentType } from './contentClassifier';

type RawRecord = Record<string, unknown>;

/**
 * Parse a single Spotify streaming history record into our Play format
 * Discards privacy-sensitive fields (IP, user agent, device IDs, etc.)
 */
export function parsePlayRecord(
  record: RawRecord,
  sourceId: string
): Play | null {
  // Skip if no meaningful data
  if (!record.ts && !record.endTime) {
    return null;
  }

  // Extract timestamp
  const timestampStr = record.ts || record.endTime;
  const timestamp = timestampStr ? new Date(timestampStr as string) : null;
  if (!timestamp || isNaN(timestamp.getTime())) return null;

  const getString = (key: string): string | null => {
    const value = record[key];
    return typeof value === 'string' ? value : null;
  };

  // Extract track/artist info (handle different field name variations)
  const trackName =
    getString('trackName') ||
    getString('master_metadata_track_name') ||
    getString('track_name') ||
    getString('episode_name') ||
    getString('episodeName') ||
    getString('episode_show_name') ||
    getString('show_name') ||
    null;
  
  const artistName =
    getString('artistName') ||
    getString('master_metadata_artist_name') ||
    getString('master_metadata_album_artist_name') ||
    getString('artist_name') ||
    getString('episode_show_name') ||
    getString('show_name') ||
    null;
  
  const albumName =
    getString('albumName') ||
    getString('master_metadata_album_name') ||
    getString('master_metadata_album_album_name') ||
    getString('album_name') ||
    null;

  // Extract URI
  const spotifyTrackUri =
    getString('spotify_uri') || getString('spotify_track_uri') || getString('spotifyUri');

  // Extract artist ID from URI if present (e.g., spotify:artist:4Z8W4fKeB5YxbusRsdQVPb)
  let artistId: string | null = null;
  if (spotifyTrackUri) {
    // Try to extract artist ID from track URI's metadata or look for separate artist_uri field
    const artistUri = getString('spotify_artist_uri') || getString('artist_uri');
    if (artistUri && artistUri.startsWith('spotify:artist:')) {
      artistId = artistUri.replace('spotify:artist:', '');
    }
    // Alternative: some exports might have master_metadata_album_artist_uri
    const albumArtistUri = getString('master_metadata_album_artist_uri');
    if (!artistId && albumArtistUri) {
      const uri = albumArtistUri;
      if (uri.startsWith('spotify:artist:')) {
        artistId = uri.replace('spotify:artist:', '');
      }
    }
  }

  // Extract play duration
  const msPlayed = (record.msPlayed as number | undefined) || (record.ms_played as number | undefined) || 0;
  const skipped = record.skipped === true;

  // Skip if no play time
  if (msPlayed <= 0) {
    return null;
  }

  // Classify content type
  const contentType = classifyContentType(record);

  // Extract username if present (optional)
  const username = getString('username') || getString('user_name');

  return {
    id: `${sourceId}-${timestamp.getTime()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp,
    artistName,
    trackName,
    albumName,
    spotifyTrackUri,
    artistId: artistId || undefined,
    msPlayed,
    contentType,
    sourceId,
    username,
    skipped,
  };
}

/**
 * Parse an array of Spotify streaming history records
 */
export function parsePlayRecords(
  records: unknown[],
  sourceId: string
): Play[] {
  return records
    .map(record => parsePlayRecord(record as RawRecord, sourceId))
    .filter((play): play is Play => play !== null);
}
