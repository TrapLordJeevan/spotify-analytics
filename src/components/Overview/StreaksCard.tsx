'use client';

import { useMemo } from 'react';
import { calculateStreaks } from '@/lib/analytics/overview';
import type { Play } from '@/types';

interface StreaksCardProps {
  plays: Play[];
}

const intlDate = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export function StreaksCard({ plays }: StreaksCardProps) {
  const streaks = useMemo(() => calculateStreaks(plays), [plays]);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Current streak
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {streaks.currentStreak} {streaks.currentStreak === 1 ? 'day' : 'days'}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Longest streak
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {streaks.longestStreak} {streaks.longestStreak === 1 ? 'day' : 'days'}
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
        Last listened:{' '}
        {streaks.lastListeningDate ? intlDate.format(streaks.lastListeningDate) : '—'}
      </p>
    </div>
  );
}




