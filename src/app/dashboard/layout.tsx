import { ServerProvider } from '@/components/providers/ServerContext';
import { RefreshProvider } from '@/components/providers/RefreshContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ServerProvider>
      <RefreshProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-1 flex-col ml-56">
            <Topbar />
            <main className="flex-1 overflow-y-auto p-6">
              {children}
            </main>
          </div>
        </div>
      </RefreshProvider>
    </ServerProvider>
  );
}
