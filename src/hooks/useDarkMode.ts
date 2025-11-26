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
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsDark(isDarkTime());

    // Update on mount and set up interval to check every minute
    const updateDarkMode = () => {
      const shouldBeDark = isDarkTime();
      setIsDark(shouldBeDark);
      
      // Apply dark mode class to document
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    updateDarkMode();

    // Check every minute to update dark mode
    const interval = setInterval(updateDarkMode, 60000);

    // Also listen for visibility change (when user switches tabs/windows)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateDarkMode();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isDark;
}

