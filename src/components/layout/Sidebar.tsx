'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Timer,
  Play,
  Lock,
  Gauge,
  Users,
  HeartPulse,
  Database,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/jobs', label: 'Jobs', icon: Timer },
  { href: '/dashboard/executions', label: 'Executions', icon: Play },
  { href: '/dashboard/locks', label: 'Locks', icon: Lock },
  { href: '/dashboard/performance', label: 'Performance', icon: Gauge },
  { href: '/dashboard/sessions', label: 'Sessions', icon: Users },
  { href: '/dashboard/health', label: 'Health', icon: HeartPulse },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-56 flex-col border-r border-zinc-800 bg-zinc-950">
      <div className="flex h-14 items-center gap-2 border-b border-zinc-800 px-4">
        <Database className="h-5 w-5 text-blue-400" />
        <span className="text-sm font-bold text-zinc-100">SQL Monitor</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 p-3">
        <div className="rounded-lg bg-zinc-900/50 px-3 py-2 text-[10px] text-zinc-500">
          Auto-refresh: 30s
        </div>
      </div>
    </aside>
  );
}
