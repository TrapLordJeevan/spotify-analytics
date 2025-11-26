'use client';

import { useMemo, useState, useDeferredValue } from 'react';
import { getTopAlbums } from '@/lib/analytics/topItems';
import type { Play, TopAlbum } from '@/types';

interface AlbumsTableProps {
  plays: Play[];
  metric: 'minutes' | 'plays';
}

const intlPercent = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });

export function AlbumsTable({ plays, metric }: AlbumsTableProps) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<'rank' | 'album' | 'artist' | 'minutes' | 'plays' | 'share'>(
    metric === 'minutes' ? 'minutes' : 'plays'
  );
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [selectedAlbum, setSelectedAlbum] = useState<
    | {
        albumName: string;
        artistName: string;
        playCount: number;
        minutes: number;
        skipped: number;
        firstPlay: Date;
        lastPlay: Date;
        peakDay?: { date: Date; plays: number };
        topTrack?: { trackName: string; plays: number };
      }
    | null
  >(null);

  const effectiveLimit = Math.max(plays.length, 0);
  const rows = useMemo(() => getTopAlbums(plays, effectiveLimit, metric), [plays, metric, effectiveLimit]);

  const deferredQuery = useDeferredValue(query.toLowerCase());

  const filteredRows = useMemo(
    () =>
      rows.filter((row) =>
        `${row.albumName} ${row.artistName}`.toLowerCase().includes(deferredQuery)
      ),
    [rows, deferredQuery]
  );

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      const getValue = (row: TopAlbum) => {
        switch (sortKey) {
          case 'album':
            return row.albumName.toLowerCase();
          case 'artist':
            return row.artistName.toLowerCase();
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
      setSortDir(key === 'album' || key === 'artist' ? 'asc' : 'desc');
    }
  };

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = sortedRows.slice((currentPage - 1) * perPage, currentPage * perPage);

  const buildAlbumStats = (albumName: string, artistName: string) => {
    const albumPlays = plays.filter(
      (p) =>
        p.albumName === albumName &&
        p.artistName === artistName &&
        p.contentType === 'music'
    );
    if (albumPlays.length === 0) return null;
    const playCount = albumPlays.length;
    const minutes = Math.round(albumPlays.reduce((sum, p) => sum + p.msPlayed / 60000, 0));
    const skipped = albumPlays.filter((p) => p.skipped).length;
    const firstPlay = albumPlays.reduce((min, p) => (p.timestamp < min ? p.timestamp : min), albumPlays[0].timestamp);
    const lastPlay = albumPlays.reduce((max, p) => (p.timestamp > max ? p.timestamp : max), albumPlays[0].timestamp);

    const dayMap = new Map<string, number>();
    albumPlays.forEach((p) => {
      const key = p.timestamp.toISOString().split('T')[0];
      dayMap.set(key, (dayMap.get(key) || 0) + 1);
    });
    let peakDay: { date: Date; plays: number } | undefined;
    for (const [day, count] of dayMap.entries()) {
      if (!peakDay || count > peakDay.plays) peakDay = { date: new Date(day), plays: count };
    }

    const trackMap = new Map<string, number>();
    albumPlays.forEach((p) => {
      if (!p.trackName) return;
      trackMap.set(p.trackName, (trackMap.get(p.trackName) || 0) + 1);
    });
    let topTrack: { trackName: string; plays: number } | undefined;
    for (const [track, count] of trackMap.entries()) {
      if (!topTrack || count > topTrack.plays) topTrack = { trackName: track, plays: count };
    }

    return { albumName, artistName, playCount, minutes, skipped, firstPlay, lastPlay, peakDay, topTrack };
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 px-4 py-3">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Top albums</h3>
        <input
          type="text"
          placeholder="Search albums or artists"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-56 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />
      </div>
      <div className="max-h-[520px] overflow-y-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 dark:bg-slate-700 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">
                <button className="flex items-center gap-1" onClick={() => toggleSort('album')}>
                  Album {sortKey === 'album' && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-4 py-2 text-left">
                <button className="flex items-center gap-1" onClick={() => toggleSort('artist')}>
                  Artist {sortKey === 'artist' && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-4 py-2 text-right">
                <button
                  className="flex items-center gap-1"
                  onClick={() => toggleSort(metric === 'minutes' ? 'minutes' : 'plays')}
                >
                  {metric === 'minutes' ? 'Minutes' : 'Plays'}{' '}
                  {sortKey === (metric === 'minutes' ? 'minutes' : 'plays') && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-4 py-2 text-right">
                <button
                  className="flex items-center gap-1"
                  onClick={() => toggleSort(metric === 'minutes' ? 'plays' : 'minutes')}
                >
                  {metric === 'minutes' ? 'Plays' : 'Minutes'}{' '}
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
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-200">
            {pagedRows.map((album, index) => (
              <tr
                key={`${album.artistName}-${album.albumName}`}
                className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/60"
                onClick={() => {
                  const stats = buildAlbumStats(album.albumName, album.artistName);
                  if (stats) setSelectedAlbum(stats);
                }}
              >
                <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                  {(currentPage - 1) * perPage + index + 1}
                </td>
                <td className="px-4 py-2 font-medium max-w-[220px] truncate" title={album.albumName}>
                  {album.albumName}
                </td>
                <td className="px-4 py-2 max-w-[200px] truncate" title={album.artistName}>
                  {album.artistName}
                </td>
                <td className="px-4 py-2 text-right">
                  {metric === 'minutes' ? Math.round(album.minutes) : album.playCount}
                </td>
                <td className="px-4 py-2 text-right">
                  {metric === 'minutes' ? album.playCount : Math.round(album.minutes)}
                </td>
                <td className="px-4 py-2 text-right">{intlPercent.format(album.percentage)}%</td>
              </tr>
            ))}
            {sortedRows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                  No albums match “{query}”.
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
      {selectedAlbum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-400">Album</p>
                <h3 className="text-xl font-semibold text-slate-100">{selectedAlbum.albumName}</h3>
                <p className="text-sm text-slate-300">{selectedAlbum.artistName}</p>
              </div>
              <button
                onClick={() => setSelectedAlbum(null)}
                className="rounded-md border border-slate-600 px-2 py-1 text-sm text-slate-200 hover:bg-slate-700"
              >
                Close
              </button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <AlbumStat label="Plays" value={selectedAlbum.playCount.toLocaleString()} />
              <AlbumStat label="Minutes" value={selectedAlbum.minutes.toLocaleString()} />
              <AlbumStat label="Skips" value={selectedAlbum.skipped.toLocaleString()} />
              <AlbumStat
                label="First listened"
                value={selectedAlbum.firstPlay.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              />
              <AlbumStat
                label="Last listened"
                value={selectedAlbum.lastPlay.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              />
              <AlbumStat
                label="Peak day"
                value={
                  selectedAlbum.peakDay
                    ? `${selectedAlbum.peakDay.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} (${selectedAlbum.peakDay.plays} plays)`
                    : '—'
                }
              />
              <AlbumStat
                label="Top track"
                value={
                  selectedAlbum.topTrack
                    ? `${selectedAlbum.topTrack.trackName} (${selectedAlbum.topTrack.plays} plays)`
                    : '—'
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AlbumStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-100">{value}</p>
    </div>
  );
}
