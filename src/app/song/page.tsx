'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { MainLayout } from '@/components/Layout/MainLayout';
import { aggregateByYear } from '@/lib/aggregators';
import { matchesSongId } from '@/lib/songUtils';
import { useDataStore } from '@/store/useDataStore';
import type { Play } from '@/types';

const numberFormatter = new Intl.NumberFormat();

const formatDate = (date?: Date) =>
  date
    ? date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—';

const isSkip = (play: Play) => {
  return play.skipped === true || play.msPlayed < 30000;
};

export default function SongPage() {
  const searchParams = useSearchParams();
  const songId = searchParams.get('songId') || '';

  const filteredPlays = useDataStore((state) => state.getFilteredPlays());
  const hasAnyData = useDataStore((state) => state.plays.length > 0);

  const songPlays = useMemo(() => {
    if (!songId) return [];
    return filteredPlays.filter(
      (play) => play.contentType === 'music' && matchesSongId(play, songId)
    );
  }, [filteredPlays, songId]);

  const chartData = useMemo(() => {
    const yearly = aggregateByYear(songPlays, 'minutes');
    return Array.from(yearly.entries())
      .map(([year, minutes]) => ({
        label: String(year),
        minutes: Math.round(minutes),
      }))
      .sort((a, b) => Number(a.label) - Number(b.label));
  }, [songPlays]);

  const songMeta = songPlays[0];

  if (!songId || !songMeta) {
    return (
      <MainLayout title="Song details">
        <NoSongState hasAnyData={hasAnyData} songIdProvided={Boolean(songId)} />
      </MainLayout>
    );
  }

  const totalPlays = songPlays.length;
  const totalMinutes = Math.round(
    songPlays.reduce((sum, play) => sum + play.msPlayed / 60000, 0)
  );
  const totalHours = totalMinutes / 60;
  const skipped = songPlays.filter(isSkip).length;

  const firstPlay = songPlays.reduce(
    (min, play) => (play.timestamp < min ? play.timestamp : min),
    songPlays[0].timestamp
  );
  const lastPlay = songPlays.reduce(
    (max, play) => (play.timestamp > max ? play.timestamp : max),
    songPlays[0].timestamp
  );

  const dayMap = new Map<string, { plays: number; minutes: number }>();
  songPlays.forEach((play) => {
    const key = play.timestamp.toISOString().split('T')[0];
    const current = dayMap.get(key) || { plays: 0, minutes: 0 };
    dayMap.set(key, {
      plays: current.plays + 1,
      minutes: current.minutes + play.msPlayed / 60000,
    });
  });

  let peakDay: { date: Date; plays: number; minutes: number } | undefined;
  for (const [key, stats] of dayMap.entries()) {
    if (!peakDay || stats.plays > peakDay.plays) {
      peakDay = { date: new Date(key), plays: stats.plays, minutes: stats.minutes };
    }
  }

  const summary = `You listened to ${songMeta.trackName ?? 'this song'} ${totalPlays.toLocaleString()} times for ${totalHours.toFixed(1)} hours total. First played on ${formatDate(firstPlay)}. ${
    peakDay
      ? `Your peak day was ${formatDate(peakDay.date)} with ${peakDay.plays.toLocaleString()} plays.`
      : 'No peak day yet.'
  }`;

  return (
    <MainLayout showFilters title="Song details">
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-emerald-500">Song</p>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
              {songMeta.trackName ?? 'Unknown title'}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              {songMeta.artistName ?? 'Unknown artist'}
            </p>
            {songMeta.albumName && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Album: {songMeta.albumName}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Link
              href="/songs"
              className="inline-flex items-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Back to songs
            </Link>
            <Link
              href="/upload"
              className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
            >
              Upload more data
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Total plays" value={numberFormatter.format(totalPlays)} />
          <StatCard label="Minutes listened" value={numberFormatter.format(totalMinutes)} />
          <StatCard label="Estimated skips" value={numberFormatter.format(skipped)} />
          <StatCard
            label="Peak day"
            value={
              peakDay
                ? `${formatDate(peakDay.date)} (${peakDay.plays.toLocaleString()} plays)`
                : '—'
            }
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Listening over time
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Minutes listened by year</p>
              </div>
            </div>
            <div className="mt-4 h-72">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <XAxis dataKey="label" />
                    <YAxis tickFormatter={(value) => `${value}m`} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <Tooltip
                      labelFormatter={(label) => label}
                      formatter={(value: number) => [`${value.toLocaleString()} minutes`, 'Listening']}
                    />
                    <Area
                      type="monotone"
                      dataKey="minutes"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  No listening data yet for this song.
                </div>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Summary</h3>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed">{summary}</p>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

function NoSongState({ hasAnyData, songIdProvided }: { hasAnyData: boolean; songIdProvided: boolean }) {
  const message = !hasAnyData
    ? 'Please upload your history again to get song insights.'
    : songIdProvided
      ? 'We could not find that song in your data. Try uploading again or pick another track.'
      : 'Pick a song from the list to see its details.';

  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-800">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">No song data available</h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{message}</p>
      <div className="mt-4 flex justify-center gap-3">
        <Link
          href="/upload"
          className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
        >
          Go to upload
        </Link>
        <Link
          href="/songs"
          className="inline-flex items-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Back to songs
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">{value}</p>
    </div>
  );
}
