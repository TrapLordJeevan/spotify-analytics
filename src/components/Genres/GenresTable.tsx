'use client';

import { useMemo, useState } from 'react';
import { getTopGenres } from '@/lib/analytics/genres';
import type { Play } from '@/types';

interface GenresTableProps {
  plays: Play[];
  metric: 'minutes' | 'plays';
}

const intlPercent = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });

export function GenresTable({ plays, metric }: GenresTableProps) {
  const genres = useMemo(() => getTopGenres(plays, metric), [plays, metric]);
  const [sortKey, setSortKey] = useState<'genre' | 'value' | 'share'>('value');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const sortedGenres = [...genres].sort((a, b) => {
    const getVal = (g: typeof genres[number]) => {
      switch (sortKey) {
        case 'genre':
          return g.genre.toLowerCase();
        case 'value':
          return metric === 'minutes' ? g.minutes : g.playCount ?? 0;
        case 'share':
          return g.percentage;
      }
    };
    const aVal = getVal(a);
    const bVal = getVal(b);
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      const cmp = aVal.localeCompare(bVal);
      return sortDir === 'asc' ? cmp : -cmp;
    }
    const cmp = (aVal as number) - (bVal as number);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'genre' ? 'asc' : 'desc');
    }
  };
  const totalPages = Math.max(1, Math.ceil(sortedGenres.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const paged = sortedGenres.slice((currentPage - 1) * perPage, currentPage * perPage);

  if (genres.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400 shadow-sm">
        No genre data for the current filters.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
      <div className="border-b border-slate-100 dark:border-slate-700 px-4 py-3">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Genre breakdown</h3>
      </div>
      <div className="max-h-[420px] overflow-y-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 dark:bg-slate-700 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">
                <button className="flex items-center gap-1" onClick={() => toggleSort('genre')}>
                  Genre {sortKey === 'genre' && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-4 py-2 text-right">
                <button className="flex items-center gap-1" onClick={() => toggleSort('value')}>
                  {metric === 'minutes' ? 'Minutes' : 'Plays'} {sortKey === 'value' && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-4 py-2 text-right">
                <button className="flex items-center gap-1" onClick={() => toggleSort('share')}>
                  Share ({metric}) {sortKey === 'share' && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-200">
            {paged.map((genre, index) => (
              <tr key={genre.genre}>
                <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                  {(currentPage - 1) * perPage + index + 1}
                </td>
                <td className="px-4 py-2 font-medium">{genre.genre}</td>
                <td className="px-4 py-2 text-right">
                  {metric === 'minutes' ? Math.round(genre.minutes) : genre.playCount ?? 0}
                </td>
                <td className="px-4 py-2 text-right">
                  {intlPercent.format(genre.percentage)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 py-1 text-sm"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-md border border-slate-200 dark:border-slate-600 px-3 py-1 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span>
            Page {currentPage} / {totalPages}
          </span>
          <button
            className="rounded-md border border-slate-200 dark:border-slate-600 px-3 py-1 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
