'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { ServerKey } from '@/lib/types';

type ServerFilter = ServerKey | 'both';

interface ServerContextType {
  selectedServer: ServerFilter;
  setSelectedServer: (s: ServerFilter) => void;
  serverParam: string;
}

const ServerContext = createContext<ServerContextType>({
  selectedServer: 'both',
  setSelectedServer: () => {},
  serverParam: 'both',
});

export function ServerProvider({ children }: { children: ReactNode }) {
  const [selectedServer, setSelectedServer] = useState<ServerFilter>('both');

  return (
    <ServerContext.Provider
      value={{
        selectedServer,
        setSelectedServer,
        serverParam: selectedServer,
      }}
    >
      {children}
    </ServerContext.Provider>
  );
}

export function useServer() {
  return useContext(ServerContext);
}
