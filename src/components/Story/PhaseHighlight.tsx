'use client';

import { useMemo } from 'react';
import { detectPhases } from '@/lib/analytics/phases';
import type { Play } from '@/types';

interface PhaseHighlightProps {
  plays: Play[];
}

export function PhaseHighlight({ plays }: PhaseHighlightProps) {
  const phases = useMemo(() => detectPhases(plays), [plays]);

  if (phases.length === 0) {
    return (
      <p className="text-sm text-slate-500">No major artist phases detected yet.</p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {phases.map((phase) => (
        <div
          key={`${phase.artistName}-${phase.startMonth.year}-${phase.startMonth.month}`}
          className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-4 shadow-sm text-slate-100"
        >
          <p className="text-xs uppercase tracking-wide text-emerald-400">Phase</p>
          <p className="mt-1 text-lg font-semibold text-slate-100">{phase.artistName}</p>
          <p className="text-sm text-slate-300">
            {formatMonth(phase.startMonth)} – {formatMonth(phase.endMonth)} ·{' '}
            {phase.intensity.toFixed(1)}% of listening
          </p>
        </div>
      ))}
    </div>
  );
}

const formatMonth = ({ year, month }: { year: number; month: number }) =>
  new Date(year, month - 1).toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  });



