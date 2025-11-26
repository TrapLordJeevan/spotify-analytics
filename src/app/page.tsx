'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDataStore } from '@/store/useDataStore';

export default function HomePage() {
  const router = useRouter();
  const hasData = useDataStore((state) => state.plays.length > 0);

  useEffect(() => {
    router.replace(hasData ? '/overview' : '/upload');
  }, [hasData, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-500">
      Redirecting you to {hasData ? 'overview' : 'upload'}…
    </main>
  );
}



