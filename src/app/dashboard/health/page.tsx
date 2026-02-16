'use client';

import { useMonitorData } from '@/hooks/useMonitorData';
import { Card, MetricCard } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { CardSkeleton, TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { formatBytes } from '@/lib/utils';
import type { DatabaseSize, BackupInfo, FileGrowth } from '@/lib/types';

export default function HealthPage() {
  const { data: sizes, errors: sizeErr, loading: sizeLoading } =
    useMonitorData<DatabaseSize>({ endpoint: 'health', section: 'size' });
  const { data: backups, errors: bkpErr, loading: bkpLoading } =
    useMonitorData<BackupInfo>({ endpoint: 'health', section: 'backups' });
  const { data: files, errors: fileErr, loading: fileLoading } =
    useMonitorData<FileGrowth>({ endpoint: 'health', section: 'files' });

  const allErrors = [...sizeErr, ...bkpErr, ...fileErr];

  const backupColumns = [
    {
      key: 'server',
      header: 'Server',
      render: (r: BackupInfo) => <span className="text-xs text-zinc-500">{r.server.toUpperCase()}</span>,
      className: 'w-16',
    },
    { key: 'database', header: 'Database' },
    { key: 'backupType', header: 'Type' },
    {
      key: 'lastBackupDate',
      header: 'Last Backup',
      render: (r: BackupInfo) => <span className="text-xs">{r.lastBackupDate ? new Date(r.lastBackupDate).toLocaleString() : 'Never'}</span>,
    },
    {
      key: 'hoursAgo',
      header: 'Hours Ago',
      render: (r: BackupInfo) => {
        if (r.hoursAgo === null) return <StatusBadge status="red" label="Never" />;
        const status = r.hoursAgo > 48 ? 'red' : r.hoursAgo > 24 ? 'yellow' : 'green';
        return <StatusBadge status={status} label={`${r.hoursAgo}h`} />;
      },
    },
    {
      key: 'backupSizeMB',
      header: 'Size',
      render: (r: BackupInfo) => <span className="font-mono text-xs">{formatBytes(r.backupSizeMB)}</span>,
    },
  ];

  const fileColumns = [
    {
      key: 'server',
      header: 'Server',
      render: (r: FileGrowth) => <span className="text-xs text-zinc-500">{r.server.toUpperCase()}</span>,
      className: 'w-16',
    },
    { key: 'database', header: 'Database' },
    { key: 'fileName', header: 'File' },
    { key: 'fileType', header: 'Type' },
    {
      key: 'sizeMB',
      header: 'Size',
      render: (r: FileGrowth) => <span className="font-mono text-xs">{formatBytes(r.sizeMB)}</span>,
    },
    {
      key: 'spaceUsedMB',
      header: 'Used',
      render: (r: FileGrowth) => <span className="font-mono text-xs">{formatBytes(r.spaceUsedMB)}</span>,
    },
    {
      key: 'freePercent',
      header: 'Free %',
      render: (r: FileGrowth) => {
        const pct = r.freePercent ?? 0;
        return (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={`h-full rounded-full ${pct < 10 ? 'bg-red-500' : pct < 25 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${100 - pct}%` }}
              />
            </div>
            <span className="font-mono text-xs">{pct.toFixed(1)}%</span>
          </div>
        );
      },
    },
    { key: 'growthSetting', header: 'Growth' },
    {
      key: 'maxSizeMB',
      header: 'Max',
      render: (r: FileGrowth) => <span className="font-mono text-xs">{r.maxSizeMB ? formatBytes(r.maxSizeMB) : 'Unlimited'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-zinc-100">Database Health</h1>

      {allErrors.length > 0 && <ErrorAlert errors={allErrors} />}

      {/* Database Size */}
      {sizeLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        sizes.map((s) => (
          <div key={s.server} className="space-y-3">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase">{s.server.toUpperCase()} - {s.database}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MetricCard label="Data Size" value={formatBytes(s.dataSizeMB)} status="gray" />
              <MetricCard label="Log Size" value={formatBytes(s.logSizeMB)} status="gray" />
              <MetricCard
                label="Total Size"
                value={formatBytes(s.totalSizeMB)}
                status="gray"
              />
            </div>
          </div>
        ))
      )}

      {/* Backups */}
      {bkpLoading ? <TableSkeleton rows={5} /> : (
        <Card title="Backup Status">
          <DataTable columns={backupColumns} data={backups} emptyMessage="No backup information" maxHeight="350px" />
        </Card>
      )}

      {/* File Growth */}
      {fileLoading ? <TableSkeleton rows={5} /> : (
        <Card title="Database Files">
          <DataTable columns={fileColumns} data={files} emptyMessage="No file data" maxHeight="350px" />
        </Card>
      )}
    </div>
  );
}
