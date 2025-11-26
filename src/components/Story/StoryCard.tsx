'use client';

import { ReactNode } from 'react';

interface StoryCardProps {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}

export function StoryCard({ title, eyebrow, children }: StoryCardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-8 shadow-sm">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-500">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h2>
      <div className="mt-4 text-base text-slate-600 dark:text-slate-300">{children}</div>
    </section>
  );
}



