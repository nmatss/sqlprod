'use client';

import { useState, useEffect, useCallback } from 'react';
import { useServer } from '@/components/providers/ServerContext';
import { useRefresh } from '@/components/providers/RefreshContext';

interface UseMonitorDataOptions {
  endpoint: string;
  section?: string;
}

interface MonitorResult<T> {
  data: T[];
  errors: { server: string; message: string }[];
  loading: boolean;
  timestamp: string | null;
}

export function useMonitorData<T>({ endpoint, section }: UseMonitorDataOptions): MonitorResult<T> {
  const { serverParam } = useServer();
  const { lastRefresh } = useRefresh();
  const [data, setData] = useState<T[]>([]);
  const [errors, setErrors] = useState<{ server: string; message: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [timestamp, setTimestamp] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams({ server: serverParam });
      if (section) params.set('section', section);

      const res = await fetch(`/api/monitor/${endpoint}?${params}`);
      const json = await res.json();

      setData(json.data ?? []);
      setErrors(json.errors ?? []);
      setTimestamp(json.timestamp ?? null);
    } catch (err) {
      setErrors([{ server: 'client', message: (err as Error).message }]);
    } finally {
      setLoading(false);
    }
  }, [endpoint, section, serverParam]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData, lastRefresh]);

  return { data, errors, loading, timestamp };
}
