'use client';

import { useMemo, useState } from 'react';
import { getTopSongs, getTopEpisodes } from '@/lib/analytics/topItems';
import type { Play } from '@/types';

interface SongsTableProps {
  plays: Play[];
  mode: 'music' | 'podcast';
  limit?: number;
}

const intlPercent = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });

export function SongsTable({ plays, mode, limit = 100 }: SongsTableProps) {
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    if (mode === 'podcast') {
      return getTopEpisodes(plays, limit).map((episode) => ({
        type: 'episode' as const,
        ...episode,
      }));
    }
    return getTopSongs(plays, limit).map((song) => ({
      type: 'song' as const,
      ...song,
    }));
  }, [plays, limit, mode]);

  const filteredRows = rows.filter((row) => {
    const haystack =
      row.type === 'song'
        ? `${row.trackName} ${row.artistName}`.toLowerCase()
        : `${row.episodeName} ${row.showName}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            {mode === 'podcast' ? 'Top episodes' : 'Top songs'}
          </h3>
          <p className="text-xs text-slate-500">
            Showing {filteredRows.length} of {rows.length} entries
          </p>
        </div>
        <input
          type="text"
          placeholder={`Search ${mode === 'podcast' ? 'episodes or shows' : 'songs or artists'}`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-64 rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">{mode === 'podcast' ? 'Episode' : 'Song'}</th>
              <th className="px-4 py-2 text-left">{mode === 'podcast' ? 'Show' : 'Artist'}</th>
              <th className="px-4 py-2 text-right">Minutes</th>
              <th className="px-4 py-2 text-right">Plays</th>
              <th className="px-4 py-2 text-right">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredRows.map((row, index) => (
              <tr key={`${row.type === 'song' ? row.trackName : row.episodeName}-${row.type === 'song' ? row.artistName : row.showName}`}>
                <td className="px-4 py-2 text-slate-500">{index + 1}</td>
                <td className="px-4 py-2 font-medium">
                  {row.type === 'song' ? row.trackName : row.episodeName}
                </td>
                <td className="px-4 py-2">
                  {row.type === 'song' ? row.artistName : row.showName}
                </td>
                <td className="px-4 py-2 text-right">{Math.round(row.minutes)}</td>
                <td className="px-4 py-2 text-right">{row.playCount}</td>
                <td className="px-4 py-2 text-right">
                  {intlPercent.format(row.percentage)}%
                </td>
              </tr>
            ))}
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-center text-sm text-slate-500">
                  No results match “{query}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


