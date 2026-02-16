'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

interface RefreshContextType {
  refreshInterval: number;
  setRefreshInterval: (ms: number) => void;
  lastRefresh: number;
  triggerRefresh: () => void;
  paused: boolean;
  setPaused: (p: boolean) => void;
}

const RefreshContext = createContext<RefreshContextType>({
  refreshInterval: 30000,
  setRefreshInterval: () => {},
  lastRefresh: Date.now(),
  triggerRefresh: () => {},
  paused: false,
  setPaused: () => {},
});

export function RefreshProvider({ children }: { children: ReactNode }) {
  const [refreshInterval, setRefreshInterval] = useState(30000);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [paused, setPaused] = useState(false);

  const triggerRefresh = useCallback(() => {
    setLastRefresh(Date.now());
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(triggerRefresh, refreshInterval);
    return () => clearInterval(id);
  }, [refreshInterval, paused, triggerRefresh]);

  return (
    <RefreshContext.Provider
      value={{ refreshInterval, setRefreshInterval, lastRefresh, triggerRefresh, paused, setPaused }}
    >
      {children}
    </RefreshContext.Provider>
  );
}

export function useRefresh() {
  return useContext(RefreshContext);
}
