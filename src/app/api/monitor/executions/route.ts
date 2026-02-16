import { NextRequest, NextResponse } from 'next/server';
import { queryServer, parseServerParam } from '@/lib/db';
import { ACTIVE_QUERIES_QUERY, EXPENSIVE_QUERIES_QUERY } from '@/lib/queries/executions';
import type { ServerKey, MonitorResponse, ActiveQuery, ExpensiveQuery } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const servers = parseServerParam(request.nextUrl.searchParams.get('server'));
  const section = request.nextUrl.searchParams.get('section') || 'active';

  const query = section === 'expensive' ? EXPENSIVE_QUERIES_QUERY : ACTIVE_QUERIES_QUERY;

  const results = await Promise.allSettled(
    servers.map(async (s) => {
      const rows = await queryServer<ActiveQuery | ExpensiveQuery>(s, query);
      return rows.map((r) => ({ ...r, server: s }));
    }),
  );

  const data: (ActiveQuery | ExpensiveQuery)[] = [];
  const errors: { server: ServerKey; message: string }[] = [];

  results.forEach((r, i) => {
    if (r.status === 'fulfilled') data.push(...r.value);
    else errors.push({ server: servers[i], message: r.reason?.message || 'Unknown error' });
  });

  const response: MonitorResponse<ActiveQuery | ExpensiveQuery> = {
    success: errors.length === 0,
    data,
    errors: errors.length > 0 ? errors : undefined,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response);
}
