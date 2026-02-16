'use client';

import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'green' | 'yellow' | 'red' | 'gray';
  label: string;
  size?: 'sm' | 'md';
}

const colors = {
  green: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  yellow: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  red: 'bg-red-400/10 text-red-400 border-red-400/20',
  gray: 'bg-zinc-400/10 text-zinc-400 border-zinc-400/20',
};

const dotColors = {
  green: 'bg-emerald-400',
  yellow: 'bg-amber-400',
  red: 'bg-red-400',
  gray: 'bg-zinc-500',
};

export function StatusBadge({ status, label, size = 'sm' }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        colors[status],
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dotColors[status])} />
      {label}
    </span>
  );
}
