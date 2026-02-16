import { NextRequest, NextResponse } from 'next/server';
import { queryServer, parseServerParam } from '@/lib/db';
import {
  CPU_HISTORY_QUERY,
  WAIT_STATS_QUERY,
  IO_STATS_QUERY,
  MISSING_INDEXES_QUERY,
  PERFORMANCE_COUNTERS_QUERY,
} from '@/lib/queries/performance';
import type { ServerKey, MonitorResponse } from '@/lib/types';

export const dynamic = 'force-dynamic';

const SECTION_MAP: Record<string, string> = {
  cpu: CPU_HISTORY_QUERY,
  waits: WAIT_STATS_QUERY,
  io: IO_STATS_QUERY,
  indexes: MISSING_INDEXES_QUERY,
  counters: PERFORMANCE_COUNTERS_QUERY,
};

export async function GET(request: NextRequest) {
  const servers = parseServerParam(request.nextUrl.searchParams.get('server'));
  const section = request.nextUrl.searchParams.get('section') || 'cpu';
  const query = SECTION_MAP[section] || CPU_HISTORY_QUERY;

  const results = await Promise.allSettled(
    servers.map(async (s) => {
      const rows = await queryServer<Record<string, unknown>>(s, query);
      return rows.map((r) => ({ ...r, server: s }));
    }),
  );

  const data: Record<string, unknown>[] = [];
  const errors: { server: ServerKey; message: string }[] = [];

  results.forEach((r, i) => {
    if (r.status === 'fulfilled') data.push(...r.value);
    else errors.push({ server: servers[i], message: r.reason?.message || 'Unknown error' });
  });

  const response: MonitorResponse<Record<string, unknown>> = {
    success: errors.length === 0,
    data,
    errors: errors.length > 0 ? errors : undefined,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response);
}
