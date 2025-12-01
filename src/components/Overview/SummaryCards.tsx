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
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 auto-rows-fr">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#111111] px-5 py-5 shadow-sm"
        >
          <p className="text-sm md:text-base font-semibold uppercase tracking-wide text-slate-300">
            {card.label}
          </p>
          <p className="mt-2 text-2xl md:text-3xl font-semibold text-white leading-tight">{card.value}</p>
          <p className="mt-2 text-sm md:text-base text-slate-400">{card.helper}</p>
        </div>
      ))}
    </div>
  );
}
