'use client';

import { cn } from '@/lib/utils';

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-lg bg-zinc-800/50', className)} />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <LoadingSkeleton className="h-4 w-32 mb-4" />
      <LoadingSkeleton className="h-8 w-20 mb-2" />
      <LoadingSkeleton className="h-3 w-48" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border border-zinc-800 overflow-hidden">
      <div className="bg-zinc-900 px-3 py-2.5">
        <LoadingSkeleton className="h-3 w-full" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-t border-zinc-800/50 px-3 py-3">
          <LoadingSkeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <LoadingSkeleton className="h-4 w-32 mb-4" />
      <LoadingSkeleton className="h-48 w-full rounded-lg" />
    </div>
  );
}
