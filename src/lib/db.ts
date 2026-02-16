import sql from 'mssql';
import type { ServerKey } from './types';

const configs: Record<ServerKey, sql.config> = {
  db01: {
    server: process.env.DB01_HOST!,
    database: process.env.DB01_DATABASE!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    port: parseInt(process.env.DB01_PORT || process.env.DB_PORT || '1433'),
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
    options: {
      encrypt: false,
      trustServerCertificate: true,
      requestTimeout: 30000,
    },
  },
  db02: {
    server: process.env.DB02_HOST!,
    database: process.env.DB02_DATABASE!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    port: parseInt(process.env.DB02_PORT || process.env.DB_PORT || '1433'),
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
    options: {
      encrypt: false,
      trustServerCertificate: true,
      requestTimeout: 30000,
    },
  },
};

const globalPools = globalThis as unknown as {
  __sqlPools?: Map<ServerKey, sql.ConnectionPool>;
};

if (!globalPools.__sqlPools) {
  globalPools.__sqlPools = new Map();
}

export async function getPool(server: ServerKey): Promise<sql.ConnectionPool> {
  const existing = globalPools.__sqlPools!.get(server);
  if (existing?.connected) {
    return existing;
  }

  if (existing) {
    try { await existing.close(); } catch { /* ignore */ }
    globalPools.__sqlPools!.delete(server);
  }

  const pool = new sql.ConnectionPool(configs[server]);
  await pool.connect();
  globalPools.__sqlPools!.set(server, pool);
  return pool;
}

export async function queryServer<T>(
  server: ServerKey,
  queryText: string,
): Promise<T[]> {
  const pool = await getPool(server);
  const result = await pool.request().query<T>(queryText);
  return result.recordset;
}

export function parseServerParam(param: string | null): ServerKey[] {
  if (param === 'db01') return ['db01'];
  if (param === 'db02') return ['db02'];
  return ['db01', 'db02'];
}
