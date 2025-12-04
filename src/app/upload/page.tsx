'use client';

import Link from 'next/link';
import { UploadZone } from '@/components/Upload/UploadZone';
import { SourceManager } from '@/components/Upload/SourceManager';
import { MainLayout } from '@/components/Layout/MainLayout';
import { useDataStore } from '@/store/useDataStore';

export default function UploadPage() {
  const totalPlays = useDataStore((state) => state.plays.length);
  const sourcesCount = useDataStore((state) => state.sources.length);

  return (
    <MainLayout
      title="Hi Twin!, Upload your data"
      description="Everything is processed locally in your browser—nothing leaves your device."
      showFilters={false}
    >
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
          Spotify Extended History
        </p>
        <p className="max-w-3xl text-base text-slate-600 dark:text-slate-400">
          Drop in the ZIP you downloaded from Spotify or any{' '}
          <code className="rounded bg-slate-100 dark:bg-slate-700 px-1 text-slate-900 dark:text-slate-100">
            Streaming_History*.json
          </code>{' '}
          file.
        </p>
        {totalPlays > 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400" data-testid="upload-summary">
            Already imported {totalPlays.toLocaleString()} plays from {sourcesCount}{' '}
            {sourcesCount === 1 ? 'source' : 'sources'}.{' '}
            <Link href="/overview" className="font-medium text-emerald-600 dark:text-emerald-400 underline">
              Jump to your overview →
            </Link>
          </p>
        )}
      </div>

      <section className="mt-10 space-y-8">
        <UploadZone />
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Sources</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Each upload becomes a Source. Rename them (e.g., &quot;Main account&quot;, &quot;Family plan account&quot;) and disable any you don&apos;t want included in analytics.
          </p>
          <div className="mt-4">
            <SourceManager />
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

