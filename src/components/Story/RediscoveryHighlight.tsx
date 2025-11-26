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
      <p className="text-sm text-slate-500">
        No rediscovery moments yet—come back after revisiting old favorites.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {rediscoveries.map((entry) => (
        <li
          key={`${entry.artistName}-${entry.rediscoveryDate.toISOString()}`}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
        >
          <p className="text-base font-semibold text-slate-900">{entry.artistName}</p>
          <p className="text-sm text-slate-500">
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




