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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const hour = new Date().getHours();
                const isDark = hour >= 18 || hour < 6;
                if (isDark) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-900 antialiased text-slate-900 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}


