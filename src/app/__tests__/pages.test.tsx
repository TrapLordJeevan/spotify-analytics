import React from 'react';
import { render, screen } from '@testing-library/react';
import OverviewPage from '../overview/page';
import ArtistsPage from '../artists/page';
import TimePage from '../time/page';
import StoryPage from '../story/page';
import { useDataStore } from '@/store/useDataStore';
import { singleAccountPlays, multiYearPlays, sources } from '@/tests/fixtures/plays';

jest.mock('@/store/useDataStore');
jest.mock('@/hooks/useDarkMode', () => ({ useDarkMode: () => {} }));
jest.mock('next/navigation', () => ({
  usePathname: () => '/overview',
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/components/Filters/FilterBar', () => ({
  FilterBar: () => <div data-testid="filter-bar" />,
}));

const mockTopLists = jest.fn();
jest.mock('@/components/Overview/TopLists', () => ({
  TopLists: (props: any) => {
    mockTopLists(props);
    return <div data-testid="top-lists" />;
  },
}));

jest.mock('@/components/TopArtists/ArtistsTable', () => ({
  ArtistsTable: (props: any) => <div data-testid="artists-table">{JSON.stringify(props.metric)}</div>,
}));
jest.mock('@/components/TopArtists/ArtistsChart', () => ({
  ArtistsChart: (props: any) => <div data-testid="artists-chart">{JSON.stringify(props.metric)}</div>,
}));

jest.mock('@/components/Time/TimeOfDayChart', () => ({
  TimeOfDayChart: (props: any) => <div data-testid="time-of-day">{props.metric}</div>,
}));
jest.mock('@/components/Time/MonthlyChart', () => ({
  MonthlyChart: (props: any) => <div data-testid="monthly-chart">{props.metric}</div>,
}));
jest.mock('@/components/Time/YearlyChart', () => ({
  YearlyChart: (props: any) => <div data-testid="yearly-chart">{props.metric}</div>,
}));
jest.mock('@/components/Time/DailyChart', () => ({
  DailyChart: (props: any) => <div data-testid="daily-chart">{props.metric}</div>,
}));

jest.mock('@/components/Story/YearTimeline', () => ({
  YearTimeline: (props: any) => <div data-testid="year-timeline">{props.metric}</div>,
}));
jest.mock('@/components/Story/PhaseHighlight', () => ({
  PhaseHighlight: (props: any) => <div data-testid="phase-highlight">{props.metric}</div>,
}));
jest.mock('@/components/Story/RediscoveryHighlight', () => ({
  RediscoveryHighlight: () => <div data-testid="rediscovery-highlight" />,
}));

type MockState = {
  plays: typeof singleAccountPlays;
  filters: {
    selectedSources: string[];
    contentType: 'music' | 'podcast' | 'both';
    metric: 'minutes' | 'plays';
    dateRange: { type: 'all' | 'last12' | 'last6' | 'last3' | 'custom'; start?: Date; end?: Date; years?: number[] };
  };
  sources: typeof sources;
  getFilteredPlays: () => typeof singleAccountPlays;
};

const mockUseDataStore = useDataStore as unknown as jest.Mock;

const buildState = (overrides: Partial<MockState> = {}): MockState => ({
  plays: singleAccountPlays,
  sources,
  filters: {
    selectedSources: [],
    contentType: 'both',
    metric: 'minutes',
    dateRange: { type: 'all' },
  },
  getFilteredPlays: () => singleAccountPlays,
  ...overrides,
});

describe('page-level rendering with mocked store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders overview with summary stats and passes metric to lists', () => {
    const state = buildState();
    mockUseDataStore.mockImplementation((selector: (state: MockState) => any) => selector(state));

    render(<OverviewPage />);

    expect(screen.getByText(/Listening hours/i)).toBeInTheDocument();
    expect(screen.getByText(/Total plays/i)).toBeInTheDocument();
    expect(screen.getByTestId('filter-bar')).toBeInTheDocument();
    expect(mockTopLists).toHaveBeenCalledWith(expect.objectContaining({ metric: 'minutes', plays: state.plays }));
  });

  it('renders artists page and respects metric toggle', () => {
    const state = buildState({
      plays: multiYearPlays,
      filters: { selectedSources: [], contentType: 'both', metric: 'plays', dateRange: { type: 'all' } },
      getFilteredPlays: () => multiYearPlays,
    });
    mockUseDataStore.mockImplementation((selector: (state: MockState) => any) => selector(state));

    render(<ArtistsPage />);

    expect(screen.getByTestId('artists-table')).toBeInTheDocument();
    expect(screen.getByTestId('artists-chart')).toHaveTextContent('plays');
  });

  it('renders time page charts with filtered plays', () => {
    const state = buildState({ plays: multiYearPlays, getFilteredPlays: () => multiYearPlays });
    mockUseDataStore.mockImplementation((selector: (state: MockState) => any) => selector(state));

    render(<TimePage />);

    expect(screen.getByTestId('time-of-day')).toHaveTextContent('minutes');
    expect(screen.getByTestId('monthly-chart')).toBeInTheDocument();
    expect(screen.getByTestId('daily-chart')).toBeInTheDocument();
  });

  it('renders story page with metric-aware sections', () => {
    const state = buildState({
      plays: multiYearPlays,
      filters: { selectedSources: [], contentType: 'both', metric: 'plays', dateRange: { type: 'all' } },
      getFilteredPlays: () => multiYearPlays,
    });
    mockUseDataStore.mockImplementation((selector: (state: MockState) => any) => selector(state));

    render(<StoryPage />);

    expect(screen.getByTestId('year-timeline')).toHaveTextContent('plays');
    expect(screen.getByTestId('phase-highlight')).toHaveTextContent('plays');
    expect(screen.getByTestId('rediscovery-highlight')).toBeInTheDocument();
  });
});
