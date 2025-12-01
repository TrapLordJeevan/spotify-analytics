'use client';

import { useMemo, useState, useDeferredValue } from 'react';
import { useRouter } from 'next/navigation';
import { getTopSongs, getTopEpisodes } from '@/lib/analytics/topItems';
import { getSongId, getSongKeyFromNames } from '@/lib/songUtils';
import type { Play } from '@/types';

interface SongsTableProps {
  plays: Play[];
  mode: 'music' | 'podcast';
  limit?: number;
  metric: 'minutes' | 'plays';
}

const intlPercent = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });

export function SongsTable({ plays, mode, limit = 100, metric }: SongsTableProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<string>('');
  const [sortKey, setSortKey] = useState<'rank' | 'title' | 'artist' | 'minutes' | 'plays' | 'share'>('rank');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  // Get unique artists from plays (for music mode only)
  const availableArtists = useMemo(() => {
    if (mode !== 'music') return [];
    const artistSet = new Set<string>();
    plays.forEach((play) => {
      if (play.contentType === 'music' && play.artistName) {
        artistSet.add(play.artistName);
      }
    });
    return Array.from(artistSet).sort();
  }, [plays, mode]);

  const rows = useMemo(() => {
    const effectiveLimit = Math.max(plays.length, limit || 0);
    if (mode === 'podcast') {
      return getTopEpisodes(plays, effectiveLimit, metric).map((episode) => ({
        type: 'episode' as const,
        ...episode,
      }));
    }
    return getTopSongs(plays, effectiveLimit, metric).map((song) => ({
      type: 'song' as const,
      ...song,
    }));
  }, [plays, limit, mode, metric]);

  const deferredQuery = useDeferredValue(query.toLowerCase());

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (selectedArtist && row.type === 'song' && row.artistName !== selectedArtist) {
        return false;
      }
      const haystack =
        row.type === 'song'
          ? `${row.trackName} ${row.artistName}`.toLowerCase()
          : `${row.episodeName} ${row.showName}`.toLowerCase();
      return haystack.includes(deferredQuery);
    });
  }, [rows, selectedArtist, deferredQuery]);

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      const getValue = (row: (typeof rows)[number]) => {
        switch (sortKey) {
          case 'title':
            return row.type === 'song' ? row.trackName.toLowerCase() : row.episodeName.toLowerCase();
          case 'artist':
            return row.type === 'song' ? row.artistName.toLowerCase() : row.showName.toLowerCase();
          case 'minutes':
            return row.minutes;
          case 'plays':
            return row.playCount;
          case 'share':
            return row.percentage;
          default:
            return 0;
        }
      };
      const aVal = getValue(a);
      const bVal = getValue(b);

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const cmp = aVal.localeCompare(bVal);
        return sortDir === 'asc' ? cmp : -cmp;
      }

      const cmp = (aVal as number) - (bVal as number);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filteredRows, sortKey, sortDir]);

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'title' || key === 'artist' ? 'asc' : 'desc');
    }
  };

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = sortedRows.slice((currentPage - 1) * perPage, currentPage * perPage);

  const songIdLookup = useMemo(() => {
    if (mode !== 'music') return new Map<string, string>();
    const map = new Map<string, string>();
    plays.forEach((play) => {
      if (play.contentType !== 'music' || !play.artistName || !play.trackName) return;
      const key = getSongKeyFromNames(play.artistName, play.trackName);
      if (!map.has(key)) {
        map.set(key, getSongId(play));
      }
    });
    return map;
  }, [plays, mode]);

  return (
    <>
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-slate-700 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {mode === 'podcast' ? 'Top episodes' : 'Top songs'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing {pagedRows.length} of {filteredRows.length} entries (page {currentPage} of {totalPages})
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {mode === 'music' && availableArtists.length > 0 && (
            <select
              value={selectedArtist}
              onChange={(event) => setSelectedArtist(event.target.value)}
              className="rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              <option value="">All artists</option>
              {availableArtists.map((artist) => (
                <option key={artist} value={artist}>
                  {artist}
                </option>
              ))}
            </select>
          )}
          <input
            type="text"
            placeholder={`Search ${mode === 'podcast' ? 'episodes or shows' : 'songs or artists'}`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="flex-1 min-w-[200px] rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700 text-sm">
          <thead className="bg-slate-50 dark:bg-slate-700 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">
                <button className="flex items-center gap-1" onClick={() => toggleSort('title')}>
                  {mode === 'podcast' ? 'Episode' : 'Song'}
                  {sortKey === 'title' && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-4 py-2 text-left">
                <button className="flex items-center gap-1" onClick={() => toggleSort('artist')}>
                  {mode === 'podcast' ? 'Show' : 'Artist'}
                  {sortKey === 'artist' && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-4 py-2 text-right">
                <button className="flex items-center gap-1" onClick={() => toggleSort(metric === 'minutes' ? 'minutes' : 'plays')}>
                  {metric === 'minutes' ? 'Minutes' : 'Plays'}
                  {sortKey === (metric === 'minutes' ? 'minutes' : 'plays') && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-4 py-2 text-right">
                <button className="flex items-center gap-1" onClick={() => toggleSort(metric === 'minutes' ? 'plays' : 'minutes')}>
                  {metric === 'minutes' ? 'Plays' : 'Minutes'}
                  {sortKey === (metric === 'minutes' ? 'plays' : 'minutes') && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-4 py-2 text-right">
                <button className="flex items-center gap-1" onClick={() => toggleSort('share')}>
                  Share ({metric}) {sortKey === 'share' && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-300">
            {pagedRows.map((row, index) => (
              <tr
                key={`${row.type === 'song' ? row.trackName : row.episodeName}-${row.type === 'song' ? row.artistName : row.showName}`}
                className={row.type === 'song' ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/60' : undefined}
                onClick={() => {
                  if (row.type === 'song') {
                    const key = getSongKeyFromNames(row.artistName, row.trackName);
                    const songId = songIdLookup.get(key) || key;
                    router.push(`/song?songId=${encodeURIComponent(songId)}`);
                  }
                }}
              >
                <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{(currentPage - 1) * perPage + index + 1}</td>
                <td className="px-4 py-2 font-medium max-w-[220px] truncate" title={row.type === 'song' ? row.trackName : row.episodeName}>
                  {row.type === 'song' ? row.trackName : row.episodeName}
                </td>
                <td className="px-4 py-2 max-w-[200px] truncate" title={row.type === 'song' ? row.artistName : row.showName}>
                  {row.type === 'song' ? row.artistName : row.showName}
                </td>
                <td className="px-4 py-2 text-right">
                  {metric === 'minutes' ? Math.round(row.minutes) : row.playCount}
                </td>
                <td className="px-4 py-2 text-right">
                  {metric === 'minutes' ? row.playCount : Math.round(row.minutes)}
                </td>
                <td className="px-4 py-2 text-right">
                  {intlPercent.format(row.percentage)}%
                </td>
              </tr>
            ))}
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                  No results match “{query}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 py-1 text-sm"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-md border border-slate-200 dark:border-slate-600 px-3 py-1 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span>
            Page {currentPage} / {totalPages}
          </span>
          <button
            className="rounded-md border border-slate-200 dark:border-slate-600 px-3 py-1 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
