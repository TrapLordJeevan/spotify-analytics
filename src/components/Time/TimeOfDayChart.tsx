'use client';

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Play } from '@/types';
import { getTimeOfDayData, getTimeOfDaySummary } from '@/lib/analytics/time';

interface TimeOfDayChartProps {
  plays: Play[];
  metric: 'minutes' | 'plays';
}

export function TimeOfDayChart({ plays, metric }: TimeOfDayChartProps) {
  const data = useMemo(() => getTimeOfDayData(plays, metric), [plays, metric]);
  const summary = useMemo(() => getTimeOfDaySummary(plays, metric), [plays, metric]);
  const formatValue = (value: number) =>
    metric === 'minutes' ? `${value.toLocaleString()}m` : `${value.toLocaleString()} plays`;

  if (data.every((item) => item.minutes === 0)) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400 shadow-sm">
        Not enough data to show time-of-day listening.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Time of day</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{summary}</p>
      </div>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
            <XAxis dataKey="hour" tickFormatter={(value) => `${value}:00`} />
            <YAxis tickFormatter={formatValue} />
            <Tooltip
              formatter={(value: number) => [formatValue(value), 'Listening']}
              labelFormatter={(label: number) => `${label}:00`}
            />
            <Bar dataKey="minutes" fill="#38bdf8" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

