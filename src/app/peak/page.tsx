'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { MainLayout } from '@/components/Layout/MainLayout';
import { StatCard } from '@/components/AnalyticsUI/StatCard';
import { TrackItem } from '@/components/AnalyticsUI/TrackItem';
import { useDataStore } from '@/store/useDataStore';
import { getTopSongs } from '@/lib/analytics/overview';

export default function PeakDayPage() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');
  const plays = useDataStore((state) => state.getFilteredPlays());
  const hasAnyData = useDataStore((state) => state.plays.length > 0);

  const peakDate = useMemo(() => {
    if (dateParam) return new Date(dateParam);
    // Fallback: pick peak from data
    const dayMap = new Map<string, number>();
    plays.forEach((p) => {
      const key = p.timestamp.toISOString().split('T')[0];
      dayMap.set(key, (dayMap.get(key) || 0) + p.msPlayed);
    });
    let best: string | null = null;
    let bestMs = 0;
    for (const [day, ms] of dayMap.entries()) {
      if (ms > bestMs) {
        bestMs = ms;
        best = day;
      }
    }
    return best ? new Date(best) : null;
  }, [dateParam, plays]);

  const dayKey = peakDate ? peakDate.toISOString().split('T')[0] : null;
  const dayPlays = useMemo(() => {
    if (!dayKey) return [];
    return plays.filter((p) => p.timestamp.toISOString().split('T')[0] === dayKey);
  }, [plays, dayKey]);

  if (!dayKey || dayPlays.length === 0) {
    return (
      <MainLayout title="Peak day details">
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">No data for that day</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {hasAnyData ? 'Pick another day from the overview card.' : 'Please upload your history again to get peak day insights.'}
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link
              href="/overview"
              className="inline-flex items-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Back to overview
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const totalPlays = dayPlays.length;
  const totalMinutes = Math.round(dayPlays.reduce((sum, p) => sum + p.msPlayed / 60000, 0));
  const skips = dayPlays.filter((p) => p.skipped).length;

  // Hourly breakdown
  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, hour) => ({ hour, minutes: 0 }));
    dayPlays.forEach((p) => {
      const h = p.timestamp.getHours();
      hours[h].minutes += p.msPlayed / 60000;
    });
    return hours;
  }, [dayPlays]);

  const peakHour = hourlyData.reduce(
    (acc, curr) => (curr.minutes > acc.minutes ? curr : acc),
    { hour: 0, minutes: 0 }
  );

  const topSongs = useMemo(() => getTopSongs(dayPlays, Math.max(dayPlays.length, 2000), 'minutes'), [dayPlays]);

  const palette = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  ];

  const formatDate = (date: Date) =>
    date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <MainLayout showFilters title={`Peak day — ${formatDate(peakDate!)}`}>
      <section className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total plays" value={totalPlays.toLocaleString()} subtitle="All tracks on this day" gradient={palette[0]} />
          <StatCard label="Minutes listened" value={totalMinutes.toLocaleString()} subtitle="Time spent on this day" gradient={palette[1]} />
          <StatCard label="Skips" value={skips.toLocaleString()} subtitle="Skipped plays" gradient={palette[2]} />
          <StatCard label="Peak hour" value={`${peakHour.hour}:00`} subtitle={`${Math.round(peakHour.minutes)} min`} gradient={palette[3]} />
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Listening by hour</h2>
          <div className="rounded-2xl border border-white/10 bg-[#111111] px-4 py-4">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2e3b4d" />
                  <XAxis dataKey="hour" />
                  <YAxis tickFormatter={(v) => `${Math.round(v)}m`} />
                  <Tooltip formatter={(value: number) => [`${Math.round(value)} minutes`, 'Listening']} />
                  <Bar dataKey="minutes" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Top tracks on this day</h2>
          <div className="space-y-3">
            {topSongs.map((song, idx) => (
              <TrackItem
                key={`${song.artistName}-${song.trackName}-peaklist`}
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
      </section>
    </MainLayout>
  );
}
