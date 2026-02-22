'use client';

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export function Card({ children, className, title, subtitle, action }: CardProps) {
  return (
    <div className={cn('rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-5', className)}>
      {(title || action) && (
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {title && <h3 className="text-sm font-semibold text-zinc-100 truncate">{title}</h3>}
            {subtitle && <p className="text-xs text-zinc-500 mt-0.5 truncate">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  status?: 'green' | 'yellow' | 'red' | 'gray';
  icon?: ReactNode;
}

export function MetricCard({ label, value, subtitle, status = 'gray', icon }: MetricCardProps) {
  const statusColors = {
    green: 'border-emerald-500/30 bg-emerald-500/5',
    yellow: 'border-amber-500/30 bg-amber-500/5',
    red: 'border-red-500/30 bg-red-500/5',
    gray: 'border-zinc-800 bg-zinc-900/50',
  };

  const dotColors = {
    green: 'bg-emerald-400',
    yellow: 'bg-amber-400',
    red: 'bg-red-400',
    gray: 'bg-zinc-600',
  };

  return (
    <div className={cn('rounded-xl border p-3 sm:p-4 min-w-0 overflow-hidden', statusColors[status])}>
      <div className="flex items-center justify-between gap-1">
        <span className="text-[11px] font-medium text-zinc-400 truncate">{label}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          {status !== 'gray' && (
            <span className={cn('h-2 w-2 rounded-full', dotColors[status])} />
          )}
          {icon}
        </div>
      </div>
      <div className="mt-1.5 text-lg sm:text-xl font-bold text-zinc-100 truncate" title={String(value)}>
        {value}
      </div>
      {subtitle && <div className="mt-0.5 text-[11px] text-zinc-500 truncate">{subtitle}</div>}
    </div>
  );
}
