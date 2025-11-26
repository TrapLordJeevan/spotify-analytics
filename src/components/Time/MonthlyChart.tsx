'use client';

import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Play } from '@/types';
import { getMonthlyData } from '@/lib/analytics/time';

interface MonthlyChartProps {
  plays: Play[];
}

const monthFormatter = (year: number, month: number) =>
  new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  });

export function MonthlyChart({ plays }: MonthlyChartProps) {
  const data = useMemo(
    () =>
      getMonthlyData(plays).map((entry) => ({
        label: monthFormatter(entry.year, entry.month),
        minutes: entry.minutes,
      })),
    [plays]
  );

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500 shadow-sm">
        No monthly listening data yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Monthly minutes</h3>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <XAxis dataKey="label" hide />
            <YAxis tickFormatter={(value) => `${value}m`} />
            <Tooltip />
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




