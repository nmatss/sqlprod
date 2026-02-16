'use client';

import { useMonitorData } from '@/hooks/useMonitorData';
import { MetricCard } from '@/components/ui/Card';
import { Card } from '@/components/ui/Card';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { GaugeChart } from '@/components/charts/GaugeChart';
import { formatBytes, formatNumber } from '@/lib/utils';
import type { OverviewData } from '@/lib/types';
import {
  Cpu, MemoryStick, Users, Lock, Timer, AlertTriangle,
  Database, Clock,
} from 'lucide-react';

export default function OverviewPage() {
  const { data, errors, loading } = useMonitorData<OverviewData>({ endpoint: 'overview' });

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-bold text-zinc-100">Overview</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-zinc-100">Overview</h1>

      {errors.length > 0 && <ErrorAlert errors={errors} />}

      {data.map((srv) => (
        <div key={srv.server} className="space-y-4">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            {srv.server.toUpperCase()}
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="CPU Usage"
              value={`${srv.cpuPercent}%`}
              status={srv.cpuPercent > 85 ? 'red' : srv.cpuPercent > 60 ? 'yellow' : 'green'}
              icon={<Cpu className="h-4 w-4 text-zinc-500" />}
            />
            <MetricCard
              label="Memory"
              value={formatBytes(srv.memoryUsedMB)}
              subtitle={`of ${formatBytes(srv.memoryTotalMB)}`}
              status={
                srv.memoryTotalMB > 0 && (srv.memoryUsedMB / srv.memoryTotalMB) > 0.9
                  ? 'red'
                  : (srv.memoryUsedMB / srv.memoryTotalMB) > 0.75
                    ? 'yellow'
                    : 'green'
              }
              icon={<MemoryStick className="h-4 w-4 text-zinc-500" />}
            />
            <MetricCard
              label="Active Sessions"
              value={srv.activeSessions}
              status="gray"
              icon={<Users className="h-4 w-4 text-zinc-500" />}
            />
            <MetricCard
              label="Blocked"
              value={srv.blockedProcesses}
              status={srv.blockedProcesses > 0 ? 'red' : 'green'}
              icon={<Lock className="h-4 w-4 text-zinc-500" />}
            />
            <MetricCard
              label="Running Jobs"
              value={srv.runningJobs}
              status="gray"
              icon={<Timer className="h-4 w-4 text-zinc-500" />}
            />
            <MetricCard
              label="Failed Jobs (24h)"
              value={srv.failedJobsLast24h}
              status={srv.failedJobsLast24h > 0 ? 'red' : 'green'}
              icon={<AlertTriangle className="h-4 w-4 text-zinc-500" />}
            />
            <MetricCard
              label="Database Size"
              value={formatBytes(srv.databaseSizeMB)}
              status="gray"
              icon={<Database className="h-4 w-4 text-zinc-500" />}
            />
            <MetricCard
              label="Uptime"
              value={srv.uptime}
              status="gray"
              icon={<Clock className="h-4 w-4 text-zinc-500" />}
            />
          </div>

          <Card title="Performance Gauges">
            <div className="flex flex-wrap items-center justify-around gap-6 py-2">
              <GaugeChart value={srv.cpuPercent} max={100} label="CPU" />
              <GaugeChart
                value={srv.memoryUsedMB}
                max={srv.memoryTotalMB || 1}
                label="Memory"
              />
              <GaugeChart
                value={srv.pleSeconds}
                max={1800}
                label="PLE"
                unit="s"
                thresholds={{ yellow: 300, red: 150 }}
              />
              <GaugeChart
                value={srv.batchRequestsSec}
                max={10000}
                label="Batch/s"
                unit=""
                thresholds={{ yellow: 5000, red: 8000 }}
              />
            </div>
          </Card>
        </div>
      ))}

      {data.length === 0 && errors.length === 0 && (
        <div className="text-center text-zinc-500 py-12">
          No data available. Check server connectivity.
        </div>
      )}
    </div>
  );
}
