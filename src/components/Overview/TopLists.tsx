'use client';

import { useMemo } from 'react';
import { getTopSongs, getTopArtists } from '@/lib/analytics/overview';
import type { Play, TopArtist, TopSong } from '@/types';

interface TopListsProps {
  plays: Play[];
  metric: 'minutes' | 'plays';
}

export function TopLists({ plays, metric }: TopListsProps) {
  const { topSongs, topArtists } = useMemo(() => {
    const songs = getTopSongs(plays, 5, metric);
    const artists = getTopArtists(plays, 5, metric);
    return { topSongs: songs, topArtists: artists };
  }, [plays, metric]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <TopListCard title="Top artists" items={topArtists} metric={metric} />
      <TopSongListCard title="Top songs" items={topSongs} metric={metric} />
    </div>
  );
}

const intlPercent = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });

function TopListCard({
  title,
  items,
  metric,
}: {
  title: string;
  items: TopArtist[];
  metric: 'minutes' | 'plays';
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111111] px-5 py-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-base text-slate-500 dark:text-slate-400">No data yet.</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {items.map((item, index) => (
            <li key={item.artistName} className="flex items-center justify-between text-base text-slate-100">
              <span className="flex items-center gap-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-slate-100">
                  {index + 1}
                </span>
                <span className="font-medium">{item.artistName}</span>
              </span>
              <span className="text-slate-400">
                {metric === 'minutes'
                  ? `${Math.round(item.minutes)} min`
                  : `${item.playCount} plays`}{' '}
                · {intlPercent.format(item.percentage)}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TopSongListCard({
  title,
  items,
  metric,
}: {
  title: string;
  items: TopSong[];
  metric: 'minutes' | 'plays';
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111111] px-5 py-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-base text-slate-500 dark:text-slate-400">No data yet.</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {items.map((item, index) => (
            <li key={`${item.artistName}-${item.trackName}`} className="text-base text-slate-100">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-slate-100">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium">{item.trackName}</p>
                  <p className="text-sm text-slate-400">{item.artistName}</p>
                </div>
                <span className="ml-auto text-slate-400">
                  {metric === 'minutes'
                    ? `${Math.round(item.minutes)} min`
                    : `${item.playCount} plays`}{' '}
                  · {intlPercent.format(item.percentage)}%
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
