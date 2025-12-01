'use client';

import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { FilterBar } from '@/components/Filters/FilterBar';
import { AnalyticsLayout } from './AnalyticsLayout';
import { useDataStore } from '@/store/useDataStore';
import { useDarkMode } from '@/hooks/useDarkMode';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showFilters?: boolean;
}

export function MainLayout({
  children,
  title,
  description,
  showFilters = true,
}: MainLayoutProps) {
  const sources = useDataStore((state) => state.sources);
  useDarkMode(); // Initialize dark mode

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100">
      <Navbar />
      <AnalyticsLayout>
        <div className="space-y-1">
          {title && <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>}
          {description && <p className="text-base text-slate-600 dark:text-slate-400">{description}</p>}
        </div>
        {showFilters && sources.length > 0 && (
          <div className="sticky top-16 z-40">
            <section className="space-y-3 rounded-2xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur px-2 py-2">
              <FilterBar />
            </section>
          </div>
        )}
        <section className="space-y-4">{children}</section>
      </AnalyticsLayout>
    </div>
  );
}
