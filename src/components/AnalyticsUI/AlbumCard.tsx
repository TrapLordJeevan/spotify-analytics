'use client';

import React from 'react';

interface AlbumCardProps {
  name: string;
  artist: string;
  plays: number;
  minutes: number;
  onClick?: () => void;
  accent?: string;
}

export function AlbumCard({ name, artist, plays, minutes, onClick, accent }: AlbumCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-[#1a1a1a] border border-white/10 p-5 transition-all duration-300 hover:border-white/20 hover:scale-[1.01] ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      {accent && (
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{ background: accent }}
        />
      )}
      <div className="relative z-10 space-y-2">
        <p className="text-white font-semibold text-lg leading-tight truncate">{name}</p>
        <p className="text-sm text-gray-400 truncate">{artist}</p>
        <div className="flex items-center gap-4 text-sm text-gray-300">
          <span>{plays.toLocaleString()} plays</span>
          <span className="text-gray-500">•</span>
          <span>{Math.round(minutes).toLocaleString()} min</span>
        </div>
      </div>
    </div>
  );
}
