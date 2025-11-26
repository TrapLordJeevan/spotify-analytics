import { Play, ContentType } from '@/types';
import { classifyContentType } from './contentClassifier';

/**
 * Parse a single Spotify streaming history record into our Play format
 * Discards privacy-sensitive fields (IP, user agent, device IDs, etc.)
 */
export function parsePlayRecord(
  record: any,
  sourceId: string
): Play | null {
  // Skip if no meaningful data
  if (!record.ts && !record.endTime) {
    return null;
  }

  // Extract timestamp
  const timestampStr = record.ts || record.endTime;
  const timestamp = new Date(timestampStr);

  // Extract track/artist info (handle different field name variations)
  const trackName = record.trackName || 
                   record.master_metadata_track_name || 
                   record.track_name || 
                   null;
  
  const artistName = record.artistName || 
                    record.master_metadata_artist_name || 
                    record.artist_name || 
                    null;
  
  const albumName = record.albumName || 
                   record.master_metadata_album_name || 
                   record.album_name || 
                   null;

  // Extract URI
  const spotifyUri = record.spotify_uri || record.spotifyUri || null;

  // Extract play duration
  const msPlayed = record.msPlayed || record.ms_played || 0;

  // Skip if no play time
  if (msPlayed <= 0) {
    return null;
  }

  // Classify content type
  const contentType = classifyContentType(record);

  // Extract username if present (optional)
  const username = record.username || record.user_name || null;

  return {
    id: `${sourceId}-${timestamp.getTime()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp,
    artistName,
    trackName,
    albumName,
    spotifyUri,
    msPlayed,
    contentType,
    sourceId,
    username,
  };
}

/**
 * Parse an array of Spotify streaming history records
 */
export function parsePlayRecords(
  records: any[],
  sourceId: string
): Play[] {
  return records
    .map(record => parsePlayRecord(record, sourceId))
    .filter((play): play is Play => play !== null);
}




