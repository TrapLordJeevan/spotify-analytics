import { parsePlayRecord, parsePlayRecords } from '../dataParser';

describe('dataParser', () => {
  describe('parsePlayRecord', () => {
    it('should parse a valid Spotify record', () => {
      const record = {
        endTime: '2023-01-01T12:00:00Z',
        artistName: 'Test Artist',
        trackName: 'Test Track',
        albumName: 'Test Album',
        msPlayed: 180000,
        spotifyUri: 'spotify:track:123',
        track_name: 'Test Track', // Add for content classification
      };
      const sourceId = 'test-source-1';

      const result = parsePlayRecord(record, sourceId);

      expect(result).not.toBeNull();
      expect(result?.artistName).toBe('Test Artist');
      expect(result?.trackName).toBe('Test Track');
      expect(result?.albumName).toBe('Test Album');
      expect(result?.msPlayed).toBe(180000);
      expect(result?.spotifyUri).toBe('spotify:track:123');
      expect(result?.sourceId).toBe(sourceId);
      expect(result?.timestamp).toEqual(new Date('2023-01-01T12:00:00Z'));
      expect(result?.contentType).toBe('music');
    });

    it('should handle alternative field names', () => {
      const record = {
        ts: '2023-01-01T12:00:00Z',
        master_metadata_artist_name: 'Artist',
        master_metadata_track_name: 'Track',
        master_metadata_album_name: 'Album',
        ms_played: 200000,
        spotify_uri: 'spotify:track:456',
        track_name: 'Track', // Add for content classification
      };
      const sourceId = 'test-source-2';

      const result = parsePlayRecord(record, sourceId);

      expect(result).not.toBeNull();
      expect(result?.artistName).toBe('Artist');
      expect(result?.trackName).toBe('Track');
      expect(result?.albumName).toBe('Album');
      expect(result?.msPlayed).toBe(200000);
      expect(result?.contentType).toBe('music');
    });

    it('should return null for records with no timestamp', () => {
      const record = {
        artistName: 'Artist',
        trackName: 'Track',
        msPlayed: 1000,
      };
      const sourceId = 'test-source-3';

      const result = parsePlayRecord(record, sourceId);

      expect(result).toBeNull();
    });

    it('should return null for records with zero or negative play time', () => {
      const record1 = {
        endTime: '2023-01-01T12:00:00Z',
        artistName: 'Artist',
        trackName: 'Track',
        msPlayed: 0,
      };
      const record2 = {
        endTime: '2023-01-01T12:00:00Z',
        artistName: 'Artist',
        trackName: 'Track',
        msPlayed: -100,
      };
      const sourceId = 'test-source-4';

      expect(parsePlayRecord(record1, sourceId)).toBeNull();
      expect(parsePlayRecord(record2, sourceId)).toBeNull();
    });

    it('should handle records with username', () => {
      const record = {
        endTime: '2023-01-01T12:00:00Z',
        artistName: 'Artist',
        trackName: 'Track',
        msPlayed: 1000,
        username: 'testuser',
        track_name: 'Track', // Add for content classification
      };
      const sourceId = 'test-source-5';

      const result = parsePlayRecord(record, sourceId);

      expect(result).not.toBeNull();
      expect(result?.username).toBe('testuser');
      expect(result?.contentType).toBe('music');
    });
  });

  describe('parsePlayRecords', () => {
    it('should parse multiple valid records', () => {
      const records = [
        {
          endTime: '2023-01-01T12:00:00Z',
          artistName: 'Artist 1',
          trackName: 'Track 1',
          msPlayed: 1000,
          track_name: 'Track 1', // Add for content classification
        },
        {
          endTime: '2023-01-01T13:00:00Z',
          artistName: 'Artist 2',
          trackName: 'Track 2',
          msPlayed: 2000,
          track_name: 'Track 2', // Add for content classification
        },
      ];
      const sourceId = 'test-source-6';

      const result = parsePlayRecords(records, sourceId);

      expect(result).toHaveLength(2);
      expect(result[0].artistName).toBe('Artist 1');
      expect(result[1].artistName).toBe('Artist 2');
    });

    it('should filter out invalid records', () => {
      const records = [
        {
          endTime: '2023-01-01T12:00:00Z',
          artistName: 'Artist 1',
          trackName: 'Track 1',
          msPlayed: 1000,
          track_name: 'Track 1', // Add for content classification
        },
        {
          // Missing timestamp
          artistName: 'Artist 2',
          trackName: 'Track 2',
          msPlayed: 2000,
        },
        {
          endTime: '2023-01-01T14:00:00Z',
          artistName: 'Artist 3',
          trackName: 'Track 3',
          msPlayed: 0, // Invalid play time
        },
        {
          endTime: '2023-01-01T15:00:00Z',
          artistName: 'Artist 4',
          trackName: 'Track 4',
          msPlayed: 3000,
          track_name: 'Track 4', // Add for content classification
        },
      ];
      const sourceId = 'test-source-7';

      const result = parsePlayRecords(records, sourceId);

      expect(result).toHaveLength(2);
      expect(result[0].artistName).toBe('Artist 1');
      expect(result[1].artistName).toBe('Artist 4');
    });

    it('should handle empty arrays', () => {
      const records: any[] = [];
      const sourceId = 'test-source-8';

      const result = parsePlayRecords(records, sourceId);

      expect(result).toHaveLength(0);
    });
  });
});

