'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { CpuSample } from '@/lib/types';

interface CpuChartProps {
  data: CpuSample[];
}

export function CpuChart({ data }: CpuChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    time: new Date(d.eventTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  })).reverse();

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={formatted}>
        <defs>
          <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="otherGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#71717a' }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#71717a' }} />
        <Tooltip
          contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#a1a1aa' }}
        />
        <Area type="monotone" dataKey="sqlProcessPercent" name="SQL Server" stroke="#3b82f6" fill="url(#cpuGrad)" />
        <Area type="monotone" dataKey="otherProcessPercent" name="Other" stroke="#f59e0b" fill="url(#otherGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
