import { NextRequest, NextResponse } from 'next/server';
import { queryServer, parseServerParam } from '@/lib/db';
import { SESSIONS_QUERY, SESSION_SUMMARY_QUERY } from '@/lib/queries/sessions';
import type { ServerKey, MonitorResponse, SessionInfo, SessionSummary } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const servers = parseServerParam(request.nextUrl.searchParams.get('server'));
  const section = request.nextUrl.searchParams.get('section') || 'list';

  const query = section === 'summary' ? SESSION_SUMMARY_QUERY : SESSIONS_QUERY;

  const results = await Promise.allSettled(
    servers.map(async (s) => {
      const rows = await queryServer<SessionInfo | SessionSummary>(s, query);
      return rows.map((r) => ({ ...r, server: s }));
    }),
  );

  const data: (SessionInfo | SessionSummary)[] = [];
  const errors: { server: ServerKey; message: string }[] = [];

  results.forEach((r, i) => {
    if (r.status === 'fulfilled') data.push(...r.value);
    else errors.push({ server: servers[i], message: r.reason?.message || 'Unknown error' });
  });

  const response: MonitorResponse<SessionInfo | SessionSummary> = {
    success: errors.length === 0,
    data,
    errors: errors.length > 0 ? errors : undefined,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response);
}
