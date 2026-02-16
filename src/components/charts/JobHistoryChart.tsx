'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { JobHistoryEntry } from '@/lib/types';

interface JobHistoryChartProps {
  data: JobHistoryEntry[];
}

export function JobHistoryChart({ data }: JobHistoryChartProps) {
  const last20 = data.slice(0, 20).reverse().map((d) => ({
    name: d.jobName.substring(0, 15),
    duration: d.runDurationSec,
    status: d.status,
    date: d.runDate,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={last20}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#71717a' }} angle={-30} textAnchor="end" height={60} />
        <YAxis tick={{ fontSize: 10, fill: '#71717a' }} label={{ value: 'Duration (s)', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#71717a' } }} />
        <Tooltip
          contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
        />
        <Bar dataKey="duration" name="Duration (s)" radius={[4, 4, 0, 0]}>
          {last20.map((entry, idx) => (
            <Cell
              key={idx}
              fill={entry.status === 'Failed' ? '#ef4444' : entry.status === 'Succeeded' ? '#22c55e' : '#f59e0b'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
