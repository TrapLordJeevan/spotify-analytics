import { Play } from '@/types';

const buildKey = (artistName?: string | null, trackName?: string | null, fallback?: string) => {
  const artist = artistName?.trim() || 'unknown-artist';
  const track = trackName?.trim() || fallback || 'unknown-track';
  return `${artist}|||${track}`;
};

export const getSongId = (play: Play) => {
  return play.spotifyTrackUri || buildKey(play.artistName, play.trackName, play.id);
};

export const matchesSongId = (play: Play, songId: string) => {
  const normalized = songId.trim();
  return (
    normalized === play.spotifyTrackUri ||
    normalized === buildKey(play.artistName, play.trackName, play.id)
  );
};

export const getSongKeyFromNames = (artistName: string, trackName: string) => {
  return buildKey(artistName, trackName);
};

export const getSongIdFromList = (plays: Play[], artistName: string, trackName: string) => {
  const match = plays.find(
    (play) =>
      play.contentType === 'music' &&
      play.artistName === artistName &&
      play.trackName === trackName
  );
  if (match) {
    return getSongId(match);
  }
  return getSongKeyFromNames(artistName, trackName);
};
