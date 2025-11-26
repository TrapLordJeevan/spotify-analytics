'use client';

import { useMemo, useState, useDeferredValue } from 'react';
import { getTopArtists } from '@/lib/analytics/topItems';
import type { Play } from '@/types';

interface ArtistsTableProps {
  plays: Play[];
  limit?: number;
  metric: 'minutes' | 'plays';
}

const intlPercent = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });

export function ArtistsTable({ plays, limit = 0, metric }: ArtistsTableProps) {
  const [query, setQuery] = useState('');
  const effectiveLimit = Math.max(plays.length, limit);
  const rows = useMemo(() => getTopArtists(plays, effectiveLimit, metric), [plays, effectiveLimit, metric]);
  const [sortKey, setSortKey] = useState<'artist' | 'minutes' | 'plays' | 'share' | 'peak'>('minutes');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [selectedArtistDetail, setSelectedArtistDetail] = useState<{
    artistName: string;
    playCount: number;
    minutes: number;
    skipped: number;
    firstPlay: Date;
    lastPlay: Date;
    peakDay?: { date: Date; plays: number };
    topSong?: { trackName: string; plays: number; minutes: number };
    topAlbum?: { albumName: string; plays: number; minutes: number };
  } | null>(null);

  const deferredQuery = useDeferredValue(query.toLowerCase());

  const filteredRows = useMemo(
    () => rows.filter((row) => row.artistName.toLowerCase().includes(deferredQuery)),
    [rows, deferredQuery]
  );

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      const getVal = (row: typeof rows[number]) => {
        switch (sortKey) {
          case 'artist':
            return row.artistName.toLowerCase();
          case 'minutes':
            return row.minutes;
          case 'plays':
            return row.playCount;
          case 'share':
            return row.percentage;
          case 'peak':
            return row.peakMonth ? row.peakMonth.year * 12 + row.peakMonth.month : -Infinity;
        }
      };
      const aVal = getVal(a);
      const bVal = getVal(b);
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
      setSortDir(key === 'artist' ? 'asc' : 'desc');
    }
  };

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = sortedRows.slice((currentPage - 1) * perPage, currentPage * perPage);

  const primaryLabel = metric === 'minutes' ? 'Minutes' : 'Plays';
  const secondaryLabel = metric === 'minutes' ? 'Plays' : 'Minutes';

  const buildArtistStats = (artistName: string) => {
    const artistPlays = plays.filter(
      (p) => p.artistName === artistName && p.contentType === 'music'
    );
    if (artistPlays.length === 0) return null;
    const playCount = artistPlays.length;
    const minutes = Math.round(
      artistPlays.reduce((sum, p) => sum + p.msPlayed / 60000, 0)
    );
    const skipped = artistPlays.filter((p) => p.skipped).length;
    const firstPlay = artistPlays.reduce(
      (min, p) => (p.timestamp < min ? p.timestamp : min),
      artistPlays[0].timestamp
    );
    const lastPlay = artistPlays.reduce(
      (max, p) => (p.timestamp > max ? p.timestamp : max),
      artistPlays[0].timestamp
    );
    const dayMap = new Map<string, number>();
    artistPlays.forEach((p) => {
      const key = p.timestamp.toISOString().split('T')[0];
      dayMap.set(key, (dayMap.get(key) || 0) + 1);
    });
    let best: { date: Date; plays: number } | undefined;
    for (const [day, count] of dayMap.entries()) {
      if (!best || count > best.plays) best = { date: new Date(day), plays: count };
    }

    const trackMap = new Map<string, { plays: number; minutes: number }>();
    artistPlays.forEach((p) => {
      if (!p.trackName) return;
      const current = trackMap.get(p.trackName) || { plays: 0, minutes: 0 };
      trackMap.set(p.trackName, {
        plays: current.plays + 1,
        minutes: current.minutes + p.msPlayed / 60000,
      });
    });
    let topSong: { trackName: string; plays: number; minutes: number } | undefined;
    for (const [track, data] of trackMap.entries()) {
      if (!topSong || data.plays > topSong.plays) {
        topSong = { trackName: track, plays: data.plays, minutes: Math.round(data.minutes) };
      }
    }

    const albumMap = new Map<string, { plays: number; minutes: number }>();
    artistPlays.forEach((p) => {
      if (!p.albumName) return;
      const current = albumMap.get(p.albumName) || { plays: 0, minutes: 0 };
      albumMap.set(p.albumName, {
        plays: current.plays + 1,
        minutes: current.minutes + p.msPlayed / 60000,
      });
    });
    let topAlbum: { albumName: string; plays: number; minutes: number } | undefined;
    for (const [album, data] of albumMap.entries()) {
      if (!topAlbum || data.plays > topAlbum.plays) {
        topAlbum = { albumName: album, plays: data.plays, minutes: Math.round(data.minutes) };
      }
    }
    return { artistName, playCount, minutes, skipped, firstPlay, lastPlay, peakDay: best, topSong, topAlbum };
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 px-4 py-3">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Top artists</h3>
        <input
          type="text"
          placeholder="Search artists"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-48 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />
      </div>
      <div className="max-h-[480px] overflow-y-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 dark:bg-slate-700 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">
                <button className="flex items-center gap-1" onClick={() => toggleSort('artist')}>
                  Artist {sortKey === 'artist' && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-4 py-2 text-right">
                <button className="flex items-center gap-1" onClick={() => toggleSort(primaryLabel === 'Minutes' ? 'minutes' : 'plays')}>
                  {primaryLabel} {sortKey === (primaryLabel === 'Minutes' ? 'minutes' : 'plays') && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-4 py-2 text-right">
                <button className="flex items-center gap-1" onClick={() => toggleSort(primaryLabel === 'Minutes' ? 'plays' : 'minutes')}>
                  {secondaryLabel} {sortKey === (primaryLabel === 'Minutes' ? 'plays' : 'minutes') && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-4 py-2 text-right">
                <button className="flex items-center gap-1" onClick={() => toggleSort('share')}>
                  Share ({metric}) {sortKey === 'share' && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-4 py-2 text-right">
                <button className="flex items-center gap-1" onClick={() => toggleSort('peak')}>
                  Peak month {sortKey === 'peak' && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-200">
            {pagedRows.map((artist, index) => (
              <tr
                key={artist.artistName}
                className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/60"
                onClick={() => {
                  const stats = buildArtistStats(artist.artistName);
                  if (stats) setSelectedArtistDetail(stats);
                }}
              >
                <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                  {(currentPage - 1) * perPage + index + 1}
                </td>
                <td className="px-4 py-2 font-medium">{artist.artistName}</td>
                <td className="px-4 py-2 text-right">
                  {metric === 'minutes' ? Math.round(artist.minutes) : artist.playCount}
                </td>
                <td className="px-4 py-2 text-right">
                  {metric === 'minutes' ? artist.playCount : Math.round(artist.minutes)}
                </td>
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
                  className="px-4 py-4 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  No artists match “{query}”.
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
      {selectedArtistDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-400">Artist</p>
                <h3 className="text-xl font-semibold text-slate-100">{selectedArtistDetail.artistName}</h3>
              </div>
              <button
                onClick={() => setSelectedArtistDetail(null)}
                className="rounded-md border border-slate-600 px-2 py-1 text-sm text-slate-200 hover:bg-slate-700"
              >
                Close
              </button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <ArtistStat label="Plays" value={selectedArtistDetail.playCount.toLocaleString()} />
              <ArtistStat label="Minutes" value={selectedArtistDetail.minutes.toLocaleString()} />
              <ArtistStat label="Skips" value={selectedArtistDetail.skipped.toLocaleString()} />
              <ArtistStat
                label="First listened"
                value={selectedArtistDetail.firstPlay.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              />
              <ArtistStat
                label="Last listened"
                value={selectedArtistDetail.lastPlay.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              />
              <ArtistStat
                label="Peak day"
                value={
                  selectedArtistDetail.peakDay
                    ? `${selectedArtistDetail.peakDay.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} (${selectedArtistDetail.peakDay.plays} plays)`
                    : '—'
                }
              />
              <ArtistStat
                label="Top song"
                value={
                  selectedArtistDetail.topSong
                    ? `${selectedArtistDetail.topSong.trackName} (${selectedArtistDetail.topSong.plays} plays, ${selectedArtistDetail.topSong.minutes} min)`
                    : '—'
                }
              />
              <ArtistStat
                label="Top album"
                value={
                  selectedArtistDetail.topAlbum
                    ? `${selectedArtistDetail.topAlbum.albumName} (${selectedArtistDetail.topAlbum.plays} plays, ${selectedArtistDetail.topAlbum.minutes} min)`
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

function ArtistStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-100">{value}</p>
    </div>
  );
}
