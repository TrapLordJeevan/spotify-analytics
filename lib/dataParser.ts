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
  const spotifyTrackUri = record.spotify_uri || record.spotifyUri || null;

  // Extract artist ID from URI if present (e.g., spotify:artist:4Z8W4fKeB5YxbusRsdQVPb)
  let artistId: string | null = null;
  if (spotifyTrackUri) {
    // Try to extract artist ID from track URI's metadata or look for separate artist_uri field
    const artistUri = record.spotify_artist_uri || record.artist_uri || null;
    if (artistUri && artistUri.startsWith('spotify:artist:')) {
      artistId = artistUri.replace('spotify:artist:', '');
    }
    // Alternative: some exports might have master_metadata_album_artist_uri
    if (!artistId && record.master_metadata_album_artist_uri) {
      const uri = record.master_metadata_album_artist_uri;
      if (uri.startsWith('spotify:artist:')) {
        artistId = uri.replace('spotify:artist:', '');
      }
    }
  }

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
    spotifyTrackUri,
    artistId: artistId || undefined,
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




