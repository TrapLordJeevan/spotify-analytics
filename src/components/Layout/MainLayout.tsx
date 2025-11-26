'use client';

import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { FilterBar } from '@/components/Filters/FilterBar';
import { useDataStore } from '@/store/useDataStore';

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

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-1">
          {title && <h1 className="text-3xl font-bold text-slate-900">{title}</h1>}
          {description && <p className="text-base text-slate-600">{description}</p>}
        </div>
        {showFilters && sources.length > 0 && (
          <div className="mt-6">
            <FilterBar />
          </div>
        )}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}




