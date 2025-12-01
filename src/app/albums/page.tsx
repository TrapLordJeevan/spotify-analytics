'use client';

import Link from 'next/link';
import { MainLayout } from '@/components/Layout/MainLayout';
import { useDataStore } from '@/store/useDataStore';
import { getTopAlbums } from '@/lib/analytics/topItems';
import { AlbumCard } from '@/components/AnalyticsUI/AlbumCard';
import { useRouter } from 'next/navigation';

export default function AlbumsPage() {
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
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  ];
  const albums = getTopAlbums(plays, Math.max(plays.length, 200), metric);

  return (
    <MainLayout
      title="Albums"
      description="See which albums you’ve played the most."
    >
      {hasAnyData ? (
        <section className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-sm text-slate-300">
            Showing your top {albums.length} albums.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {albums.map((album, idx) => (
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
      <h2 className="text-xl font-semibold text-slate-900">No album data yet</h2>
      <p className="mt-2 text-sm text-slate-500">
        Upload your listening history to see your top albums.
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
