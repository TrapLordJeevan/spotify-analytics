'use client';

import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Play } from '@/types';
import { getGenreEvolution, getTopGenres } from '@/lib/analytics/genres';

const COLORS = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#94a3b8'];

interface GenreEvolutionChartProps {
  plays: Play[];
}

export function GenreEvolution({ plays }: GenreEvolutionChartProps) {
  const { chartData, genreKeys } = useMemo(() => {
    const topGenres = getTopGenres(plays)
      .slice(0, 4)
      .map((genre) => genre.genre);
    const evolution = getGenreEvolution(plays);

    const data = evolution.map((yearData) => {
      const row: Record<string, number | string> = { year: yearData.year.toString() };
      let sum = 0;
      for (const genre of topGenres) {
        const entry = yearData.genres.find((g) => g.genre === genre);
        const value = entry ? Number(entry.percentage.toFixed(1)) : 0;
        row[genre] = value;
        sum += value;
      }
      const other = Math.max(0, Number((100 - sum).toFixed(1)));
      row.Other = other;
      return row;
    });

    const keys = [...topGenres, 'Other'];
    return { chartData: data, genreKeys: keys };
  }, [plays]);

  if (chartData.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500 shadow-sm">
        Not enough data to render the genre evolution chart.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Genre evolution</h3>
      <p className="text-sm text-slate-500">
        Share of listening minutes per genre each year.
      </p>
      <div className="mt-4 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#475569' }} />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 12, fill: '#475569' }}
            />
            <Tooltip
              formatter={(value: number, name) => [`${value.toFixed(1)}%`, name]}
              labelFormatter={(label: string) => `Year ${label}`}
            />
            <Legend />
            {genreKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stackId="1"
                stroke="none"
                fill={COLORS[index % COLORS.length]}
                fillOpacity={0.9}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


