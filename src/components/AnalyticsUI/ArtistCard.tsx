'use client';

import React from 'react';

const MusicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-white/80" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M18 3v11.5a3.5 3.5 0 1 1-2-3.146V7.5l-8 2.222V17a3.5 3.5 0 1 1-2-3.146V5.5L18 3Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface ArtistCardProps {
  name: string;
  plays: number;
  hours: number;
  image?: string;
  onClick?: () => void;
}

export function ArtistCard({ name, plays, hours, image, onClick }: ArtistCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-[#1a1a1a] border border-white/10 p-6 transition-all duration-300 hover:border-white/20 hover:scale-[1.01] ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div
        className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300"
        style={{
          background: image || 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        }}
      />

      <div className="relative z-10">
        <div
          className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{
            background: image || 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
          }}
        >
          <MusicIcon />
        </div>

        <h3 className="text-white font-bold text-center mb-2 truncate">{name}</h3>

        <div className="flex justify-center gap-4 text-sm">
          <div className="text-center">
            <p className="text-white font-medium">{plays.toLocaleString()}</p>
            <p className="text-gray-500 text-xs">plays</p>
          </div>
          <div className="text-center">
            <p className="text-white font-medium">{hours.toLocaleString()}h</p>
            <p className="text-gray-500 text-xs">listened</p>
          </div>
        </div>
      </div>
    </div>
  );
}
