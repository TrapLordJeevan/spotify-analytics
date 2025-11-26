import { create } from 'zustand';
import { Play, Source, FilterState } from '@/types';

type SourceToggleMode = 'enable' | 'disable' | 'toggle';

interface DataStore {
  // Data
  sources: Source[];
  plays: Play[];
  
  // Filters
  filters: FilterState;
  
  // Actions
  addSource: (source: Source) => void;
  updateSourceName: (sourceId: string, name: string) => void;
  setSourceEnabled: (sourceId: string, mode?: SourceToggleMode) => void;
  setAllSourcesEnabled: (enabled: boolean) => void;
  addPlays: (plays: Play[]) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  clearAllData: () => void;
  
  // Computed getters
  getFilteredPlays: () => Play[];
  hasData: () => boolean;
}

const defaultFilters: FilterState = {
  selectedSources: [], // Empty = all accounts
  contentType: 'both',
  dateRange: {
    type: 'all',
  },
};

const sanitizeSelectedSources = (selected: string[], sources: Source[]) => {
  if (selected.length === 0) return selected;
  const enabled = new Set(sources.filter((s) => s.enabled).map((s) => s.id));
  return selected.filter((id) => enabled.has(id));
};

export const useDataStore = create<DataStore>((set, get) => ({
  sources: [],
  plays: [],
  filters: defaultFilters,
  
  addSource: (source) => {
    set((state) => ({
      sources: [...state.sources, source],
      filters: {
        ...state.filters,
        selectedSources: sanitizeSelectedSources(state.filters.selectedSources, [
          ...state.sources,
          source,
        ]),
      },
    }));
  },
  
  updateSourceName: (sourceId, name) => {
    set((state) => ({
      sources: state.sources.map((s) =>
        s.id === sourceId ? { ...s, name } : s
      ),
    }));
  },

  setSourceEnabled: (sourceId, mode = 'toggle') => {
    set((state) => {
      const sources = state.sources.map((s) => {
        if (s.id !== sourceId) return s;
        const nextEnabled =
          mode === 'enable' ? true : mode === 'disable' ? false : !s.enabled;
        return { ...s, enabled: nextEnabled };
      });

      return {
        sources,
        filters: {
          ...state.filters,
          selectedSources: sanitizeSelectedSources(
            state.filters.selectedSources,
            sources
          ),
        },
      };
    });
  },

  setAllSourcesEnabled: (enabled) => {
    set((state) => {
      const sources = state.sources.map((s) => ({ ...s, enabled }));
      return {
        sources,
        filters: {
          ...state.filters,
          selectedSources: enabled
            ? state.filters.selectedSources
            : [],
        },
      };
    });
  },
  
  addPlays: (newPlays) => {
    set((state) => ({
      plays: [...state.plays, ...newPlays],
    }));
  },
  
  setFilters: (newFilters) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...newFilters,
        selectedSources: newFilters.selectedSources
          ? sanitizeSelectedSources(newFilters.selectedSources, state.sources)
          : state.filters.selectedSources,
      },
    }));
  },
  
  resetFilters: () => {
    set({ filters: defaultFilters });
  },
  
  clearAllData: () => {
    set({
      sources: [],
      plays: [],
      filters: defaultFilters,
    });
  },
  
  getFilteredPlays: () => {
    const { plays, filters, sources } = get();
    
    let filtered = plays;

    const enabledSourceIds = new Set(
      sources.filter((source) => source.enabled).map((source) => source.id)
    );

    if (enabledSourceIds.size > 0) {
      filtered = filtered.filter((play) => enabledSourceIds.has(play.sourceId));
    }
    if (enabledSourceIds.size === 0) {
      return [];
    }
    
    // Filter by sources
    if (filters.selectedSources.length > 0) {
      filtered = filtered.filter((play) =>
        filters.selectedSources.includes(play.sourceId)
      );
    }
    
    // Filter by content type
    if (filters.contentType !== 'both') {
      const targetType = filters.contentType === 'music' ? 'music' : 'podcast';
      filtered = filtered.filter((play) => play.contentType === targetType);
    }
    
    // Filter by date range
    if (filters.dateRange.type !== 'all') {
      const now = new Date();
      let startDate: Date | undefined;
      let endDate: Date | undefined = now;
      
      if (filters.dateRange.type === 'custom') {
        startDate = filters.dateRange.start;
        endDate = filters.dateRange.end;
      } else {
        const months = filters.dateRange.type === 'last12' ? 12 :
                      filters.dateRange.type === 'last6' ? 6 : 3;
        startDate = new Date(now.getFullYear(), now.getMonth() - months, now.getDate());
      }
      
      if (startDate) {
        filtered = filtered.filter((play) => play.timestamp >= startDate!);
      }
      if (endDate) {
        filtered = filtered.filter((play) => play.timestamp <= endDate!);
      }
    }
    
    return filtered;
  },
  
  hasData: () => {
    return get().plays.length > 0;
  },
}));




