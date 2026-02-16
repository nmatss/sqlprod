'use client';

import { cn } from '@/lib/utils';

interface GaugeChartProps {
  value: number;
  max: number;
  label: string;
  unit?: string;
  thresholds?: { yellow: number; red: number };
}

export function GaugeChart({ value, max, label, unit = '%', thresholds = { yellow: 70, red: 85 } }: GaugeChartProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  const getColor = () => {
    if (pct >= thresholds.red) return { ring: 'text-red-500', bg: 'text-red-500/10' };
    if (pct >= thresholds.yellow) return { ring: 'text-amber-500', bg: 'text-amber-500/10' };
    return { ring: 'text-emerald-500', bg: 'text-emerald-500/10' };
  };

  const colors = getColor();
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-24 w-24">
        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="40"
            fill="none" strokeWidth="8"
            className={cn('stroke-current', colors.bg)}
          />
          <circle
            cx="50" cy="50" r="40"
            fill="none" strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn('stroke-current transition-all duration-500', colors.ring)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-zinc-100">{Math.round(pct)}</span>
          <span className="text-[10px] text-zinc-500">{unit}</span>
        </div>
      </div>
      <span className="mt-1.5 text-xs font-medium text-zinc-400">{label}</span>
    </div>
  );
}
