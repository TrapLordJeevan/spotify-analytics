'use client';

import { useMemo } from 'react';
import { useDataStore } from '@/store/useDataStore';

export function SourceManager() {
  const sources = useDataStore((state) => state.sources);
  const updateSourceName = useDataStore((state) => state.updateSourceName);
  const setSourceEnabled = useDataStore((state) => state.setSourceEnabled);
  const setAllSourcesEnabled = useDataStore((state) => state.setAllSourcesEnabled);
  const clearAllData = useDataStore((state) => state.clearAllData);

  const hasSources = sources.length > 0;
  const enabledCount = useMemo(
    () => sources.filter((source) => source.enabled).length,
    [sources]
  );

  if (!hasSources) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-5 py-6">
        <p className="text-sm text-slate-600">
          Upload a ZIP or JSON file to see your accounts here. Each upload becomes a Source you can rename or toggle.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-slate-600">
          {enabledCount} / {sources.length} sources enabled
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            onClick={() => setAllSourcesEnabled(true)}
          >
            Enable all
          </button>
          <button
            type="button"
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            onClick={() => setAllSourcesEnabled(false)}
          >
            Disable all
          </button>
          <button
            type="button"
            className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
            onClick={() => clearAllData()}
          >
            Clear all data
          </button>
        </div>
      </div>

      <ul className="space-y-3">
        {sources.map((source) => (
          <li
            key={source.id}
            className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="w-full sm:max-w-md">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Source name
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                value={source.name}
                onChange={(event) => updateSourceName(source.id, event.currentTarget.value)}
              />
              {source.detectedUsername && (
                <p className="mt-1 text-xs text-slate-500">
                  Detected username: <span className="font-medium">{source.detectedUsername}</span>
                </p>
              )}
            </div>
            <div className="w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setSourceEnabled(source.id)}
                className={`w-full rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition ${
                  source.enabled
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {source.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}


