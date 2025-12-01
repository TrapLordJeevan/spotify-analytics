'use client';

import { ReactNode } from 'react';

interface AnalyticsLayoutProps {
  children: ReactNode;
}

export function AnalyticsLayout({ children }: AnalyticsLayoutProps) {
  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#0a0a0a] text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-4">{children}</div>
    </main>
  );
}
