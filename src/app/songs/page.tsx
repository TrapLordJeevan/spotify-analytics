'use client';

import Link from 'next/link';
import { MainLayout } from '@/components/Layout/MainLayout';
import { TrackItem } from '@/components/AnalyticsUI/TrackItem';
import { useDataStore } from '@/store/useDataStore';
import { getTopSongs } from '@/lib/analytics/topItems';
import { getTopEpisodes } from '@/lib/analytics/topItems';
import { getSongId } from '@/lib/songUtils';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

export default function SongsPage() {
  const router = useRouter();
  const plays = useDataStore((state) => state.getFilteredPlays());
  const hasAnyData = useDataStore((state) => state.plays.length > 0);
  const contentType = useDataStore((state) => state.filters.contentType);
  const metric = useDataStore((state) => state.filters.metric);

  const mode: 'music' | 'podcast' =
    contentType === 'podcast' ? 'podcast' : 'music';

  // Filter plays by mode for the view
  const filteredPlays =
    contentType === 'both'
      ? plays
      : plays.filter((p) => p.contentType === (mode === 'music' ? 'music' : 'podcast'));

  const topMusic = mode === 'music'
    ? getTopSongs(filteredPlays, Math.max(filteredPlays.length, 200), metric)
    : [];
  const topEpisodes = mode === 'podcast'
    ? getTopEpisodes(filteredPlays, Math.max(filteredPlays.length, 200), metric)
    : [];

  const songStats = useMemo(() => {
    if (mode === 'podcast') {
      return topEpisodes.map((episode) => ({
        key: `${episode.showName}|||${episode.episodeName}`,
        title: episode.episodeName,
        artist: episode.showName,
        plays: episode.playCount,
        minutes: episode.minutes,
        sharePercent: episode.percentage,
        skipCount: 0,
      }));
    }
    const skipMap = new Map<string, number>();
    filteredPlays.forEach((p) => {
      if (p.contentType !== 'music' || !p.trackName || !p.artistName) return;
      const key = `${p.artistName}|||${p.trackName}`;
      skipMap.set(key, (skipMap.get(key) || 0) + (p.skipped ? 1 : 0));
    });
    return topMusic.map((song) => {
      const key = `${song.artistName}|||${song.trackName}`;
      return {
        key,
        title: song.trackName,
        artist: song.artistName,
        plays: song.playCount,
        minutes: song.minutes,
        sharePercent: song.percentage,
        skipCount: skipMap.get(key) || 0,
      };
    });
  }, [filteredPlays, topMusic, topEpisodes, mode]);

  const [sortKey, setSortKey] = useState<'plays' | 'minutes' | 'title' | 'skips'>(
    metric === 'minutes' ? 'minutes' : 'plays'
  );

  const sortedSongs = useMemo(() => {
    const sorted = [...songStats];
    sorted.sort((a, b) => {
      switch (sortKey) {
        case 'title':
          return a.trackName.localeCompare(b.trackName);
        case 'minutes':
          return b.minutes - a.minutes;
        case 'skips':
          return b.skipCount - a.skipCount;
        case 'plays':
        default:
          return b.playCount - a.playCount;
      }
    });
    return sorted;
  }, [songStats, sortKey]);
  const palette = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  ];

  return (
    <MainLayout
      title={mode === 'podcast' ? 'Top podcast episodes' : 'Top songs'}
      description={
        mode === 'podcast'
          ? 'Switch the Music / Podcasts toggle in the filter bar to change what shows here.'
          : 'Use the global filters to focus on certain accounts, time ranges, or switch to podcasts.'
      }
    >
      {hasAnyData ? (
        <section className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-sm text-slate-300">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>
                Showing {sortedSongs.length} {mode === 'podcast' ? 'episodes' : 'songs'} based on your filters.
              </span>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="uppercase tracking-wide text-slate-400">Sort by</span>
                {(['plays', 'minutes', 'skips', 'title'] as const).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSortKey(key)}
                    className={`rounded-full px-3 py-1 border text-[12px] font-semibold transition ${
                      sortKey === key ? 'bg-white text-black border-white' : 'border-white/20 text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    {key === 'minutes' ? 'Playtime' : key === 'title' ? 'Title' : key.charAt(0).toUpperCase() + key.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {sortedSongs.map((song, idx) => (
              <TrackItem
                key={`${song.artistName}-${song.trackName}`}
                rank={idx + 1}
                title={song.title}
                artist={song.artist}
                plays={song.plays}
                stats={{
                  plays: song.plays,
                  minutes: song.minutes,
                  sharePercent: song.sharePercent,
                  skips: song.skipCount,
                }}
                accent={palette[idx % palette.length]}
                onClick={
                  mode === 'music'
                    ? () => {
                        const match = filteredPlays.find(
                          (p) =>
                            p.trackName === song.title &&
                            p.artistName === song.artist &&
                            p.contentType === 'music'
                        );
                        if (match) {
                          const songId = getSongId(match);
                          router.push(`/song?songId=${encodeURIComponent(songId)}`);
                        }
                      }
                    : undefined
                }
              />
            ))}
          </div>
        </section>
      ) : (
        <EmptyState />
      )}
    </MainLayout>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-6 py-10 text-center">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">No data yet</h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Upload your Spotify history to unlock the songs view.
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
