'use client';

import React from 'react';

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 7v5l3 2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

interface Activity {
  id: string;
  title: string;
  artist: string;
  timestamp: string;
  accent?: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
      <h3 className="text-white font-bold text-lg mb-6">Recent Activity</h3>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-lg flex-shrink-0"
              style={{
                background:
                  activity.accent || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            />

            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{activity.title}</p>
              <p className="text-sm text-gray-400 truncate">{activity.artist}</p>
            </div>

            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <ClockIcon />
              <span>{activity.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
