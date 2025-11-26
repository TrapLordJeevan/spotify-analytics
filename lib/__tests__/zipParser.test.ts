import { extractHistoryFromZip, parseJsonFile } from '../zipParser';
import JSZip from 'jszip';

describe('zipParser', () => {
  describe('extractHistoryFromZip', () => {
    it('should extract JSON files matching Streaming_History pattern', async () => {
      const zip = new JSZip();
      const testData = [
        { endTime: '2023-01-01T00:00:00Z', artistName: 'Artist 1', trackName: 'Track 1', msPlayed: 180000 },
        { endTime: '2023-01-01T01:00:00Z', artistName: 'Artist 2', trackName: 'Track 2', msPlayed: 200000 },
      ];
      
      zip.file('Streaming_History_music_2023.json', JSON.stringify(testData));
      zip.file('other_file.txt', 'not a json file');
      zip.file('Streaming_History_podcast_2023.json', JSON.stringify([testData[0]]));

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipFile = new File([zipBlob], 'test.zip', { type: 'application/zip' });

      const result = await extractHistoryFromZip(zipFile);

      expect(result).toHaveLength(2);
      expect(result[0].filename).toBe('Streaming_History_music_2023.json');
      expect(result[0].content).toEqual(testData);
      expect(result[1].filename).toBe('Streaming_History_podcast_2023.json');
      expect(result[1].content).toEqual([testData[0]]);
    });

    it('should handle ZIP files with no matching JSON files', async () => {
      const zip = new JSZip();
      zip.file('other_file.txt', 'not a json file');
      zip.file('random.json', JSON.stringify({ data: 'test' }));

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipFile = new File([zipBlob], 'test.zip', { type: 'application/zip' });

      const result = await extractHistoryFromZip(zipFile);

      expect(result).toHaveLength(0);
    });

    it('should handle array format JSON files', async () => {
      const zip = new JSZip();
      const testData = [{ endTime: '2023-01-01', artistName: 'Artist', trackName: 'Track', msPlayed: 1000 }];
      zip.file('Streaming_History_music_2023.json', JSON.stringify(testData));

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipFile = new File([zipBlob], 'test.zip', { type: 'application/zip' });

      const result = await extractHistoryFromZip(zipFile);

      expect(result).toHaveLength(1);
      expect(result[0].content).toEqual(testData);
    });

    it('should handle object format JSON files with items property', async () => {
      const zip = new JSZip();
      const testData = { items: [{ endTime: '2023-01-01', artistName: 'Artist', trackName: 'Track', msPlayed: 1000 }] };
      zip.file('Streaming_History_music_2023.json', JSON.stringify(testData));

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipFile = new File([zipBlob], 'test.zip', { type: 'application/zip' });

      const result = await extractHistoryFromZip(zipFile);

      expect(result).toHaveLength(1);
      expect(result[0].content).toEqual(testData.items);
    });

    it('should handle ZIP files with many Streaming_History files', async () => {
      const zip = new JSZip();
      const fileCount = 15; // More than the old 8 file limit
      
      for (let i = 0; i < fileCount; i++) {
        const testData = [{ endTime: `2023-01-${String(i + 1).padStart(2, '0')}`, artistName: 'Artist', trackName: `Track ${i}`, msPlayed: 1000 }];
        zip.file(`Streaming_History_music_2023_${i}.json`, JSON.stringify(testData));
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipFile = new File([zipBlob], 'test.zip', { type: 'application/zip' });

      const result = await extractHistoryFromZip(zipFile);

      expect(result).toHaveLength(fileCount);
    });

    it('should skip empty JSON files', async () => {
      const zip = new JSZip();
      zip.file('Streaming_History_music_2023.json', JSON.stringify([]));
      zip.file('Streaming_History_music_2024.json', JSON.stringify([{ endTime: '2024-01-01', artistName: 'Artist', trackName: 'Track', msPlayed: 1000 }]));

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipFile = new File([zipBlob], 'test.zip', { type: 'application/zip' });

      const result = await extractHistoryFromZip(zipFile);

      expect(result).toHaveLength(1);
      expect(result[0].filename).toBe('Streaming_History_music_2024.json');
    });
  });

  describe('parseJsonFile', () => {
    it('should parse array format JSON files', async () => {
      const testData = [
        { endTime: '2023-01-01', artistName: 'Artist 1', trackName: 'Track 1', msPlayed: 180000 },
        { endTime: '2023-01-02', artistName: 'Artist 2', trackName: 'Track 2', msPlayed: 200000 },
      ];
      const jsonFile = new File([JSON.stringify(testData)], 'test.json', { type: 'application/json' });

      const result = await parseJsonFile(jsonFile);

      expect(result).toEqual(testData);
    });

    it('should parse object format JSON files with items property', async () => {
      const testData = {
        items: [
          { endTime: '2023-01-01', artistName: 'Artist', trackName: 'Track', msPlayed: 1000 }
        ]
      };
      const jsonFile = new File([JSON.stringify(testData)], 'test.json', { type: 'application/json' });

      const result = await parseJsonFile(jsonFile);

      expect(result).toEqual(testData.items);
    });

    it('should handle empty arrays', async () => {
      const jsonFile = new File([JSON.stringify([])], 'test.json', { type: 'application/json' });

      const result = await parseJsonFile(jsonFile);

      expect(result).toEqual([]);
    });
  });
});

