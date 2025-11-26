import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Play, Source, FilterState } from '@/types';
import { idbStorage } from '@/lib/idbStorage';

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
  metric: 'minutes',
  dateRange: {
    type: 'all',
  },
};

const sanitizeSelectedSources = (selected: string[], sources: Source[]) => {
  if (selected.length === 0) return selected;
  // enabled is true or undefined (default enabled)
  const enabled = new Set(sources.filter((s) => s.enabled !== false).map((s) => s.id));
  return selected.filter((id) => enabled.has(id));
};

export const useDataStore = create<DataStore>()(
  persist(
    (set, get) => ({
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

        // Get enabled source IDs (default to enabled if undefined)
        const enabledSourceIds = new Set(
          sources
            .filter((source) => source.enabled !== false) // enabled is true or undefined
            .map((source) => source.id)
        );

        // If no sources are enabled (all explicitly disabled), return empty
        if (enabledSourceIds.size === 0) {
          return [];
        }

        // Filter to only enabled sources
        filtered = filtered.filter((play) => enabledSourceIds.has(play.sourceId));
        
        // Filter by selected sources (if specific sources are selected)
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
      const years = filters.dateRange.years;
      if (years && years.length > 0) {
        const yearSet = new Set(years);
        filtered = filtered.filter((play) => yearSet.has(play.timestamp.getFullYear()));
      } else {
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
    }
        
        return filtered;
      },
      
      hasData: () => {
        return get().plays.length > 0;
      },
    }),
    {
      name: 'spotify-analytics-store',
      storage: {
        getItem: (name) => idbStorage.getItem(name),
        setItem: (name, value) => idbStorage.setItem(name, value),
        removeItem: (name) => idbStorage.removeItem(name),
      },
      partialize: (state) => ({
        sources: state.sources,
        plays: state.plays,
        filters: state.filters,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Restore Date instances
          if (state.plays) {
            state.plays = state.plays.map((play) => ({
              ...play,
              timestamp: new Date(play.timestamp),
            }));
          }
          if (state.filters?.dateRange) {
            const { start, end } = state.filters.dateRange;
            state.filters = {
              ...state.filters,
              dateRange: {
                ...state.filters.dateRange,
                start: start ? new Date(start) : undefined,
                end: end ? new Date(end) : undefined,
              },
            };
          }
        }
      },
    }
  )
);
