'use client';

import { useMemo } from 'react';
import { useDataStore } from '@/store/useDataStore';
import { getYearlyData } from '@/lib/analytics/time';

const DATE_PRESETS = [
  { id: 'all', label: 'All time' },
  { id: 'last12', label: 'Last 12 months' },
  { id: 'last6', label: 'Last 6 months' },
  { id: 'last3', label: 'Last 3 months' },
] as const;

export function FilterBar() {
  const sources = useDataStore((state) => state.sources);
  const filters = useDataStore((state) => state.filters);
  const setFilters = useDataStore((state) => state.setFilters);
  const allPlays = useDataStore((state) => state.plays);

  const enabledSources = useMemo(
    () => sources.filter((source) => source.enabled !== false), // enabled is true or undefined
    [sources]
  );

  // Get available years from all plays
  const availableYears = useMemo(() => {
    const yearlyData = getYearlyData(allPlays);
    return yearlyData.map((entry) => entry.year).sort((a, b) => b - a);
  }, [allPlays]);

  const selectedSourceIds = filters.selectedSources;
  const isAllSourcesSelected =
    selectedSourceIds.length === 0 ||
    selectedSourceIds.length === enabledSources.length;

  const toggleSource = (sourceId: string) => {
    let nextSelection: string[];
    if (selectedSourceIds.includes(sourceId)) {
      nextSelection = selectedSourceIds.filter((id) => id !== sourceId);
    } else {
      nextSelection = [...selectedSourceIds, sourceId];
    }

    if (nextSelection.length === 0 || nextSelection.length === enabledSources.length) {
      nextSelection = [];
    }

    setFilters({ selectedSources: nextSelection });
  };

  const handleContentToggle = (value: 'music' | 'podcast' | 'both') => {
    setFilters({ contentType: value });
  };

  const handleMetricToggle = (value: 'minutes' | 'plays') => {
    setFilters({ metric: value });
  };

  const handleDatePreset = (preset: (typeof DATE_PRESETS)[number]['id']) => {
    setFilters({
      dateRange: {
        type: preset,
        start: undefined,
        end: undefined,
        years: undefined,
      },
    });
  };

  const handleYearSelect = (year: number) => {
    const currentYears = filters.dateRange.years || [];
    const exists = currentYears.includes(year);
    const nextYears = exists
      ? currentYears.filter((y) => y !== year)
      : [...currentYears, year];

    setFilters({
      dateRange: {
        type: 'custom',
        years: nextYears.sort((a, b) => a - b),
        start: undefined,
        end: undefined,
      },
    });
  };

  const handleCustomDateChange = (key: 'start' | 'end', value: string) => {
    const nextStart =
      key === 'start' ? (value ? new Date(value) : undefined) : filters.dateRange.start;
    const nextEnd =
      key === 'end' ? (value ? new Date(value) : undefined) : filters.dateRange.end;

    setFilters({
      dateRange: {
        type: 'custom',
        start: nextStart,
        end: nextEnd,
        years: undefined,
      },
    });
  };

  const formatDateInput = (date?: Date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-4 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Uploads
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilters({ selectedSources: [] })}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition border ${
                isAllSourcesSelected
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              All accounts
            </button>
            {enabledSources.map((source) => (
              <button
                type="button"
                key={source.id}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition border ${
                  selectedSourceIds.includes(source.id)
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
                onClick={() => toggleSource(source.id)}
              >
                {source.name || 'Untitled source'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Content type
          </p>
          <div className="flex flex-wrap gap-2">
            {(['both', 'music', 'podcast'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleContentToggle(type)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition border ${
                  filters.contentType === type
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Metric
          </p>
          <div className="flex flex-wrap gap-2">
            {(['minutes', 'plays'] as const).map((metric) => (
              <button
                key={metric}
                type="button"
                onClick={() => handleMetricToggle(metric)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition border ${
                  filters.metric === metric
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {metric}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Date range
          </p>
          <div className="flex flex-wrap gap-2">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleDatePreset(preset.id)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition border ${
                  filters.dateRange.type === preset.id
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100'
                    : 'border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
            {availableYears.length > 0 && (
              <>
                {availableYears.slice(0, 5).map((year) => {
                  const isSelected = filters.dateRange.years
                    ? filters.dateRange.years.includes(year)
                    : filters.dateRange.type === 'custom' &&
                      filters.dateRange.start &&
                      filters.dateRange.end &&
                      year >= filters.dateRange.start.getFullYear() &&
                      year <= filters.dateRange.end.getFullYear();
                  return (
                    <button
                      key={year}
                      type="button"
                      onClick={() => handleYearSelect(year)}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium transition border ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {year}
                    </button>
                  );
                })}
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <label className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">From</span>
              <input
                type="date"
                value={formatDateInput(filters.dateRange.start)}
                onChange={(event) => handleCustomDateChange('start', event.target.value)}
                className="rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 py-1 text-slate-700 dark:text-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </label>
            <label className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">To</span>
              <input
                type="date"
                value={formatDateInput(filters.dateRange.end)}
                onChange={(event) => handleCustomDateChange('end', event.target.value)}
                className="rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 py-1 text-slate-700 dark:text-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
