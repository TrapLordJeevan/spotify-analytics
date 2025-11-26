import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { UploadZone } from '../UploadZone';
import { useDataStore } from '@/store/useDataStore';
import { extractHistoryFromZip, parseJsonFile } from '@/lib/zipParser';
import { parsePlayRecords } from '@/lib/dataParser';

// Mock the dependencies
jest.mock('@/store/useDataStore');
jest.mock('@/lib/zipParser');
jest.mock('@/lib/dataParser');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

type MockState = {
  addSource: jest.Mock;
  addPlays: jest.Mock;
  hasData: jest.Mock;
  sources: unknown[];
  plays: unknown[];
  filters: {
    selectedSources: string[];
    contentType: 'both' | 'music' | 'podcast';
    metric: 'minutes' | 'plays';
    dateRange: { type: 'all' };
  };
  updateSourceName: jest.Mock;
  setSourceEnabled: jest.Mock;
  setAllSourcesEnabled: jest.Mock;
  setFilters: jest.Mock;
  resetFilters: jest.Mock;
  clearAllData: jest.Mock;
  getFilteredPlays: jest.Mock;
};

const mockUseDataStore = useDataStore as unknown as jest.Mock;
const mockExtractHistoryFromZip = extractHistoryFromZip as jest.MockedFunction<typeof extractHistoryFromZip>;
const mockParseJsonFile = parseJsonFile as jest.MockedFunction<typeof parseJsonFile>;
const mockParsePlayRecords = parsePlayRecords as jest.MockedFunction<typeof parsePlayRecords>;

describe('UploadZone', () => {
  const mockAddSource = jest.fn();
  const mockAddPlays = jest.fn();
  const mockHasData = jest.fn(() => false);

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDataStore.mockImplementation((selector: (state: MockState) => unknown) => {
      const state: MockState = {
        addSource: mockAddSource,
        addPlays: mockAddPlays,
        hasData: mockHasData,
        sources: [],
        plays: [],
        filters: {
          selectedSources: [],
          contentType: 'both',
          metric: 'minutes',
          dateRange: { type: 'all' },
        },
        updateSourceName: jest.fn(),
        setSourceEnabled: jest.fn(),
        setAllSourcesEnabled: jest.fn(),
        setFilters: jest.fn(),
        resetFilters: jest.fn(),
        clearAllData: jest.fn(),
        getFilteredPlays: jest.fn().mockReturnValue([]),
      };
      return selector(state);
    });
    mockParsePlayRecords.mockReturnValue([
      {
        id: 'play-1',
        timestamp: new Date('2023-01-01'),
        artistName: 'Test Artist',
        trackName: 'Test Track',
        albumName: null,
        spotifyTrackUri: null,
        msPlayed: 1000,
        contentType: 'music' as const,
        sourceId: 'source-1',
      },
    ]);
  });

  it('should render upload zone', () => {
    render(<UploadZone />);
    expect(screen.getByText(/Drop your Spotify ZIP or JSON files here/i)).toBeInTheDocument();
  });

  it('should handle JSON file upload', async () => {
    const testData = [{ endTime: '2023-01-01', artistName: 'Artist', trackName: 'Track', msPlayed: 1000, track_name: 'Track' }];
    mockParseJsonFile.mockResolvedValue(testData);

    render(<UploadZone />);
    const input = screen.getByLabelText(/select files/i) as HTMLInputElement;
    const file = new File([JSON.stringify(testData)], 'test.json', { type: 'application/json' });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockParseJsonFile).toHaveBeenCalledWith(file);
      expect(mockParsePlayRecords).toHaveBeenCalled();
      expect(mockAddSource).toHaveBeenCalled();
      expect(mockAddPlays).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('should handle ZIP file upload', async () => {
    const testData = [{ endTime: '2023-01-01', artistName: 'Artist', trackName: 'Track', msPlayed: 1000, track_name: 'Track' }];
    mockExtractHistoryFromZip.mockResolvedValue([
      { filename: 'Streaming_History_music_2023.json', content: testData },
    ]);

    render(<UploadZone />);
    const input = screen.getByLabelText(/select files/i) as HTMLInputElement;
    const file = new File(['zip content'], 'test.zip', { type: 'application/zip' });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockExtractHistoryFromZip).toHaveBeenCalledWith(file);
      expect(mockParsePlayRecords).toHaveBeenCalled();
      expect(mockAddSource).toHaveBeenCalled();
      expect(mockAddPlays).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('should handle multiple file uploads (more than 8 files)', async () => {
    const testData = [{ endTime: '2023-01-01', artistName: 'Artist', trackName: 'Track', msPlayed: 1000, track_name: 'Track' }];
    mockParseJsonFile.mockResolvedValue(testData);

    render(<UploadZone />);
    const input = screen.getByLabelText(/select files/i) as HTMLInputElement;
    
    // Create 15 files (more than the old 8 file limit)
    const files = Array.from({ length: 15 }, (_, i) => 
      new File([JSON.stringify(testData)], `test${i}.json`, { type: 'application/json' })
    );

    fireEvent.change(input, { target: { files } });

    await waitFor(() => {
      // Should process all 15 files without error
      expect(mockParseJsonFile).toHaveBeenCalledTimes(15);
      expect(mockAddSource).toHaveBeenCalledTimes(15);
    }, { timeout: 3000 });
  });

  it('should show error for unsupported file types', async () => {
    render(<UploadZone />);
    const input = screen.getByLabelText(/select files/i) as HTMLInputElement;
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Unsupported file/i)).toBeInTheDocument();
    });
  });

  it('should display success message after upload', async () => {
    const testData = [{ endTime: '2023-01-01', artistName: 'Artist', trackName: 'Track', msPlayed: 1000, track_name: 'Track' }];
    mockParseJsonFile.mockResolvedValue(testData);

    render(<UploadZone />);
    const input = screen.getByLabelText(/select files/i) as HTMLInputElement;
    const file = new File([JSON.stringify(testData)], 'test.json', { type: 'application/json' });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Imported/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should handle empty files gracefully', async () => {
    mockParseJsonFile.mockResolvedValue([]);

    render(<UploadZone />);
    const input = screen.getByLabelText(/select files/i) as HTMLInputElement;
    const file = new File([JSON.stringify([])], 'empty.json', { type: 'application/json' });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockAddSource).not.toHaveBeenCalled();
      expect(mockAddPlays).not.toHaveBeenCalled();
    });
  });
});
