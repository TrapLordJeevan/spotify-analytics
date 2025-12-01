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
    <div className="rounded-2xl border border-white/10 bg-[#111111] px-5 py-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">
            Current streak
          </p>
          <p className="mt-1 text-3xl font-bold text-white">
            {streaks.currentStreak} {streaks.currentStreak === 1 ? 'day' : 'days'}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">
            Longest streak
          </p>
          <p className="mt-1 text-3xl font-bold text-white">
            {streaks.longestStreak} {streaks.longestStreak === 1 ? 'day' : 'days'}
          </p>
        </div>
      </div>
      <p className="mt-4 text-base text-slate-400">
        Last listened across selected uploads:{' '}
        {streaks.lastListeningDate ? intlDate.format(streaks.lastListeningDate) : '—'}
      </p>
    </div>
  );
}

