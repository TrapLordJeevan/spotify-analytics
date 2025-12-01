'use client';

import Link from 'next/link';
import { MainLayout } from '@/components/Layout/MainLayout';
import { StoryCard } from '@/components/Story/StoryCard';
import { YearTimeline } from '@/components/Story/YearTimeline';
import { PhaseHighlight } from '@/components/Story/PhaseHighlight';
import { RediscoveryHighlight } from '@/components/Story/RediscoveryHighlight';
import { useDataStore } from '@/store/useDataStore';

export default function StoryPage() {
  const plays = useDataStore((state) => state.getFilteredPlays());
  const hasAnyData = useDataStore((state) => state.plays.length > 0);
  const metric = useDataStore((state) => state.filters.metric);

  return (
    <MainLayout
      title="Your music story"
      description="A narrative take on the phases, rediscoveries, and yearly highlights from your listening."
      showFilters={true}
    >
      {hasAnyData ? (
        <div className="space-y-4">
          <div className="w-full max-w-6xl">
            <StoryCard title="Year-by-year highlights" eyebrow="Timeline">
              <YearTimeline plays={plays} metric={metric} />
            </StoryCard>
          </div>

          <div className="w-full max-w-6xl">
            <StoryCard title="Artist phases" eyebrow="Obsessions">
              <PhaseHighlight plays={plays} metric={metric} />
            </StoryCard>
          </div>

          <div className="w-full max-w-6xl">
            <StoryCard title="Rediscoveries" eyebrow="Comebacks">
              <RediscoveryHighlight plays={plays} />
            </StoryCard>
          </div>
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
      <h2 className="text-xl font-semibold text-slate-900">No story yet</h2>
      <p className="mt-2 text-sm text-slate-500">
        Upload your listening history first, then this page will auto-populate.
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

