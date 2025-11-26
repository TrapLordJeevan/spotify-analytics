'use client';

import { useMemo, useState } from 'react';
import { getTopSkippedSongs } from '@/lib/analytics/topItems';
import type { Play } from '@/types';

interface SkippedSongsCardProps {
  plays: Play[];
}

const intlPercent = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });

export function SkippedSongsCard({ plays }: SkippedSongsCardProps) {
  const rows = useMemo(() => getTopSkippedSongs(plays, plays.length || 1000), [plays]);
  const [sortKey, setSortKey] = useState<'title' | 'artist' | 'skips' | 'plays' | 'rate'>('skips');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sortedRows = useMemo(() => {
    const getVal = (row: (typeof rows)[number]) => {
      switch (sortKey) {
        case 'title':
          return row.trackName.toLowerCase();
        case 'artist':
          return row.artistName.toLowerCase();
        case 'skips':
          return row.skipCount;
        case 'plays':
          return row.totalPlays;
        case 'rate':
          return row.skipRate;
      }
    };
    return [...rows].sort((a, b) => {
      const aVal = getVal(a);
      const bVal = getVal(b);
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const cmp = aVal.localeCompare(bVal);
        return sortDir === 'asc' ? cmp : -cmp;
      }
      const cmp = (aVal as number) - (bVal as number);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [rows, sortDir, sortKey]);

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'title' || key === 'artist' ? 'asc' : 'desc');
    }
  };

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-4 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Most skipped songs</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No skipped plays detected in this view.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-4 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Most skipped songs</h3>
      <div className="mt-3 max-h-[420px] overflow-y-auto">
        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700 text-sm">
          <thead className="bg-slate-50 dark:bg-slate-700 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">
                <button className="flex items-center gap-1" onClick={() => toggleSort('title')}>
                  Song {sortKey === 'title' && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-3 py-2 text-left">
                <button className="flex items-center gap-1" onClick={() => toggleSort('artist')}>
                  Artist {sortKey === 'artist' && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-3 py-2 text-right">
                <button className="flex items-center gap-1" onClick={() => toggleSort('plays')}>
                  Plays {sortKey === 'plays' && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-3 py-2 text-right">
                <button className="flex items-center gap-1" onClick={() => toggleSort('skips')}>
                  Skips {sortKey === 'skips' && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-3 py-2 text-right">
                <button className="flex items-center gap-1" onClick={() => toggleSort('rate')}>
                  Skip rate {sortKey === 'rate' && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-200">
            {sortedRows.map((row, index) => (
              <tr key={`${row.artistName}-${row.trackName}`}>
                <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{index + 1}</td>
                <td className="px-3 py-2 font-medium">{row.trackName}</td>
                <td className="px-3 py-2">{row.artistName}</td>
                <td className="px-3 py-2 text-right">{row.totalPlays}</td>
                <td className="px-3 py-2 text-right">{row.skipCount}</td>
                <td className="px-3 py-2 text-right">{intlPercent.format(row.skipRate)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Skip rate is skips divided by total plays for that track in the current filters.
      </p>
    </div>
  );
}
