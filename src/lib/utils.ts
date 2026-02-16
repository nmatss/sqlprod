import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb.toFixed(1)} MB`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function truncateSql(sql: string, maxLen = 200): string {
  if (!sql) return '';
  const cleaned = sql.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLen) return cleaned;
  return cleaned.substring(0, maxLen) + '...';
}

export function statusColor(status: string): 'green' | 'yellow' | 'red' | 'gray' {
  switch (status.toLowerCase()) {
    case 'succeeded':
    case 'running':
    case 'online':
      return 'green';
    case 'retry':
    case 'in progress':
    case 'warning':
      return 'yellow';
    case 'failed':
    case 'canceled':
    case 'error':
    case 'offline':
      return 'red';
    default:
      return 'gray';
  }
}
