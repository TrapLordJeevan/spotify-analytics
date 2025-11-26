'use client';

import { useMemo, useState } from 'react';
import { getTopArtists } from '@/lib/analytics/topItems';
import type { Play, TopArtist } from '@/types';

interface ArtistsTableProps {
  plays: Play[];
  limit?: number;
}

const intlPercent = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });

export function ArtistsTable({ plays, limit = 50 }: ArtistsTableProps) {
  const [query, setQuery] = useState('');
  const rows = useMemo(() => getTopArtists(plays, limit), [plays, limit]);

  const filteredRows = rows.filter((row) =>
    row.artistName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h3 className="text-base font-semibold text-slate-900">Top artists</h3>
        <input
          type="text"
          placeholder="Search artists"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-48 rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />
      </div>
      <div className="max-h-[480px] overflow-y-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Artist</th>
              <th className="px-4 py-2 text-right">Minutes</th>
              <th className="px-4 py-2 text-right">Plays</th>
              <th className="px-4 py-2 text-right">Share</th>
              <th className="px-4 py-2 text-right">Peak month</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredRows.map((artist, index) => (
              <tr key={artist.artistName}>
                <td className="px-4 py-2 text-slate-500">{index + 1}</td>
                <td className="px-4 py-2 font-medium">{artist.artistName}</td>
                <td className="px-4 py-2 text-right">{Math.round(artist.minutes)}</td>
                <td className="px-4 py-2 text-right">{artist.playCount}</td>
                <td className="px-4 py-2 text-right">
                  {intlPercent.format(artist.percentage)}%
                </td>
                <td className="px-4 py-2 text-right">
                  {artist.peakMonth
                    ? `${artist.peakMonth.month}/${artist.peakMonth.year}`
                    : '—'}
                </td>
              </tr>
            ))}
            {filteredRows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-4 text-center text-sm text-slate-500"
                >
                  No artists match “{query}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}




