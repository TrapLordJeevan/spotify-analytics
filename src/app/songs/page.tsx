'use client';

import Link from 'next/link';
import { MainLayout } from '@/components/Layout/MainLayout';
import { SongsTable } from '@/components/TopSongs/SongsTable';
import { useDataStore } from '@/store/useDataStore';

export default function SongsPage() {
  const plays = useDataStore((state) => state.getFilteredPlays());
  const hasAnyData = useDataStore((state) => state.plays.length > 0);
  const contentType = useDataStore((state) => state.filters.contentType);

  const mode: 'music' | 'podcast' =
    contentType === 'podcast' ? 'podcast' : 'music';

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
        <>
          <SongsTable plays={plays} mode={mode} />
          {contentType === 'both' && (
            <p className="mt-4 text-sm text-slate-500">
              Currently showing music. Flip the content toggle above to view podcast episodes.
            </p>
          )}
        </>
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




