'use client';

import { useState } from 'react';
import { useMonitorData } from '@/hooks/useMonitorData';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { truncateSql, formatNumber, formatDuration } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { ActiveQuery, ExpensiveQuery } from '@/lib/types';

export default function ExecutionsPage() {
  const [tab, setTab] = useState<'active' | 'expensive'>('active');
  const { data: active, errors: activeErr, loading: activeLoading } =
    useMonitorData<ActiveQuery>({ endpoint: 'executions', section: 'active' });
  const { data: expensive, errors: expErr, loading: expLoading } =
    useMonitorData<ExpensiveQuery>({ endpoint: 'executions', section: 'expensive' });

  const allErrors = [...activeErr, ...expErr];

  const activeColumns = [
    {
      key: 'server',
      header: 'Server',
      render: (r: ActiveQuery) => <span className="text-xs text-zinc-500">{r.server.toUpperCase()}</span>,
      className: 'w-16',
    },
    {
      key: 'sessionId',
      header: 'SPID',
      render: (r: ActiveQuery) => <span className="font-mono text-xs">{r.sessionId}</span>,
      className: 'w-16',
    },
    {
      key: 'status',
      header: 'Status',
      render: (r: ActiveQuery) => (
        <StatusBadge
          status={r.status === 'running' ? 'green' : r.status === 'suspended' ? 'yellow' : 'gray'}
          label={r.status}
        />
      ),
    },
    {
      key: 'elapsedMs',
      header: 'Elapsed',
      render: (r: ActiveQuery) => <span className="text-xs font-mono">{formatDuration(Math.floor(r.elapsedMs / 1000))}</span>,
    },
    { key: 'database', header: 'Database' },
    { key: 'loginName', header: 'Login' },
    {
      key: 'cpuTime',
      header: 'CPU',
      render: (r: ActiveQuery) => <span className="text-xs font-mono">{formatNumber(r.cpuTime)}</span>,
    },
    {
      key: 'reads',
      header: 'Reads',
      render: (r: ActiveQuery) => <span className="text-xs font-mono">{formatNumber(r.reads)}</span>,
    },
    {
      key: 'waitType',
      header: 'Wait',
      render: (r: ActiveQuery) => r.waitType ? <span className="text-xs text-amber-400">{r.waitType}</span> : <span className="text-zinc-600">—</span>,
    },
    {
      key: 'blockingSessionId',
      header: 'Blocked By',
      render: (r: ActiveQuery) =>
        r.blockingSessionId ? (
          <span className="text-xs font-mono text-red-400">{r.blockingSessionId}</span>
        ) : null,
      className: 'w-20',
    },
    {
      key: 'sqlText',
      header: 'SQL',
      render: (r: ActiveQuery) => (
        <span className="text-xs font-mono text-zinc-400" title={r.sqlText}>
          {truncateSql(r.sqlText, 80)}
        </span>
      ),
    },
  ];

  const expensiveColumns = [
    {
      key: 'server',
      header: 'Server',
      render: (r: ExpensiveQuery) => <span className="text-xs text-zinc-500">{r.server.toUpperCase()}</span>,
      className: 'w-16',
    },
    {
      key: 'sqlText',
      header: 'SQL',
      render: (r: ExpensiveQuery) => (
        <span className="text-xs font-mono text-zinc-400" title={r.sqlText}>
          {truncateSql(r.sqlText, 100)}
        </span>
      ),
    },
    {
      key: 'executionCount',
      header: 'Execs',
      render: (r: ExpensiveQuery) => <span className="font-mono text-xs">{formatNumber(r.executionCount)}</span>,
    },
    {
      key: 'avgWorkerTimeMs',
      header: 'Avg CPU (ms)',
      render: (r: ExpensiveQuery) => <span className="font-mono text-xs">{formatNumber(r.avgWorkerTimeMs)}</span>,
    },
    {
      key: 'totalWorkerTimeMs',
      header: 'Total CPU (ms)',
      render: (r: ExpensiveQuery) => <span className="font-mono text-xs">{formatNumber(r.totalWorkerTimeMs)}</span>,
    },
    {
      key: 'avgLogicalReads',
      header: 'Avg Reads',
      render: (r: ExpensiveQuery) => <span className="font-mono text-xs">{formatNumber(r.avgLogicalReads)}</span>,
    },
    {
      key: 'lastExecutionTime',
      header: 'Last Exec',
      render: (r: ExpensiveQuery) => <span className="text-xs">{new Date(r.lastExecutionTime).toLocaleString()}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-100">Active Executions</h1>
        <div className="flex gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-1">
          {(['active', 'expensive'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                tab === t ? 'bg-blue-500/20 text-blue-400' : 'text-zinc-400 hover:text-zinc-200',
              )}
            >
              {t === 'active' ? 'Running Queries' : 'Top Expensive'}
            </button>
          ))}
        </div>
      </div>

      {allErrors.length > 0 && <ErrorAlert errors={allErrors} />}

      {tab === 'active' ? (
        activeLoading ? <TableSkeleton rows={6} /> : (
          <Card>
            <DataTable columns={activeColumns} data={active} emptyMessage="No active queries" maxHeight="600px" />
          </Card>
        )
      ) : (
        expLoading ? <TableSkeleton rows={6} /> : (
          <Card>
            <DataTable columns={expensiveColumns} data={expensive} emptyMessage="No cached queries" maxHeight="600px" />
          </Card>
        )
      )}
    </div>
  );
}
