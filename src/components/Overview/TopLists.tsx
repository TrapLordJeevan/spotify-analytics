'use client';

import { useMemo } from 'react';
import { getTopSongs, getTopArtists } from '@/lib/analytics/overview';
import type { Play, TopArtist, TopSong } from '@/types';

interface TopListsProps {
  plays: Play[];
}

export function TopLists({ plays }: TopListsProps) {
  const { topSongs, topArtists } = useMemo(() => {
    const songs = getTopSongs(plays, 5);
    const artists = getTopArtists(plays, 5);
    return { topSongs: songs, topArtists: artists };
  }, [plays]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <TopListCard title="Top artists" items={topArtists} />
      <TopSongListCard title="Top songs" items={topSongs} />
    </div>
  );
}

const intlPercent = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });

function TopListCard({ title, items }: { title: string; items: TopArtist[] }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-4 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No data yet.</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {items.map((item, index) => (
            <li key={item.artistName} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {index + 1}
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{item.artistName}</span>
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                {Math.round(item.minutes)} min · {intlPercent.format(item.percentage)}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TopSongListCard({ title, items }: { title: string; items: TopSong[] }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-4 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No data yet.</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {items.map((item, index) => (
            <li key={`${item.artistName}-${item.trackName}`} className="text-sm">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{item.trackName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.artistName}</p>
                </div>
                <span className="ml-auto text-slate-500 dark:text-slate-400">
                  {Math.round(item.minutes)} min · {intlPercent.format(item.percentage)}%
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}




