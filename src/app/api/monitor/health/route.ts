import { NextRequest, NextResponse } from 'next/server';
import { queryServer, parseServerParam } from '@/lib/db';
import { DATABASE_SIZE_QUERY, BACKUP_INFO_QUERY, FILE_GROWTH_QUERY } from '@/lib/queries/health';
import type { ServerKey, MonitorResponse } from '@/lib/types';

export const dynamic = 'force-dynamic';

const SECTION_MAP: Record<string, string> = {
  size: DATABASE_SIZE_QUERY,
  backups: BACKUP_INFO_QUERY,
  files: FILE_GROWTH_QUERY,
};

export async function GET(request: NextRequest) {
  const servers = parseServerParam(request.nextUrl.searchParams.get('server'));
  const section = request.nextUrl.searchParams.get('section') || 'size';
  const query = SECTION_MAP[section] || DATABASE_SIZE_QUERY;

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
