'use client';
export const dynamic = 'force-dynamic';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/Layout/MainLayout';
import { StatCard } from '@/components/AnalyticsUI/StatCard';
import { TrackItem } from '@/components/AnalyticsUI/TrackItem';
import { useDataStore } from '@/store/useDataStore';
import { getTopSongs } from '@/lib/analytics/overview';
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

export default function AlbumPage() {
  const searchParams = useSearchParams();
  const albumName = searchParams.get('name');
  const artistName = searchParams.get('artist');
  const plays = useDataStore((state) => state.getFilteredPlays());
  const hasAnyData = useDataStore((state) => state.plays.length > 0);

  const albumPlays = useMemo(() => {
    if (!albumName || !artistName) return [];
    return plays.filter(
      (p) => p.albumName === albumName && p.artistName === artistName && p.contentType === 'music'
    );
  }, [albumName, artistName, plays]);

  if (!albumName || albumPlays.length === 0) {
    return (
      <MainLayout title="Album details">
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">No album data available</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {hasAnyData ? 'Pick an album from the list to see its details.' : 'Please upload your history again to get album insights.'}
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link
              href="/upload"
              className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
            >
              Go to upload
            </Link>
            <Link
              href="/albums"
              className="inline-flex items-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Back to albums
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const totalPlays = albumPlays.length;
  const totalMinutes = Math.round(
    albumPlays.reduce((sum, play) => sum + play.msPlayed / 60000, 0)
  );
  const skips = albumPlays.filter((p) => p.skipped).length;
  const firstPlay = albumPlays.reduce(
    (min, play) => (play.timestamp < min ? play.timestamp : min),
    albumPlays[0].timestamp
  );
  const lastPlay = albumPlays.reduce(
    (max, play) => (play.timestamp > max ? play.timestamp : max),
    albumPlays[0].timestamp
  );

  const topTracks = useMemo(() => getTopSongs(albumPlays, 50, 'minutes'), [albumPlays]);

  const dayMap = useMemo(() => {
    const map = new Map<string, number>();
    albumPlays.forEach((p) => {
      const key = p.timestamp.toISOString().split('T')[0];
      map.set(key, (map.get(key) || 0) + 1);
    });
    let best: { date: Date; plays: number } | undefined;
    for (const [day, count] of map.entries()) {
      if (!best || count > best.plays) best = { date: new Date(day), plays: count };
    }
    return best;
  }, [albumPlays]);

  const formatDate = (date: Date | undefined) =>
    date ? date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <MainLayout showFilters title={`${albumName}`} description={artistName || undefined}>
      <section className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total plays" value={totalPlays.toLocaleString()} subtitle="All tracks on this album" gradient={palette[0]} />
          <StatCard label="Minutes listened" value={totalMinutes.toLocaleString()} subtitle="Time spent on this album" gradient={palette[1]} />
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
            <h2 className="text-xl font-bold text-white">Top tracks on this album</h2>
          </div>
          <div className="space-y-3">
            {topTracks.map((track, idx) => (
              <TrackItem
                key={`${track.artistName}-${track.trackName}`}
                rank={idx + 1}
                title={track.trackName}
                artist={track.artistName}
                plays={track.playCount}
                stats={{
                  plays: track.playCount,
                  minutes: track.minutes,
                  sharePercent: track.percentage,
                  skips: undefined,
                }}
                accent={palette[idx % palette.length]}
              />
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
