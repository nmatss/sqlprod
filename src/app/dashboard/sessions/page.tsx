'use client';

import { useState } from 'react';
import { useMonitorData } from '@/hooks/useMonitorData';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { formatNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { SessionInfo, SessionSummary } from '@/lib/types';

export default function SessionsPage() {
  const [tab, setTab] = useState<'list' | 'summary'>('list');
  const { data: sessions, errors: sessErr, loading: sessLoading } =
    useMonitorData<SessionInfo>({ endpoint: 'sessions', section: 'list' });
  const { data: summary, errors: sumErr, loading: sumLoading } =
    useMonitorData<SessionSummary>({ endpoint: 'sessions', section: 'summary' });

  const allErrors = [...sessErr, ...sumErr];

  const sessionColumns = [
    {
      key: 'server',
      header: 'Server',
      render: (r: SessionInfo) => <span className="text-xs text-zinc-500">{r.server.toUpperCase()}</span>,
      className: 'w-16',
    },
    {
      key: 'sessionId',
      header: 'SPID',
      render: (r: SessionInfo) => <span className="font-mono text-xs">{r.sessionId}</span>,
      className: 'w-16',
    },
    { key: 'loginName', header: 'Login' },
    { key: 'hostName', header: 'Host' },
    { key: 'programName', header: 'Program' },
    {
      key: 'status',
      header: 'Status',
      render: (r: SessionInfo) => (
        <StatusBadge
          status={r.status === 'running' ? 'green' : r.status === 'sleeping' ? 'gray' : 'yellow'}
          label={r.status}
        />
      ),
    },
    { key: 'database', header: 'Database' },
    {
      key: 'cpuTime',
      header: 'CPU',
      render: (r: SessionInfo) => <span className="font-mono text-xs">{formatNumber(r.cpuTime)}</span>,
    },
    {
      key: 'memoryUsageKB',
      header: 'Memory (KB)',
      render: (r: SessionInfo) => <span className="font-mono text-xs">{formatNumber(r.memoryUsageKB)}</span>,
    },
    {
      key: 'reads',
      header: 'Reads',
      render: (r: SessionInfo) => <span className="font-mono text-xs">{formatNumber(r.reads)}</span>,
    },
    {
      key: 'lastRequestStartTime',
      header: 'Last Request',
      render: (r: SessionInfo) => <span className="text-xs">{new Date(r.lastRequestStartTime).toLocaleString()}</span>,
    },
  ];

  const summaryColumns = [
    {
      key: 'server',
      header: 'Server',
      render: (r: SessionSummary) => <span className="text-xs text-zinc-500">{r.server.toUpperCase()}</span>,
      className: 'w-16',
    },
    { key: 'loginName', header: 'Login' },
    {
      key: 'sessionCount',
      header: 'Sessions',
      render: (r: SessionSummary) => <span className="font-mono text-xs font-bold text-blue-400">{r.sessionCount}</span>,
    },
    {
      key: 'totalCpu',
      header: 'Total CPU',
      render: (r: SessionSummary) => <span className="font-mono text-xs">{formatNumber(r.totalCpu)}</span>,
    },
    {
      key: 'totalReads',
      header: 'Total Reads',
      render: (r: SessionSummary) => <span className="font-mono text-xs">{formatNumber(r.totalReads)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-100">Sessions & Users</h1>
        <div className="flex gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-1">
          {(['list', 'summary'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                tab === t ? 'bg-blue-500/20 text-blue-400' : 'text-zinc-400 hover:text-zinc-200',
              )}
            >
              {t === 'list' ? 'All Sessions' : 'By Login'}
            </button>
          ))}
        </div>
      </div>

      {allErrors.length > 0 && <ErrorAlert errors={allErrors} />}

      <div className="text-xs text-zinc-500">
        Total sessions: {sessions.length}
      </div>

      {tab === 'list' ? (
        sessLoading ? <TableSkeleton rows={8} /> : (
          <Card>
            <DataTable columns={sessionColumns} data={sessions} emptyMessage="No sessions" maxHeight="600px" />
          </Card>
        )
      ) : (
        sumLoading ? <TableSkeleton rows={5} /> : (
          <Card>
            <DataTable columns={summaryColumns} data={summary} emptyMessage="No data" maxHeight="400px" />
          </Card>
        )
      )}
    </div>
  );
}
