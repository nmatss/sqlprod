import { NextRequest, NextResponse } from 'next/server';
import { queryServer, parseServerParam } from '@/lib/db';
import { CURRENT_CPU_QUERY, PERFORMANCE_COUNTERS_QUERY } from '@/lib/queries/performance';
import { FAILED_JOBS_24H_QUERY, RUNNING_JOBS_QUERY } from '@/lib/queries/jobs';
import { ACTIVE_SESSION_COUNT_QUERY } from '@/lib/queries/sessions';
import { DATABASE_SIZE_QUERY, MEMORY_USAGE_QUERY, UPTIME_QUERY, BLOCKED_COUNT_QUERY } from '@/lib/queries/health';
import type { ServerKey, MonitorResponse, OverviewData } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function getOverview(server: ServerKey): Promise<OverviewData> {
  const [cpu, counters, failedJobs, runningJobs, sessions, dbSize, memory, uptime, blocked] =
    await Promise.all([
      queryServer<{ cpuPercent: number }>(server, CURRENT_CPU_QUERY),
      queryServer<{ pleSeconds: number; batchRequestsSec: number; targetMemoryMB: number; totalMemoryMB: number }>(server, PERFORMANCE_COUNTERS_QUERY),
      queryServer<{ failedCount: number }>(server, FAILED_JOBS_24H_QUERY),
      queryServer<{ jobName: string }>(server, RUNNING_JOBS_QUERY),
      queryServer<{ activeSessions: number }>(server, ACTIVE_SESSION_COUNT_QUERY),
      queryServer<{ dataSizeMB: number; logSizeMB: number; totalSizeMB: number }>(server, DATABASE_SIZE_QUERY),
      queryServer<{ memoryTotalMB: number; memoryUsedMB: number }>(server, MEMORY_USAGE_QUERY),
      queryServer<{ uptime: string }>(server, UPTIME_QUERY),
      queryServer<{ blockedCount: number }>(server, BLOCKED_COUNT_QUERY),
    ]);

  return {
    server,
    cpuPercent: cpu[0]?.cpuPercent ?? 0,
    memoryUsedMB: memory[0]?.memoryUsedMB ?? 0,
    memoryTotalMB: memory[0]?.memoryTotalMB ?? 0,
    activeSessions: sessions[0]?.activeSessions ?? 0,
    blockedProcesses: blocked[0]?.blockedCount ?? 0,
    runningJobs: runningJobs.length,
    failedJobsLast24h: failedJobs[0]?.failedCount ?? 0,
    databaseSizeMB: dbSize[0]?.totalSizeMB ?? 0,
    logUsedPercent: 0,
    lastBackup: null,
    pleSeconds: counters[0]?.pleSeconds ?? 0,
    batchRequestsSec: counters[0]?.batchRequestsSec ?? 0,
    uptime: uptime[0]?.uptime ?? 'N/A',
  };
}

export async function GET(request: NextRequest) {
  const servers = parseServerParam(request.nextUrl.searchParams.get('server'));
  const results = await Promise.allSettled(servers.map((s) => getOverview(s)));

  const data: OverviewData[] = [];
  const errors: { server: ServerKey; message: string }[] = [];

  results.forEach((r, i) => {
    if (r.status === 'fulfilled') data.push(r.value);
    else errors.push({ server: servers[i], message: r.reason?.message || 'Unknown error' });
  });

  const response: MonitorResponse<OverviewData> = {
    success: errors.length === 0,
    data,
    errors: errors.length > 0 ? errors : undefined,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response);
}
