'use client';

import { AlertTriangle } from 'lucide-react';

interface ErrorAlertProps {
  errors: { server: string; message: string }[];
}

export function ErrorAlert({ errors }: ErrorAlertProps) {
  if (!errors || errors.length === 0) return null;

  return (
    <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3">
      <div className="flex items-center gap-2 text-red-400 text-sm font-medium mb-1">
        <AlertTriangle className="h-4 w-4" />
        Connection Errors
      </div>
      {errors.map((e, i) => (
        <p key={i} className="text-xs text-red-300/70 ml-6">
          <span className="font-medium">{e.server}:</span> {e.message}
        </p>
      ))}
    </div>
  );
}
