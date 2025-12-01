'use client';

import React from 'react';

interface ChartData {
  label: string;
  value: number;
}

interface ListeningChartProps {
  data: ChartData[];
  title: string;
  gradient?: string;
}

export function ListeningChart({ data, title, gradient }: ListeningChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
      <h3 className="text-white font-bold text-lg mb-6">{title}</h3>

      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{item.label}</span>
                <span className="text-white font-medium">{item.value.toLocaleString()}</span>
              </div>

              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${percentage}%`,
                    background: gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
