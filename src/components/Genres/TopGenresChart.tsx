'use client';

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';
import type { Play } from '@/types';
import { getTopGenres } from '@/lib/analytics/genres';

interface TopGenresChartProps {
  plays: Play[];
  metric: 'minutes' | 'plays';
}

export function TopGenresChart({ plays, metric }: TopGenresChartProps) {
  const data = useMemo(
    () =>
      getTopGenres(plays, metric)
        .slice(0, 10)
        .map((genre) => ({
          name: genre.genre,
          value: metric === 'minutes' ? Math.round(genre.minutes) : genre.playCount ?? 0,
          percentage: Number(genre.percentage.toFixed(1)),
        })),
    [plays, metric]
  );

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500 shadow-sm">
        No genre data yet. Upload music plays to see this chart.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Top genres by {metric}</h3>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              angle={-25}
              textAnchor="end"
              height={60}
              tick={{ fontSize: 11, fill: '#cbd5e1' }}
            />
            <Tooltip
              content={({ payload }) => {
                if (!payload || payload.length === 0) return null;
                const item = payload[0];
                return (
                  <div className="rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm shadow">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{item.payload.name}</p>
                    <p className="text-slate-600 dark:text-slate-200">
                      {item.payload.value?.toLocaleString()} {metric === 'minutes' ? 'minutes' : 'plays'}
                    </p>
                    <p className="text-slate-500 dark:text-slate-300">{item.payload.percentage}% share</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

