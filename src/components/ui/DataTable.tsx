'use client';

import { cn } from '@/lib/utils';

export interface Column {
  key: string;
  header: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (row: any) => React.ReactNode;
  className?: string;
}

interface DataTableProps {
  columns: Column[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  emptyMessage?: string;
  maxHeight?: string;
}

export function DataTable({
  columns,
  data,
  emptyMessage = 'No data available',
  maxHeight = '400px',
}: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800">
      <div className="overflow-auto" style={{ maxHeight }}>
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-zinc-900 text-xs text-zinc-400">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn('px-3 py-2.5 text-left font-medium', col.className)}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-8 text-center text-zinc-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={i} className="hover:bg-zinc-800/30 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-3 py-2 text-zinc-300', col.className)}>
                      {col.render ? col.render(row) : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
