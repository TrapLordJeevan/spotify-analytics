import { ContentType } from '@/types';

/**
 * Classifies a Spotify play record as music, podcast, or other
 */
export function classifyContentType(record: Record<string, unknown>): ContentType {
  const getString = (key: string) => {
    const value = record[key];
    return typeof value === 'string' ? value : null;
  };

  const hasEpisodeFields =
    getString('episode_name') ||
    getString('episode_show_name') ||
    getString('show_name') ||
    getString('episodeName') ||
    getString('episodeShowName');

  const spotifyEpisodeUri = getString('spotify_episode_uri');

  if (spotifyEpisodeUri || hasEpisodeFields) {
    return 'podcast';
  }
  
  // If it has track/artist info, it's likely music
  if (getString('track_name') || getString('artist_name') || getString('master_metadata_track_name') || getString('trackName')) {
    return 'music';
  }
  
  return 'other';
}

