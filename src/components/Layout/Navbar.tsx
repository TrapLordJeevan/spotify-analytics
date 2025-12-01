'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Upload', href: '/upload' },
  { label: 'Overview', href: '/overview' },
  { label: 'Artists', href: '/artists' },
  { label: 'Albums', href: '/albums' },
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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/overview" className="text-lg font-semibold text-white">
          spotify stats
        </Link>
        <nav className="flex flex-wrap gap-2 text-sm font-medium text-gray-300">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3 py-2 transition ${
                isActive(item.href)
                  ? 'bg-white text-black'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
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


