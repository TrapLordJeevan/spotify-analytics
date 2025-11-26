'use client';

import Link from 'next/link';
import { MainLayout } from '@/components/Layout/MainLayout';
import { TimeOfDayChart } from '@/components/Time/TimeOfDayChart';
import { MonthlyChart } from '@/components/Time/MonthlyChart';
import { YearlyChart } from '@/components/Time/YearlyChart';
import { DailyChart } from '@/components/Time/DailyChart';
import { useDataStore } from '@/store/useDataStore';

export default function TimePage() {
  const plays = useDataStore((state) => state.getFilteredPlays());
  const hasAnyData = useDataStore((state) => state.plays.length > 0);
  const metric = useDataStore((state) => state.filters.metric);

  return (
    <MainLayout
      title="Time insights"
      description="How your listening ebbs and flows across hours, months, and years."
    >
      {hasAnyData ? (
        <div className="space-y-6">
          <TimeOfDayChart plays={plays} metric={metric} />
          <div className="grid gap-6 lg:grid-cols-2">
            <MonthlyChart plays={plays} metric={metric} />
            <YearlyChart plays={plays} metric={metric} />
          </div>
          <DailyChart plays={plays} metric={metric} />
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
      <h2 className="text-xl font-semibold text-slate-900">No time data yet</h2>
      <p className="mt-2 text-sm text-slate-500">
        Upload at least one history file to unlock the time analysis.
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



