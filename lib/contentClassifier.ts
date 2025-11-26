import { ContentType } from '@/types';

/**
 * Classifies a Spotify play record as music, podcast, or other
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function classifyContentType(record: any): ContentType {
  // Check for podcast indicators
  if (record.episode_name || record.episode_show_name || record.show_name) {
    return 'podcast';
  }
  
  // If it has track/artist info, it's likely music
  if (record.track_name || record.artist_name || record.master_metadata_track_name) {
    return 'music';
  }
  
  return 'other';
}


