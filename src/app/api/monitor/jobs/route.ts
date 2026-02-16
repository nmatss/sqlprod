import { NextRequest, NextResponse } from 'next/server';
import { queryServer, parseServerParam } from '@/lib/db';
import { JOBS_LIST_QUERY, JOBS_HISTORY_QUERY } from '@/lib/queries/jobs';
import type { ServerKey, MonitorResponse, JobInfo, JobHistoryEntry } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const servers = parseServerParam(request.nextUrl.searchParams.get('server'));
  const section = request.nextUrl.searchParams.get('section') || 'list';

  const query = section === 'history' ? JOBS_HISTORY_QUERY : JOBS_LIST_QUERY;

  const results = await Promise.allSettled(
    servers.map(async (s) => {
      const rows = await queryServer<JobInfo | JobHistoryEntry>(s, query);
      return rows.map((r) => ({ ...r, server: s }));
    }),
  );

  const data: (JobInfo | JobHistoryEntry)[] = [];
  const errors: { server: ServerKey; message: string }[] = [];

  results.forEach((r, i) => {
    if (r.status === 'fulfilled') data.push(...r.value);
    else errors.push({ server: servers[i], message: r.reason?.message || 'Unknown error' });
  });

  const response: MonitorResponse<JobInfo | JobHistoryEntry> = {
    success: errors.length === 0,
    data,
    errors: errors.length > 0 ? errors : undefined,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response);
}
