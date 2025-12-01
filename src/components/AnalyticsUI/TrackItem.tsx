'use client';

import React from 'react';

interface TrackItemProps {
  rank: number;
  title: string;
  artist: string;
  plays: number;
  meta?: string;
  accent?: string;
  onClick?: () => void;
  stats?: {
    plays: number;
    minutes?: number;
    sharePercent?: number;
    skips?: number;
  };
}

export function TrackItem({ rank, title, artist, plays, meta, accent, onClick, stats }: TrackItemProps) {
  return (
    <div
      className={`group flex items-center gap-4 p-4 rounded-xl bg-[#1a1a1a] border border-white/10 transition-all duration-300 hover:bg-[#202020] hover:border-white/20 ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <span className="text-lg font-bold text-gray-500 w-8 text-center">{rank}</span>

      <div
        className="w-12 h-12 rounded-lg flex-shrink-0 relative overflow-hidden"
        style={{
          background: accent || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate">{title}</p>
        <p className="text-sm text-gray-400 truncate">{artist}</p>
      </div>

      <div className="flex flex-col items-end gap-1 text-sm min-w-[170px]">
        <div className="text-right">
          <p className="text-white font-semibold">{plays.toLocaleString()}</p>
          <p className="text-gray-500 text-xs">plays</p>
        </div>
        {stats ? (
          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            {typeof stats.minutes === 'number' && <span>{Math.round(stats.minutes)} min</span>}
            {typeof stats.sharePercent === 'number' && <span>{stats.sharePercent.toFixed(1)}%</span>}
            {typeof stats.skips === 'number' && <span>{stats.skips} skips</span>}
          </div>
        ) : (
          meta && <span className="text-gray-400 text-xs">{meta}</span>
        )}
      </div>
    </div>
  );
}
