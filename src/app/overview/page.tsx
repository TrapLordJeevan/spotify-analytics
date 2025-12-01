'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MainLayout } from '@/components/Layout/MainLayout';
import { StatCard as HeroStatCard } from '@/components/AnalyticsUI/StatCard';
import { TrackItem } from '@/components/AnalyticsUI/TrackItem';
import { ArtistCard as TopArtistCard } from '@/components/AnalyticsUI/ArtistCard';
import { AlbumCard } from '@/components/AnalyticsUI/AlbumCard';
import { ListeningChart } from '@/components/AnalyticsUI/ListeningChart';
import { ActivityTimeline } from '@/components/AnalyticsUI/ActivityTimeline';
import { useDataStore } from '@/store/useDataStore';
import { useRouter } from 'next/navigation';
import {
  calculateTotalListeningTime,
  calculateTotalPlays,
  getGoldenYear,
  getPeakDay,
  getTopSongs,
  getTopArtists,
  calculateStreaks,
} from '@/lib/analytics/overview';
import { getTopAlbums, getTopEpisodes } from '@/lib/analytics/topItems';
import { getTimeOfDayData, getYearlyData } from '@/lib/analytics/time';

export default function OverviewPage() {
  const router = useRouter();
  const plays = useDataStore((state) => state.getFilteredPlays());
  const hasAnyData = useDataStore((state) => state.plays.length > 0);
  const metric = useDataStore((state) => state.filters.metric);
  const contentType = useDataStore((state) => state.filters.contentType);
  const [modal, setModal] = useState<null | 'listening' | 'plays' | 'golden'>(null);

  const palette = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  ];

  const totalMinutesExact = useMemo(
    () => Math.round(plays.reduce((sum, play) => sum + play.msPlayed, 0) / 60000),
    [plays]
  );
  const totalHours = useMemo(() => Math.floor(totalMinutesExact / 60), [totalMinutesExact]);
  const totalPlays = useMemo(() => calculateTotalPlays(plays), [plays]);
  const goldenYear = useMemo(() => getGoldenYear(plays), [plays]);
  const peakDay = useMemo(() => getPeakDay(plays), [plays]);
  const streaks = useMemo(() => calculateStreaks(plays), [plays]);
  const yearlyMinutes = useMemo(() => getYearlyData(plays, 'minutes'), [plays]);

  const topSongs = useMemo(() => getTopSongs(plays, 10, metric), [plays, metric]);
  const topArtists = useMemo(() => getTopArtists(plays, 6, metric), [plays, metric]);
  const topAlbums = useMemo(() => getTopAlbums(plays, 8, metric), [plays, metric]);
  const topEpisodes = useMemo(
    () => getTopEpisodes(plays.filter((p) => p.contentType === 'podcast'), 10, metric),
    [plays, metric]
  );

  const timeOfDayData = useMemo(
    () =>
      getTimeOfDayData(plays, 'minutes').map((entry) => ({
        label: `${entry.hour.toString().padStart(2, '0')}:00`,
        value: Math.round(entry.minutes),
      })),
    [plays]
  );

  const dayOfWeekData = useMemo(() => {
    const totals = Array(7).fill(0);
    plays.forEach((play) => {
      const ts = play.timestamp instanceof Date ? play.timestamp : new Date(play.timestamp);
      if (isNaN(ts.getTime())) return;
      const day = ts.getDay();
      totals[day] += play.msPlayed / 60000;
    });
    const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return totals.map((minutes, idx) => ({ label: labels[idx], value: Math.round(minutes) }));
  }, [plays]);

  const recentActivities = useMemo(() => {
    const toDate = (value: Date | string) =>
      value instanceof Date ? value : new Date(value);
    return [...plays]
      .sort((a, b) => {
        const aDate = toDate(a.timestamp);
        const bDate = toDate(b.timestamp);
        return bDate.getTime() - aDate.getTime();
      })
      .slice(0, 5)
      .map((play, idx) => ({
        id: play.id,
        title: play.trackName || 'Unknown track',
        artist: play.artistName || 'Unknown artist',
        timestamp: formatDistanceToNow(toDate(play.timestamp), { addSuffix: true }),
        accent: palette[idx % palette.length],
      }));
  }, [plays]);

  const formatTime = (minutes: number) => {
    const days = Math.floor(minutes / (60 * 24));
    const remHours = Math.floor((minutes / 60) % 24);
    return `${days}d ${remHours}h`;
  };

  const formatDate = (date: Date | null) =>
    date ? date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <MainLayout
      title="Overview"
      description="High-level trends across all of your Spotify listening history."
    >
      {hasAnyData ? (
        <section className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <HeroStatCard
                label="Listening time"
                value={formatTime(totalMinutesExact)}
                subtitle={`${totalMinutesExact.toLocaleString()} minutes total`}
                gradient={palette[0]}
                onClick={() => setModal('listening')}
              />
            <HeroStatCard
              label="Total plays"
              value={totalPlays.toLocaleString()}
              subtitle="All tracks and episodes"
              gradient={palette[1]}
              onClick={() => setModal('plays')}
            />
            <HeroStatCard
              label="Golden year"
              value={goldenYear ? goldenYear : '—'}
              subtitle="Highest-volume year"
              gradient={palette[2]}
              onClick={() => setModal('golden')}
            />
            <HeroStatCard
              label="Peak day"
              value={formatDate(peakDay)}
              subtitle="Most listening in a single day"
              gradient={palette[3]}
              onClick={() => {
                if (peakDay) {
                  const dateStr = peakDay.toISOString().split('T')[0];
                  router.push(`/peak?date=${encodeURIComponent(dateStr)}`);
                }
              }}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">
                  {contentType === 'podcast' ? 'Top episodes' : 'Top tracks'}
                </h2>
              </div>
              <div className="space-y-3">
                {(contentType === 'podcast' ? topEpisodes : topSongs).map((item, idx) => (
                  <TrackItem
                    key={`${contentType === 'podcast' ? item.showName : item.artistName}-${contentType === 'podcast' ? item.episodeName : item.trackName}`}
                    rank={idx + 1}
                    title={contentType === 'podcast' ? item.episodeName : item.trackName}
                    artist={contentType === 'podcast' ? item.showName : item.artistName}
                    plays={item.playCount}
                    stats={{
                      plays: item.playCount,
                      minutes: item.minutes,
                      sharePercent: item.percentage,
                      skips: undefined,
                    }}
                    accent={palette[idx % palette.length]}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Top artists</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {topArtists.map((artist, idx) => (
                  <TopArtistCard
                    key={artist.artistName}
                    name={artist.artistName}
                    plays={artist.playCount}
                    hours={Math.round(artist.minutes / 60)}
                    image={palette[idx % palette.length]}
                  />
                ))}
              </div>
            </div>
          </div>

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
                  onClick={() =>
                    router.push(
                      `/album?name=${encodeURIComponent(album.albumName)}&artist=${encodeURIComponent(album.artistName)}`
                    )
                  }
                />
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ListeningChart
              data={timeOfDayData}
              title="Listening by hour"
              gradient={palette[0]}
            />
            <ListeningChart
              data={dayOfWeekData}
              title="Listening by day of week"
              gradient={palette[1]}
            />
          </div>

          <ActivityTimeline activities={recentActivities} />
        </section>
      ) : (
        <EmptyState />
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
          <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0f0f0f] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">
                {modal === 'listening' && 'Listening time details'}
                {modal === 'plays' && 'Total plays breakdown'}
                {modal === 'golden' && 'Golden year insights'}
                {modal === 'peak' && 'Peak day details'}
              </h3>
              <button
                onClick={() => setModal(null)}
                className="rounded-md border border-white/20 px-3 py-1 text-sm text-slate-200 hover:bg-white/10"
              >
                Close
              </button>
            </div>

            {modal === 'listening' && (
              <div className="space-y-3">
                <p className="text-sm text-slate-300">Minutes listened by year</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {yearlyMinutes.map((entry, idx) => (
                    <div
                      key={entry.year}
                      className="rounded-xl border border-white/10 bg-[#161616] px-3 py-3"
                      style={{ boxShadow: `0 0 0 1px rgba(255,255,255,0.03)` }}
                    >
                      <p className="text-xs text-slate-400">Year {entry.year}</p>
                      <p className="text-lg font-semibold text-white">
                        {Math.round(entry.minutes).toLocaleString()} min
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {modal === 'plays' && (
              <div className="space-y-3">
                <p className="text-sm text-slate-300">Top tracks by plays</p>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {getTopSongs(plays, 10, 'plays').map((song, idx) => (
                    <TrackItem
                      key={`${song.artistName}-${song.trackName}-plays`}
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
            )}

            {modal === 'golden' && goldenYear && (
              <div className="space-y-3">
                <p className="text-sm text-slate-300">Top tracks in {goldenYear}</p>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {getTopSongs(
                    plays.filter((p) => p.timestamp.getFullYear() === goldenYear),
                    10,
                    metric
                  ).map((song, idx) => (
                    <TrackItem
                      key={`${song.artistName}-${song.trackName}-golden`}
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
            )}

          </div>
        </div>
      )}
    </MainLayout>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-6 py-10 text-center">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">No data yet</h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Upload your Spotify extended streaming history to unlock analytics.
      </p>
      <Link
        href="/upload"
        className="mt-4 inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
      >
        Go to Upload
      </Link>
    </div>
  );
}
