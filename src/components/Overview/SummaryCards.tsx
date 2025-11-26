'use client';

import { useMemo } from 'react';
import {
  calculateTotalListeningTime,
  calculateTotalPlays,
  getGoldenYear,
  getPeakDay,
} from '@/lib/analytics/overview';
import type { Play } from '@/types';

interface SummaryCardsProps {
  plays: Play[];
}

const intlNumber = new Intl.NumberFormat();
const intlDate = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

export function SummaryCards({ plays }: SummaryCardsProps) {
  const { totalHours, totalPlays, goldenYear, peakDay } = useMemo(() => {
    const hours = calculateTotalListeningTime(plays);
    const playsCount = calculateTotalPlays(plays);
    const year = getGoldenYear(plays);
    const peak = getPeakDay(plays);
    return {
      totalHours: hours,
      totalPlays: playsCount,
      goldenYear: year,
      peakDay: peak,
    };
  }, [plays]);

  const cards = [
    {
      label: 'Listening hours',
      value: intlNumber.format(totalHours),
      helper: 'Total time spent listening',
    },
    {
      label: 'Total plays',
      value: intlNumber.format(totalPlays),
      helper: 'Individual tracks/episodes played',
    },
    {
      label: 'Golden year',
      value: goldenYear ? goldenYear.toString() : '—',
      helper: 'Your highest-volume year',
    },
    {
      label: 'Peak day',
      value: peakDay ? intlDate.format(peakDay) : '—',
      helper: 'The most listening in a single day',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-slate-200 bg-white px-4 py-5 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {card.label}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
          <p className="mt-1 text-sm text-slate-500">{card.helper}</p>
        </div>
      ))}
    </div>
  );
}




