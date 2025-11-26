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
}

export function TopGenresChart({ plays }: TopGenresChartProps) {
  const data = useMemo(
    () =>
      getTopGenres(plays)
        .slice(0, 10)
        .map((genre) => ({
          name: genre.genre,
          minutes: Math.round(genre.minutes),
          percentage: Number(genre.percentage.toFixed(1)),
        })),
    [plays]
  );

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500 shadow-sm">
        No genre data yet. Upload music plays to see this chart.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Top genres</h3>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              angle={-25}
              textAnchor="end"
              height={60}
              tick={{ fontSize: 11, fill: '#475569' }}
            />
            <Tooltip
              content={({ payload }) => {
                if (!payload || payload.length === 0) return null;
                const item = payload[0];
                return (
                  <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow">
                    <p className="font-semibold text-slate-900">{item.payload.name}</p>
                    <p className="text-slate-600">{item.payload.minutes} minutes</p>
                    <p className="text-slate-500">{item.payload.percentage}% share</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="minutes" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}




