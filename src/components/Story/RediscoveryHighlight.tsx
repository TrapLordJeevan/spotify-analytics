'use client';

import { useMemo } from 'react';
import { detectRediscoveries } from '@/lib/analytics/rediscoveries';
import type { Play } from '@/types';

interface RediscoveryHighlightProps {
  plays: Play[];
}

export function RediscoveryHighlight({ plays }: RediscoveryHighlightProps) {
  const rediscoveries = useMemo(() => detectRediscoveries(plays), [plays]);

  if (rediscoveries.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        No rediscovery moments yet—come back after revisiting old favorites.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {rediscoveries.map((entry) => (
        <li
          key={`${entry.artistName}-${entry.rediscoveryDate.toISOString()}`}
          className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 shadow-sm text-slate-100"
        >
          <p className="text-base font-semibold text-slate-100">{entry.artistName}</p>
          <p className="text-sm text-slate-300">
            Came back after {entry.gapMonths} months away ·{' '}
            {entry.rediscoveryDate.toLocaleDateString(undefined, {
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </li>
      ))}
    </ul>
  );
}



