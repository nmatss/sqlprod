'use client';

import { useState } from 'react';
import { useMonitorData } from '@/hooks/useMonitorData';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { TableSkeleton, ChartSkeleton } from '@/components/ui/LoadingSkeleton';
import { JobHistoryChart } from '@/components/charts/JobHistoryChart';
import { statusColor, formatDuration } from '@/lib/utils';
import type { JobInfo, JobHistoryEntry } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function JobsPage() {
  const [tab, setTab] = useState<'list' | 'history'>('list');
  const { data: jobs, errors: jobErrors, loading: jobsLoading } = useMonitorData<JobInfo>({ endpoint: 'jobs', section: 'list' });
  const { data: history, errors: histErrors, loading: histLoading } = useMonitorData<JobHistoryEntry>({ endpoint: 'jobs', section: 'history' });

  const allErrors = [...jobErrors, ...histErrors];

  const jobColumns = [
    {
      key: 'server',
      header: 'Server',
      render: (r: JobInfo) => <span className="text-xs text-zinc-500">{r.server.toUpperCase()}</span>,
      className: 'w-16',
    },
    { key: 'jobName', header: 'Job Name' },
    {
      key: 'enabled',
      header: 'Enabled',
      render: (r: JobInfo) => (
        <StatusBadge status={r.enabled ? 'green' : 'gray'} label={r.enabled ? 'Yes' : 'No'} />
      ),
      className: 'w-20',
    },
    {
      key: 'lastRunStatus',
      header: 'Last Status',
      render: (r: JobInfo) => (
        <StatusBadge status={statusColor(r.lastRunStatus)} label={r.lastRunStatus} />
      ),
    },
    {
      key: 'lastRunDate',
      header: 'Last Run',
      render: (r: JobInfo) => <span className="text-xs">{r.lastRunDate || '—'}</span>,
    },
    {
      key: 'lastRunDurationSec',
      header: 'Duration',
      render: (r: JobInfo) => <span className="text-xs font-mono">{formatDuration(r.lastRunDurationSec)}</span>,
      className: 'w-20',
    },
    {
      key: 'nextRunDate',
      header: 'Next Run',
      render: (r: JobInfo) => <span className="text-xs">{r.nextRunDate || '—'}</span>,
    },
    {
      key: 'currentlyRunning',
      header: 'Running',
      render: (r: JobInfo) =>
        r.currentlyRunning ? (
          <span className="inline-flex h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
        ) : null,
      className: 'w-16',
    },
  ];

  const historyColumns = [
    {
      key: 'server',
      header: 'Server',
      render: (r: JobHistoryEntry) => <span className="text-xs text-zinc-500">{r.server.toUpperCase()}</span>,
      className: 'w-16',
    },
    { key: 'jobName', header: 'Job Name' },
    {
      key: 'status',
      header: 'Status',
      render: (r: JobHistoryEntry) => <StatusBadge status={statusColor(r.status)} label={r.status} />,
    },
    {
      key: 'runDate',
      header: 'Run Date',
      render: (r: JobHistoryEntry) => <span className="text-xs">{r.runDate}</span>,
    },
    {
      key: 'runDurationSec',
      header: 'Duration',
      render: (r: JobHistoryEntry) => <span className="text-xs font-mono">{formatDuration(r.runDurationSec)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-100">Agent Jobs</h1>
        <div className="flex gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-1">
          {(['list', 'history'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                tab === t ? 'bg-blue-500/20 text-blue-400' : 'text-zinc-400 hover:text-zinc-200',
              )}
            >
              {t === 'list' ? 'Job List' : 'History'}
            </button>
          ))}
        </div>
      </div>

      {allErrors.length > 0 && <ErrorAlert errors={allErrors} />}

      {tab === 'list' ? (
        jobsLoading ? (
          <TableSkeleton rows={8} />
        ) : (
          <Card>
            <DataTable columns={jobColumns} data={jobs} emptyMessage="No jobs found" maxHeight="600px" />
          </Card>
        )
      ) : (
        <div className="space-y-6">
          {histLoading ? (
            <ChartSkeleton />
          ) : (
            <Card title="Recent Job Runs">
              <JobHistoryChart data={history} />
            </Card>
          )}
          {histLoading ? (
            <TableSkeleton rows={8} />
          ) : (
            <Card>
              <DataTable columns={historyColumns} data={history} emptyMessage="No history" maxHeight="400px" />
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
