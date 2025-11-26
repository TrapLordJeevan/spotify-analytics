'use client';

import { useMemo } from 'react';
import { getTopGenres } from '@/lib/analytics/genres';
import type { Play } from '@/types';

interface GenresTableProps {
  plays: Play[];
}

const intlPercent = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });

export function GenresTable({ plays }: GenresTableProps) {
  const genres = useMemo(() => getTopGenres(plays), [plays]);

  if (genres.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500 shadow-sm">
        No genre data for the current filters.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <h3 className="text-base font-semibold text-slate-900">Genre breakdown</h3>
      </div>
      <div className="max-h-[420px] overflow-y-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Genre</th>
              <th className="px-4 py-2 text-right">Minutes</th>
              <th className="px-4 py-2 text-right">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {genres.map((genre, index) => (
              <tr key={genre.genre}>
                <td className="px-4 py-2 text-slate-500">{index + 1}</td>
                <td className="px-4 py-2 font-medium">{genre.genre}</td>
                <td className="px-4 py-2 text-right">{Math.round(genre.minutes)}</td>
                <td className="px-4 py-2 text-right">
                  {intlPercent.format(genre.percentage)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}




