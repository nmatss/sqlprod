'use client';

import { useState } from 'react';
import { useMonitorData } from '@/hooks/useMonitorData';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { truncateSql, formatDuration } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { ShieldAlert, Lock } from 'lucide-react';
import type { BlockingChain, LockWait } from '@/lib/types';

export default function LocksPage() {
  const [tab, setTab] = useState<'blocking' | 'waits'>('blocking');
  const { data: blocking, errors: blockErr, loading: blockLoading } =
    useMonitorData<BlockingChain>({ endpoint: 'locks', section: 'blocking' });
  const { data: waits, errors: waitErr, loading: waitLoading } =
    useMonitorData<LockWait>({ endpoint: 'locks', section: 'waits' });

  const allErrors = [...blockErr, ...waitErr];

  const blockingColumns = [
    {
      key: 'server',
      header: 'Server',
      render: (r: BlockingChain) => <span className="text-xs text-zinc-500">{r.server.toUpperCase()}</span>,
      className: 'w-16',
    },
    {
      key: 'headBlockerSessionId',
      header: 'Head Blocker',
      render: (r: BlockingChain) => (
        <span className="font-mono text-xs text-red-400 font-bold">SPID {r.headBlockerSessionId}</span>
      ),
    },
    { key: 'headBlockerLoginName', header: 'Blocker Login' },
    {
      key: 'headBlockerSqlText',
      header: 'Blocker SQL',
      render: (r: BlockingChain) => (
        <span className="text-xs font-mono text-zinc-400" title={r.headBlockerSqlText}>
          {truncateSql(r.headBlockerSqlText, 60)}
        </span>
      ),
    },
    {
      key: 'blockedSessionId',
      header: 'Blocked',
      render: (r: BlockingChain) => <span className="font-mono text-xs text-amber-400">SPID {r.blockedSessionId}</span>,
    },
    { key: 'blockedLoginName', header: 'Blocked Login' },
    {
      key: 'blockedWaitTime',
      header: 'Wait Time',
      render: (r: BlockingChain) => (
        <span className={cn('text-xs font-mono', r.blockedWaitTime > 30000 ? 'text-red-400' : 'text-zinc-300')}>
          {formatDuration(Math.floor(r.blockedWaitTime / 1000))}
        </span>
      ),
    },
    { key: 'blockedWaitType', header: 'Wait Type' },
    {
      key: 'blockingLevel',
      header: 'Level',
      render: (r: BlockingChain) => <span className="font-mono text-xs">{r.blockingLevel}</span>,
      className: 'w-14',
    },
  ];

  const waitColumns = [
    {
      key: 'server',
      header: 'Server',
      render: (r: LockWait) => <span className="text-xs text-zinc-500">{r.server.toUpperCase()}</span>,
      className: 'w-16',
    },
    {
      key: 'sessionId',
      header: 'SPID',
      render: (r: LockWait) => <span className="font-mono text-xs">{r.sessionId}</span>,
    },
    { key: 'lockType', header: 'Lock Type' },
    { key: 'lockMode', header: 'Mode' },
    { key: 'resourceType', header: 'Resource' },
    { key: 'objectName', header: 'Object' },
    {
      key: 'waitTimeMs',
      header: 'Wait (ms)',
      render: (r: LockWait) => <span className="font-mono text-xs">{r.waitTimeMs?.toLocaleString()}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-100">Locks & Blocking</h1>
        <div className="flex gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-1">
          {([
            { key: 'blocking' as const, label: 'Blocking Chains', icon: ShieldAlert },
            { key: 'waits' as const, label: 'Lock Waits', icon: Lock },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors',
                tab === t.key ? 'bg-blue-500/20 text-blue-400' : 'text-zinc-400 hover:text-zinc-200',
              )}
            >
              <t.icon className="h-3 w-3" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {allErrors.length > 0 && <ErrorAlert errors={allErrors} />}

      {blocking.length === 0 && waits.length === 0 && !blockLoading && !waitLoading && (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
            <Lock className="h-12 w-12 mb-3 text-emerald-500/50" />
            <p className="text-sm font-medium text-emerald-400">No blocking detected</p>
            <p className="text-xs mt-1">All clear - no lock contention at this time</p>
          </div>
        </Card>
      )}

      {tab === 'blocking' ? (
        blockLoading ? <TableSkeleton rows={4} /> : (
          blocking.length > 0 && (
            <Card title={`Blocking Chains (${blocking.length})`}>
              <DataTable columns={blockingColumns} data={blocking} emptyMessage="No blocking" maxHeight="500px" />
            </Card>
          )
        )
      ) : (
        waitLoading ? <TableSkeleton rows={4} /> : (
          waits.length > 0 && (
            <Card title={`Lock Waits (${waits.length})`}>
              <DataTable columns={waitColumns} data={waits} emptyMessage="No lock waits" maxHeight="500px" />
            </Card>
          )
        )
      )}
    </div>
  );
}
