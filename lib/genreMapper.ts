import genreMapping from '@/data/genreMapping.json';

export type CanonicalGenre =
  | 'Pop'
  | 'Hip Hop'
  | 'R&B'
  | 'Rock'
  | 'Metal'
  | 'EDM'
  | 'House/Techno'
  | 'Indie/Alternative'
  | 'K-Pop'
  | 'Jazz'
  | 'Classical'
  | 'Latin'
  | 'Country'
  | 'Soundtrack'
  | 'Podcast'
  | 'Other';

interface GenreMappingEntry {
  primaryGenre: CanonicalGenre;
  rawGenres?: string[];
}

type GenreMapping = Record<string, GenreMappingEntry | CanonicalGenre>;

/**
 * Normalize artist name for lookup (lowercase, trimmed)
 */
function normalizeArtistName(artistName: string): string {
  return artistName.toLowerCase().trim();
}

/**
 * Get genre for an artist, trying artistId first, then normalized artistName
 * Returns canonical genre, defaults to 'Other' if not found
 */
export function getGenreForArtist(
  artistId?: string | null,
  artistName?: string | null
): CanonicalGenre {
  const mapping = genreMapping as GenreMapping;

  // 1. Try artistId key in mapping
  if (artistId) {
    const entry = mapping[artistId];
    if (entry) {
      // Handle both old format (string) and new format (object)
      if (typeof entry === 'string') {
        return entry as CanonicalGenre;
      }
      return entry.primaryGenre;
    }
  }

  // 2. Fallback to normalized artistName (lowercase, trimmed)
  if (artistName) {
    const normalized = normalizeArtistName(artistName);
    const entry = mapping[normalized];
    if (entry) {
      // Handle both old format (string) and new format (object)
      if (typeof entry === 'string') {
        return entry as CanonicalGenre;
      }
      return entry.primaryGenre;
    }

    // Also try exact match (for backward compatibility)
    const exactEntry = mapping[artistName];
    if (exactEntry) {
      if (typeof exactEntry === 'string') {
        return exactEntry as CanonicalGenre;
      }
      return exactEntry.primaryGenre;
    }
  }

  // 3. If not found or mapping is missing: return 'Other'
  return 'Other';
}

/**
 * Map an artist name to a genre (backward compatibility)
 * @deprecated Use getGenreForArtist instead
 */
export function mapArtistToGenre(artistName: string | null): string {
  return getGenreForArtist(null, artistName);
}

/**
 * Get all available genres from the mapping
 */
export function getAllGenres(): CanonicalGenre[] {
  const genres = new Set<CanonicalGenre>();
  const mapping = genreMapping as GenreMapping;

  Object.values(mapping).forEach(entry => {
    if (typeof entry === 'string') {
      genres.add(entry as CanonicalGenre);
    } else {
      genres.add(entry.primaryGenre);
    }
  });

  genres.add('Other'); // Always include Other
  return Array.from(genres).sort();
}




