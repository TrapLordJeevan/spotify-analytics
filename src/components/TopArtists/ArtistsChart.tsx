'use client';

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getTopArtists } from '@/lib/analytics/topItems';
import type { Play } from '@/types';

interface ArtistsChartProps {
  plays: Play[];
  metric: 'minutes' | 'plays';
}

export function ArtistsChart({ plays, metric }: ArtistsChartProps) {
  const data = useMemo(
    () =>
      getTopArtists(plays, 10, metric).map((artist) => ({
        name: artist.artistName,
        value: metric === 'minutes' ? Math.round(artist.minutes) : artist.playCount,
        percentage: artist.percentage,
      })),
    [plays, metric]
  );

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500 shadow-sm">
        No listening data for the current filters.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Top 10 artists by {metric}</h3>
      <div className="mt-4 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 10, bottom: 10 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              tick={{ fontSize: 12, fill: '#475569' }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(16,185,129,0.08)' }}
              content={({ payload }) => {
                if (!payload || payload.length === 0) return null;
                const item = payload[0];
                return (
                  <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow">
                    <p className="font-semibold text-slate-900">{item.payload.name}</p>
                    <p className="text-slate-600">
                      {item.value?.toLocaleString()} {metric === 'minutes' ? 'minutes' : 'plays'}
                    </p>
                    <p className="text-xs text-slate-500">{item.payload.percentage.toFixed(1)}% share</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


