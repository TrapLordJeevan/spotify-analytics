'use client';

import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Play } from '@/types';
import { getMonthlyData } from '@/lib/analytics/time';

interface MonthlyChartProps {
  plays: Play[];
  metric: 'minutes' | 'plays';
}

const monthFormatter = (year: number, month: number) =>
  new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  });

export function MonthlyChart({ plays, metric }: MonthlyChartProps) {
  const data = useMemo(
    () =>
      getMonthlyData(plays, metric).map((entry) => ({
        label: monthFormatter(entry.year, entry.month),
        minutes: entry.minutes,
      })),
    [plays, metric]
  );
  const formatValue = (value: number) =>
    metric === 'minutes' ? `${value.toLocaleString()}m` : `${value.toLocaleString()} plays`;

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400 shadow-sm">
        No monthly listening data yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Monthly {metric}</h3>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <XAxis dataKey="label" hide />
            <YAxis tickFormatter={formatValue} />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <Tooltip
              formatter={(value: number) => [formatValue(value), 'Listening']}
              labelFormatter={(label: string) => label}
            />
            <Area
              type="monotone"
              dataKey="minutes"
              stroke="#6366f1"
              fill="#c7d2fe"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-xs text-slate-500">
        Hover to see monthly totals. Scroll horizontally in the chart area.
      </div>
    </div>
  );
}
