'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to enforce dark mode
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(true);
    document.documentElement.classList.add('dark');
    return () => {
      document.documentElement.classList.add('dark');
    };
  }, []);

  return isDark;
}
