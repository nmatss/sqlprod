import { NextRequest, NextResponse } from 'next/server';
import { queryServer, parseServerParam } from '@/lib/db';
import { BLOCKING_CHAINS_QUERY, LOCK_WAITS_QUERY } from '@/lib/queries/locks';
import type { ServerKey, MonitorResponse, BlockingChain, LockWait } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const servers = parseServerParam(request.nextUrl.searchParams.get('server'));
  const section = request.nextUrl.searchParams.get('section') || 'blocking';

  const query = section === 'waits' ? LOCK_WAITS_QUERY : BLOCKING_CHAINS_QUERY;

  const results = await Promise.allSettled(
    servers.map(async (s) => {
      const rows = await queryServer<BlockingChain | LockWait>(s, query);
      return rows.map((r) => ({ ...r, server: s }));
    }),
  );

  const data: (BlockingChain | LockWait)[] = [];
  const errors: { server: ServerKey; message: string }[] = [];

  results.forEach((r, i) => {
    if (r.status === 'fulfilled') data.push(...r.value);
    else errors.push({ server: servers[i], message: r.reason?.message || 'Unknown error' });
  });

  const response: MonitorResponse<BlockingChain | LockWait> = {
    success: errors.length === 0,
    data,
    errors: errors.length > 0 ? errors : undefined,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response);
}
