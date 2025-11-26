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
    <div className="grid gap-6 lg:grid-cols-2">
      <TopListCard title="Top artists" items={topArtists} />
      <TopSongListCard title="Top songs" items={topSongs} />
    </div>
  );
}

const intlPercent = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });

function TopListCard({ title, items }: { title: string; items: TopArtist[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">No data yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item, index) => (
            <li key={item.artistName} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                  {index + 1}
                </span>
                <span className="font-medium text-slate-800">{item.artistName}</span>
              </span>
              <span className="text-slate-500">
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
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">No data yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item, index) => (
            <li key={`${item.artistName}-${item.trackName}`} className="text-sm">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-slate-800">{item.trackName}</p>
                  <p className="text-xs text-slate-500">{item.artistName}</p>
                </div>
                <span className="ml-auto text-slate-500">
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




