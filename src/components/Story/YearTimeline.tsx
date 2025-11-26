'use client';

import { useMemo } from 'react';
import type { Play } from '@/types';

interface YearTimelineProps {
  plays: Play[];
  metric: 'minutes' | 'plays';
}

export function YearTimeline({ plays, metric }: YearTimelineProps) {
  const timeline = useMemo(() => {
    const yearMap = new Map<number, Map<string, number>>();

    for (const play of plays) {
      if (!play.artistName) continue;
      const year = play.timestamp.getFullYear();
      const artistMap = yearMap.get(year) || new Map();
      const value = metric === 'minutes' ? play.msPlayed / 60000 : 1;
      artistMap.set(play.artistName, (artistMap.get(play.artistName) || 0) + value);
      yearMap.set(year, artistMap);
    }

    return Array.from(yearMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([year, artistMap]) => {
        const topArtist = Array.from(artistMap.entries()).sort(
          (a, b) => b[1] - a[1]
        )[0];
        return {
          year,
          artistName: topArtist ? topArtist[0] : 'Unknown',
          value: topArtist ? Math.round(topArtist[1]) : 0,
        };
      });
  }, [plays, metric]);

  if (timeline.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
        Not enough data to build a timeline yet.
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {timeline.map((entry) => (
        <div
          key={entry.year}
          className="min-w-[180px] rounded-2xl border border-slate-700 bg-slate-800 px-4 py-4 shadow-sm text-slate-100"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
            {entry.year}
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-100">{entry.artistName}</p>
          <p className="text-sm text-slate-300">
            {entry.value} {metric === 'minutes' ? 'minutes' : 'plays'}
          </p>
        </div>
      ))}
    </div>
  );
}


