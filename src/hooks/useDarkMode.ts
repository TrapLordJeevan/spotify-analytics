'use client';

import { useEffect, useState } from 'react';

/**
 * Determines if it's currently "dark time" (evening/night)
 * Default: 6 PM (18:00) to 6 AM (06:00)
 */
function isDarkTime(): boolean {
  const now = new Date();
  const hour = now.getHours();
  
  // Dark mode from 6 PM (18:00) to 6 AM (06:00)
  return hour >= 18 || hour < 6;
}

/**
 * Hook to manage time-based dark mode
 * Automatically switches between light and dark mode based on time of day
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Force dark mode globally
    setIsDark(true);
    document.documentElement.classList.add('dark');
    return () => {
      document.documentElement.classList.add('dark');
    };
  }, []);

  return isDark;
}
