import genreMapping from '@/data/genreMapping.json';

/**
 * Map an artist name to a genre
 * Returns "Other" if not found in mapping
 */
export function mapArtistToGenre(artistName: string | null): string {
  if (!artistName) return 'Other';
  
  // Direct lookup
  const genre = (genreMapping as Record<string, string>)[artistName];
  if (genre) return genre;
  
  return 'Other';
}

/**
 * Get all available genres from the mapping
 */
export function getAllGenres(): string[] {
  const genres = new Set<string>();
  Object.values(genreMapping as Record<string, string>).forEach(genre => {
    genres.add(genre);
  });
  genres.add('Other'); // Always include Other
  return Array.from(genres).sort();
}




