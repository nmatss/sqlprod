'use client';

import { useMonitorData } from '@/hooks/useMonitorData';
import { Card, MetricCard } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { CardSkeleton, ChartSkeleton, TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { CpuChart } from '@/components/charts/CpuChart';
import { WaitStatsChart } from '@/components/charts/WaitStatsChart';
import { formatNumber, formatBytes } from '@/lib/utils';
import type { CpuSample, WaitStat, IoStat, MissingIndex, PerformanceCounters } from '@/lib/types';

export default function PerformancePage() {
  const { data: cpu, errors: cpuErr, loading: cpuLoading } =
    useMonitorData<CpuSample>({ endpoint: 'performance', section: 'cpu' });
  const { data: waits, errors: waitErr, loading: waitLoading } =
    useMonitorData<WaitStat>({ endpoint: 'performance', section: 'waits' });
  const { data: io, errors: ioErr, loading: ioLoading } =
    useMonitorData<IoStat>({ endpoint: 'performance', section: 'io' });
  const { data: indexes, errors: idxErr, loading: idxLoading } =
    useMonitorData<MissingIndex>({ endpoint: 'performance', section: 'indexes' });
  const { data: counters, errors: cntErr, loading: cntLoading } =
    useMonitorData<PerformanceCounters>({ endpoint: 'performance', section: 'counters' });

  const allErrors = [...cpuErr, ...waitErr, ...ioErr, ...idxErr, ...cntErr];

  const ioColumns = [
    {
      key: 'server',
      header: 'Server',
      render: (r: IoStat) => <span className="text-xs text-zinc-500">{r.server.toUpperCase()}</span>,
      className: 'w-16',
    },
    { key: 'database', header: 'Database' },
    { key: 'fileType', header: 'Type' },
    {
      key: 'readsMB',
      header: 'Reads (MB)',
      render: (r: IoStat) => <span className="font-mono text-xs">{formatNumber(r.readsMB)}</span>,
    },
    {
      key: 'writesMB',
      header: 'Writes (MB)',
      render: (r: IoStat) => <span className="font-mono text-xs">{formatNumber(r.writesMB)}</span>,
    },
    {
      key: 'avgReadLatencyMs',
      header: 'Read Lat (ms)',
      render: (r: IoStat) => (
        <span className={`font-mono text-xs ${r.avgReadLatencyMs > 20 ? 'text-red-400' : r.avgReadLatencyMs > 10 ? 'text-amber-400' : 'text-zinc-300'}`}>
          {r.avgReadLatencyMs}
        </span>
      ),
    },
    {
      key: 'avgWriteLatencyMs',
      header: 'Write Lat (ms)',
      render: (r: IoStat) => (
        <span className={`font-mono text-xs ${r.avgWriteLatencyMs > 20 ? 'text-red-400' : r.avgWriteLatencyMs > 10 ? 'text-amber-400' : 'text-zinc-300'}`}>
          {r.avgWriteLatencyMs}
        </span>
      ),
    },
  ];

  const indexColumns = [
    {
      key: 'server',
      header: 'Server',
      render: (r: MissingIndex) => <span className="text-xs text-zinc-500">{r.server.toUpperCase()}</span>,
      className: 'w-16',
    },
    { key: 'tableName', header: 'Table' },
    { key: 'equalityColumns', header: 'Equality' },
    { key: 'inequalityColumns', header: 'Inequality' },
    { key: 'includedColumns', header: 'Include' },
    {
      key: 'userSeeks',
      header: 'Seeks',
      render: (r: MissingIndex) => <span className="font-mono text-xs">{formatNumber(r.userSeeks)}</span>,
    },
    {
      key: 'avgUserImpact',
      header: 'Impact %',
      render: (r: MissingIndex) => <span className="font-mono text-xs">{r.avgUserImpact.toFixed(1)}%</span>,
    },
    {
      key: 'improvementMeasure',
      header: 'Score',
      render: (r: MissingIndex) => <span className="font-mono text-xs font-bold text-blue-400">{formatNumber(r.improvementMeasure)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-zinc-100">Performance</h1>

      {allErrors.length > 0 && <ErrorAlert errors={allErrors} />}

      {/* Counters */}
      {cntLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        counters.map((c) => (
          <div key={c.server}>
            <h2 className="text-xs font-semibold text-zinc-500 uppercase mb-3">{c.server.toUpperCase()}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                label="Page Life Expectancy"
                value={`${c.pleSeconds}s`}
                status={c.pleSeconds < 150 ? 'red' : c.pleSeconds < 300 ? 'yellow' : 'green'}
              />
              <MetricCard
                label="Batch Requests/sec"
                value={formatNumber(c.batchRequestsSec)}
                status="gray"
              />
              <MetricCard
                label="Buffer Cache Hit"
                value={`${c.bufferCacheHitRatio}%`}
                status={c.bufferCacheHitRatio < 90 ? 'red' : c.bufferCacheHitRatio < 95 ? 'yellow' : 'green'}
              />
              <MetricCard
                label="Memory"
                value={formatBytes(c.totalMemoryMB)}
                subtitle={`Target: ${formatBytes(c.targetMemoryMB)}`}
                status="gray"
              />
            </div>
          </div>
        ))
      )}

      {/* CPU History */}
      {cpuLoading ? <ChartSkeleton /> : (
        <Card title="CPU Usage History (last 30 min)">
          <CpuChart data={cpu} />
        </Card>
      )}

      {/* Wait Stats */}
      {waitLoading ? <ChartSkeleton /> : (
        <Card title="Top Wait Statistics">
          <WaitStatsChart data={waits} />
        </Card>
      )}

      {/* I/O Stats */}
      {ioLoading ? <TableSkeleton rows={5} /> : (
        <Card title="I/O Statistics">
          <DataTable columns={ioColumns} data={io} emptyMessage="No I/O data" maxHeight="350px" />
        </Card>
      )}

      {/* Missing Indexes */}
      {idxLoading ? <TableSkeleton rows={5} /> : (
        <Card title="Missing Indexes">
          <DataTable columns={indexColumns} data={indexes} emptyMessage="No missing indexes detected" maxHeight="350px" />
        </Card>
      )}
    </div>
  );
}
