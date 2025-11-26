import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Spotify Extended History',
  description: 'Client-side analytics for your Spotify extended streaming history.',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 dark:bg-slate-900 antialiased text-slate-900 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}


