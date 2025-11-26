'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Play } from '@/types';
import { getDailyData, getMonthlyData, getYearlyData } from '@/lib/analytics/time';

interface DailyChartProps {
  plays: Play[];
}

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function DailyChart({ plays }: DailyChartProps) {
  const yearlyOptions = useMemo(() => getYearlyData(plays), [plays]);
  const latestYear = yearlyOptions.at(-1)?.year;
  const [selectedYear, setSelectedYear] = useState<number | undefined>(latestYear);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (latestYear && latestYear !== selectedYear) {
      setSelectedYear(latestYear);
      setSelectedMonth(undefined);
    }
  }, [latestYear, selectedYear]);

  const availableMonths = useMemo(() => {
    if (!selectedYear) return [];
    const months = getMonthlyData(plays).filter((entry) => entry.year === selectedYear);
    return months.map((entry) => entry.month);
  }, [plays, selectedYear]);

  const dailyData = useMemo(
    () => getDailyData(plays, selectedYear, selectedMonth),
    [plays, selectedMonth, selectedYear]
  );

  if (!latestYear) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500 shadow-sm">
        No daily data yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900">Daily listening</h3>
        <div className="flex items-center gap-3 text-sm">
          <label className="flex items-center gap-2">
            Year
            <select
              className="rounded-md border border-slate-200 px-2 py-1"
              value={selectedYear}
              onChange={(event) => {
                const year = Number(event.target.value);
                setSelectedYear(year || undefined);
                setSelectedMonth(undefined);
              }}
            >
              {yearlyOptions.map((entry) => (
                <option key={entry.year} value={entry.year}>
                  {entry.year}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            Month
            <select
              className="rounded-md border border-slate-200 px-2 py-1"
              value={selectedMonth ?? ''}
              onChange={(event) => {
                const value = event.target.value;
                setSelectedMonth(value ? Number(value) : undefined);
              }}
            >
              <option value="">All</option>
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {monthNames[month - 1]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={dailyData.map((entry) => ({
              label: entry.date.toISOString().split('T')[0],
              minutes: entry.minutes,
            }))}
          >
            <XAxis dataKey="label" hide />
            <YAxis tickFormatter={(value) => `${value}m`} />
            <Tooltip />
            <Line type="monotone" dataKey="minutes" stroke="#f97316" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


