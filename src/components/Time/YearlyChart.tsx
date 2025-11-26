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
import { getYearlyData } from '@/lib/analytics/time';

interface YearlyChartProps {
  plays: Play[];
  metric: 'minutes' | 'plays';
}

export function YearlyChart({ plays, metric }: YearlyChartProps) {
  const data = useMemo(() => getYearlyData(plays, metric), [plays, metric]);
  const formatValue = (value: number) =>
    metric === 'minutes' ? `${value.toLocaleString()}m` : `${value.toLocaleString()} plays`;

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400 shadow-sm">
        No yearly data available yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Yearly {metric}</h3>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="year" />
            <YAxis tickFormatter={formatValue} />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <Tooltip formatter={(value: number) => [formatValue(value), 'Listening']} />
            <Bar dataKey="minutes" fill="#14b8a6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

