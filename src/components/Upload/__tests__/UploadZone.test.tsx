import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

const mockUseDataStore = useDataStore as jest.MockedFunction<typeof useDataStore>;
const mockExtractHistoryFromZip = extractHistoryFromZip as jest.MockedFunction<typeof extractHistoryFromZip>;
const mockParseJsonFile = parseJsonFile as jest.MockedFunction<typeof parseJsonFile>;
const mockParsePlayRecords = parsePlayRecords as jest.MockedFunction<typeof parsePlayRecords>;

describe('UploadZone', () => {
  const mockAddSource = jest.fn();
  const mockAddPlays = jest.fn();
  const mockHasData = jest.fn(() => false);

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDataStore.mockImplementation((selector: any) => {
      const state = {
        addSource: mockAddSource,
        addPlays: mockAddPlays,
        hasData: mockHasData,
      };
      return selector(state);
    });
    mockParsePlayRecords.mockReturnValue([
      {
        id: 'play-1',
        timestamp: new Date('2023-01-01'),
        artistName: 'Test Artist',
        trackName: 'Test Track',
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
    const user = userEvent.setup();
    const testData = [{ endTime: '2023-01-01', artistName: 'Artist', trackName: 'Track', msPlayed: 1000 }];
    mockParseJsonFile.mockResolvedValue(testData);

    render(<UploadZone />);
    const input = screen.getByLabelText(/select files/i);
    const file = new File([JSON.stringify(testData)], 'test.json', { type: 'application/json' });

    await user.upload(input, file);

    await waitFor(() => {
      expect(mockParseJsonFile).toHaveBeenCalledWith(file);
      expect(mockParsePlayRecords).toHaveBeenCalled();
      expect(mockAddSource).toHaveBeenCalled();
      expect(mockAddPlays).toHaveBeenCalled();
    });
  });

  it('should handle ZIP file upload', async () => {
    const user = userEvent.setup();
    const testData = [{ endTime: '2023-01-01', artistName: 'Artist', trackName: 'Track', msPlayed: 1000 }];
    mockExtractHistoryFromZip.mockResolvedValue([
      { filename: 'Streaming_History_music_2023.json', content: testData },
    ]);

    render(<UploadZone />);
    const input = screen.getByLabelText(/select files/i);
    const file = new File(['zip content'], 'test.zip', { type: 'application/zip' });

    await user.upload(input, file);

    await waitFor(() => {
      expect(mockExtractHistoryFromZip).toHaveBeenCalledWith(file);
      expect(mockParsePlayRecords).toHaveBeenCalled();
      expect(mockAddSource).toHaveBeenCalled();
      expect(mockAddPlays).toHaveBeenCalled();
    });
  });

  it('should handle multiple file uploads (more than 8 files)', async () => {
    const user = userEvent.setup();
    const testData = [{ endTime: '2023-01-01', artistName: 'Artist', trackName: 'Track', msPlayed: 1000 }];
    mockParseJsonFile.mockResolvedValue(testData);

    render(<UploadZone />);
    const input = screen.getByLabelText(/select files/i);
    
    // Create 15 files (more than the old 8 file limit)
    const files = Array.from({ length: 15 }, (_, i) => 
      new File([JSON.stringify(testData)], `test${i}.json`, { type: 'application/json' })
    );

    await user.upload(input, files);

    await waitFor(() => {
      // Should process all 15 files without error
      expect(mockParseJsonFile).toHaveBeenCalledTimes(15);
      expect(mockAddSource).toHaveBeenCalledTimes(15);
    });
  });

  it('should show error for unsupported file types', async () => {
    const user = userEvent.setup();
    render(<UploadZone />);
    const input = screen.getByLabelText(/select files/i);
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText(/Unsupported file/i)).toBeInTheDocument();
    });
  });

  it('should display success message after upload', async () => {
    const user = userEvent.setup();
    const testData = [{ endTime: '2023-01-01', artistName: 'Artist', trackName: 'Track', msPlayed: 1000 }];
    mockParseJsonFile.mockResolvedValue(testData);

    render(<UploadZone />);
    const input = screen.getByLabelText(/select files/i);
    const file = new File([JSON.stringify(testData)], 'test.json', { type: 'application/json' });

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText(/Imported/i)).toBeInTheDocument();
    });
  });

  it('should handle empty files gracefully', async () => {
    const user = userEvent.setup();
    mockParseJsonFile.mockResolvedValue([]);

    render(<UploadZone />);
    const input = screen.getByLabelText(/select files/i);
    const file = new File([JSON.stringify([])], 'empty.json', { type: 'application/json' });

    await user.upload(input, file);

    await waitFor(() => {
      expect(mockAddSource).not.toHaveBeenCalled();
      expect(mockAddPlays).not.toHaveBeenCalled();
    });
  });
});

