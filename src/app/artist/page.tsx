'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/Layout/MainLayout';
import { StatCard } from '@/components/AnalyticsUI/StatCard';
import { TrackItem } from '@/components/AnalyticsUI/TrackItem';
import { AlbumCard } from '@/components/AnalyticsUI/AlbumCard';
import { useDataStore } from '@/store/useDataStore';
import { getTopSongs } from '@/lib/analytics/overview';
import { getTopAlbums } from '@/lib/analytics/topItems';
import type { Play } from '@/types';

const palette = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
];

export default function ArtistPage() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name');
  const plays = useDataStore((state) => state.getFilteredPlays());
  const hasAnyData = useDataStore((state) => state.plays.length > 0);

  const artistPlays = useMemo(() => {
    if (!name) return [];
    return plays.filter(
      (p) => p.artistName === name && p.contentType === 'music'
    );
  }, [name, plays]);

  if (!name || artistPlays.length === 0) {
    return (
      <MainLayout title="Artist details">
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">No artist data available</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {hasAnyData ? 'Pick an artist from the list to see their details.' : 'Please upload your history again to get artist insights.'}
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link
              href="/upload"
              className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
            >
              Go to upload
            </Link>
            <Link
              href="/artists"
              className="inline-flex items-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Back to artists
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const totalPlays = artistPlays.length;
  const totalMinutes = Math.round(
    artistPlays.reduce((sum, play) => sum + play.msPlayed / 60000, 0)
  );
  const skips = artistPlays.filter((p) => p.skipped).length;
  const firstPlay = artistPlays.reduce(
    (min, play) => (play.timestamp < min ? play.timestamp : min),
    artistPlays[0].timestamp
  );
  const lastPlay = artistPlays.reduce(
    (max, play) => (play.timestamp > max ? play.timestamp : max),
    artistPlays[0].timestamp
  );

  const topSongs = useMemo(() => getTopSongs(artistPlays, 50, 'minutes'), [artistPlays]);
  const topAlbums = useMemo(() => getTopAlbums(artistPlays, 12, 'minutes'), [artistPlays]);

  const dayMap = useMemo(() => {
    const map = new Map<string, number>();
    artistPlays.forEach((p) => {
      const key = p.timestamp.toISOString().split('T')[0];
      map.set(key, (map.get(key) || 0) + 1);
    });
    let best: { date: Date; plays: number } | undefined;
    for (const [day, count] of map.entries()) {
      if (!best || count > best.plays) best = { date: new Date(day), plays: count };
    }
    return best;
  }, [artistPlays]);

  const formatDate = (date: Date | undefined) =>
    date ? date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <MainLayout showFilters title={name}>
      <section className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total plays" value={totalPlays.toLocaleString()} subtitle="All tracks by this artist" gradient={palette[0]} />
          <StatCard label="Minutes listened" value={totalMinutes.toLocaleString()} subtitle="Total time with this artist" gradient={palette[1]} />
          <StatCard label="Skips" value={skips.toLocaleString()} subtitle="Skipped plays" gradient={palette[2]} />
          <StatCard
            label="Peak day"
            value={formatDate(dayMap?.date)}
            subtitle={dayMap ? `${dayMap.plays.toLocaleString()} plays` : '—'}
            gradient={palette[3]}
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-sm text-slate-300">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>First play: {formatDate(firstPlay)}</span>
            <span>Last play: {formatDate(lastPlay)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Top songs</h2>
          </div>
          <div className="space-y-3">
            {topSongs.map((song, idx) => (
              <TrackItem
                key={`${song.artistName}-${song.trackName}`}
                rank={idx + 1}
                title={song.trackName}
                artist={song.artistName}
                plays={song.playCount}
                stats={{
                  plays: song.playCount,
                  minutes: song.minutes,
                  sharePercent: song.percentage,
                  skips: undefined,
                }}
                accent={palette[idx % palette.length]}
              />
            ))}
          </div>
        </div>

        {topAlbums.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Top albums</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {topAlbums.map((album, idx) => (
                <AlbumCard
                  key={`${album.artistName}-${album.albumName}`}
                  name={album.albumName}
                  artist={album.artistName}
                  plays={album.playCount}
                  minutes={album.minutes}
                  accent={palette[idx % palette.length]}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </MainLayout>
  );
}
