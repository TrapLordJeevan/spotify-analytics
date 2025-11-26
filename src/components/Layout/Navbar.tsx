'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Upload', href: '/upload' },
  { label: 'Overview', href: '/overview' },
  { label: 'Artists', href: '/artists' },
  { label: 'Songs', href: '/songs' },
  { label: 'Genres', href: '/genres' },
  { label: 'Time', href: '/time' },
  { label: 'Story', href: '/story' },
];

export function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/upload') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/overview" className="text-lg font-semibold text-slate-900">
          spotify stats
        </Link>
        <nav className="flex flex-wrap gap-2 text-sm font-medium text-slate-600">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 transition ${
                isActive(item.href)
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}




