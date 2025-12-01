'use client';

import Link from 'next/link';
import { MainLayout } from '@/components/Layout/MainLayout';
import { useDataStore } from '@/store/useDataStore';
import { getTopArtists } from '@/lib/analytics/topItems';
import { ArtistCard } from '@/components/AnalyticsUI/ArtistCard';
import { useRouter } from 'next/navigation';

export default function ArtistsPage() {
  const router = useRouter();
  const plays = useDataStore((state) => state.getFilteredPlays());
  const hasAnyData = useDataStore((state) => state.plays.length > 0);
  const metric = useDataStore((state) => state.filters.metric);
  const palette = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  ];
  const artists = getTopArtists(plays, Math.max(plays.length, 200), metric);

  return (
    <MainLayout
      title="Artists & shows"
      description="See which artists (or podcast shows) dominate your listening time."
    >
      {hasAnyData ? (
        <section className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-sm text-slate-300">
            Showing your top {artists.length} artists based on {metric}.
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {artists.map((artist, idx) => (
              <ArtistCard
                key={artist.artistName}
                name={artist.artistName}
                plays={artist.playCount}
                hours={Math.round(artist.minutes / 60)}
                image={palette[idx % palette.length]}
                onClick={() => {
                  router.push(`/artist?name=${encodeURIComponent(artist.artistName)}`);
                }}
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
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
      <h2 className="text-xl font-semibold text-slate-900">No data yet</h2>
      <p className="mt-2 text-sm text-slate-500">
        Upload your history first, then come back to see your top artists.
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
