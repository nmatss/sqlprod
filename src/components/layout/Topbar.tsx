'use client';

import { useState, useEffect } from 'react';
import { useServer } from '@/components/providers/ServerContext';
import { useRefresh } from '@/components/providers/RefreshContext';
import { cn } from '@/lib/utils';
import { RefreshCw, Pause, Play } from 'lucide-react';

type ServerFilter = 'db01' | 'db02' | 'both';

const serverOptions: { value: ServerFilter; label: string }[] = [
  { value: 'both', label: 'Both' },
  { value: 'db01', label: 'DB01' },
  { value: 'db02', label: 'DB02' },
];

function useFormattedTime(timestamp: number) {
  const [formatted, setFormatted] = useState('--:--:--');
  useEffect(() => {
    setFormatted(new Date(timestamp).toLocaleTimeString());
  }, [timestamp]);
  return formatted;
}

export function Topbar() {
  const { selectedServer, setSelectedServer } = useServer();
  const { triggerRefresh, paused, setPaused, lastRefresh } = useRefresh();

  const lastRefreshStr = useFormattedTime(lastRefresh);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-1">
        {serverOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSelectedServer(opt.value)}
            className={cn(
              'rounded-md px-3 py-1 text-xs font-medium transition-colors',
              selectedServer === opt.value
                ? 'bg-blue-500/20 text-blue-400'
                : 'text-zinc-400 hover:text-zinc-200',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[10px] text-zinc-500">
          Last: {lastRefreshStr}
        </span>
        <button
          onClick={() => setPaused(!paused)}
          className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
          title={paused ? 'Resume auto-refresh' : 'Pause auto-refresh'}
        >
          {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
        </button>
        <button
          onClick={triggerRefresh}
          className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
          title="Refresh now"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
}
