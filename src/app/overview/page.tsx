'use client';

import Link from 'next/link';
import { MainLayout } from '@/components/Layout/MainLayout';
import { SummaryCards } from '@/components/Overview/SummaryCards';
import { TopLists } from '@/components/Overview/TopLists';
import { StreaksCard } from '@/components/Overview/StreaksCard';
import { useDataStore } from '@/store/useDataStore';

export default function OverviewPage() {
  const plays = useDataStore((state) => state.getFilteredPlays());
  const hasAnyData = useDataStore((state) => state.plays.length > 0);

  const content = hasAnyData ? (
    <>
      <SummaryCards plays={plays} />
      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <TopLists plays={plays} />
        <StreaksCard plays={plays} />
      </div>
    </>
  ) : (
    <EmptyState />
  );

  return (
    <MainLayout
      title="Overview"
      description="High-level trends across all of your Spotify listening history."
    >
      {content}
    </MainLayout>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
      <h2 className="text-xl font-semibold text-slate-900">No data yet</h2>
      <p className="mt-2 text-sm text-slate-500">
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




