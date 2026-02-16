'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { WaitStat } from '@/lib/types';

interface WaitStatsChartProps {
  data: WaitStat[];
}

export function WaitStatsChart({ data }: WaitStatsChartProps) {
  const formatted = data.slice(0, 10).map((d) => ({
    name: d.waitType.replace('ASYNC_', '').replace('PREEMPTIVE_', '').substring(0, 20),
    waitMs: d.waitTimeMs,
    signalMs: d.signalWaitTimeMs,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={formatted} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis type="number" tick={{ fontSize: 10, fill: '#71717a' }} />
        <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 10, fill: '#71717a' }} />
        <Tooltip
          contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
        />
        <Bar dataKey="waitMs" name="Wait (ms)" fill="#ef4444" radius={[0, 4, 4, 0]} />
        <Bar dataKey="signalMs" name="Signal (ms)" fill="#f59e0b" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
