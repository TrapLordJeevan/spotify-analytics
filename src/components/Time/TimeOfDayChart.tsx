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
import type { Play } from '@/types';
import { getTimeOfDayData, getTimeOfDaySummary } from '@/lib/analytics/time';

interface TimeOfDayChartProps {
  plays: Play[];
}

export function TimeOfDayChart({ plays }: TimeOfDayChartProps) {
  const data = useMemo(() => getTimeOfDayData(plays), [plays]);
  const summary = useMemo(() => getTimeOfDaySummary(plays), [plays]);

  if (data.every((item) => item.minutes === 0)) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500 shadow-sm">
        Not enough data to show time-of-day listening.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">Time of day</h3>
        <p className="text-sm text-slate-500">{summary}</p>
      </div>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="hour" tickFormatter={(value) => `${value}:00`} />
            <YAxis tickFormatter={(value) => `${value}m`} />
            <Tooltip
              formatter={(value: number) => [`${value} minutes`, 'Listening']}
              labelFormatter={(label: number) => `${label}:00`}
            />
            <Bar dataKey="minutes" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}




