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
import { getYearlyData } from '@/lib/analytics/time';

interface YearlyChartProps {
  plays: Play[];
}

export function YearlyChart({ plays }: YearlyChartProps) {
  const data = useMemo(() => getYearlyData(plays), [plays]);

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500 shadow-sm">
        No yearly data available yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Yearly minutes</h3>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(value) => `${value}m`} />
            <Tooltip />
            <Bar dataKey="minutes" fill="#14b8a6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}




