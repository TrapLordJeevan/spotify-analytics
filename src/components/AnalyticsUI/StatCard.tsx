'use client';

import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  gradient?: string;
  onClick?: () => void;
}

export function StatCard({ label, value, subtitle, gradient, onClick }: StatCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-[#1a1a1a] border border-white/10 p-6 transition-all duration-300 hover:border-white/20 ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      {gradient && (
        <div
          className="absolute inset-0 opacity-10"
          style={{ background: gradient }}
        />
      )}
      <div className="relative z-10 space-y-2">
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-4xl font-bold text-white leading-tight">{value}</p>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}
