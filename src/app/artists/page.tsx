'use client';

import Link from 'next/link';
import { MainLayout } from '@/components/Layout/MainLayout';
import { ArtistsTable } from '@/components/TopArtists/ArtistsTable';
import { ArtistsChart } from '@/components/TopArtists/ArtistsChart';
import { useDataStore } from '@/store/useDataStore';

export default function ArtistsPage() {
  const plays = useDataStore((state) => state.getFilteredPlays());
  const hasAnyData = useDataStore((state) => state.plays.length > 0);

  return (
    <MainLayout
      title="Artists & shows"
      description="See which artists (or podcast shows) dominate your listening time."
    >
      {hasAnyData ? (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <ArtistsTable plays={plays} />
          <ArtistsChart plays={plays} />
        </div>
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




