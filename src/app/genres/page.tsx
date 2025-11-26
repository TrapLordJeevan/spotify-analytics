'use client';

import Link from 'next/link';
import { MainLayout } from '@/components/Layout/MainLayout';
import { TopGenresChart } from '@/components/Genres/TopGenresChart';
import { GenresTable } from '@/components/Genres/GenresTable';
import { GenreEvolution } from '@/components/Genres/GenreEvolution';
import { useDataStore } from '@/store/useDataStore';

export default function GenresPage() {
  const plays = useDataStore((state) => state.getFilteredPlays());
  const hasAnyData = useDataStore((state) => state.plays.length > 0);

  return (
    <MainLayout
      title="Genres"
      description="See the mix of genres powering your listening and how that taste evolves."
    >
      {hasAnyData ? (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
            <TopGenresChart plays={plays} />
            <GenresTable plays={plays} />
          </div>
          <GenreEvolution plays={plays} />
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
      <h2 className="text-xl font-semibold text-slate-900">No genre data yet</h2>
      <p className="mt-2 text-sm text-slate-500">
        Upload at least one streaming history file containing music plays.
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




