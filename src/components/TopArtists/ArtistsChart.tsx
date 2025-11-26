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
}

export function ArtistsChart({ plays }: ArtistsChartProps) {
  const data = useMemo(
    () =>
      getTopArtists(plays, 10).map((artist) => ({
        name: artist.artistName,
        minutes: Math.round(artist.minutes),
      })),
    [plays]
  );

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500 shadow-sm">
        No listening data for the current filters.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Top 10 artists by minutes</h3>
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
                    <p className="text-slate-600">{item.value} minutes</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="minutes" fill="#10b981" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}




