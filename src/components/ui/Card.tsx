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
    <div className={cn('rounded-xl border border-zinc-800 bg-zinc-900/50 p-5', className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          <div>
            {title && <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>}
            {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
          </div>
          {action}
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
    <div className={cn('rounded-xl border p-4', statusColors[status])}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-400">{label}</span>
        <div className="flex items-center gap-2">
          {status !== 'gray' && (
            <span className={cn('h-2 w-2 rounded-full', dotColors[status])} />
          )}
          {icon}
        </div>
      </div>
      <div className="mt-2 text-2xl font-bold text-zinc-100">{value}</div>
      {subtitle && <div className="mt-1 text-xs text-zinc-500">{subtitle}</div>}
    </div>
  );
}
