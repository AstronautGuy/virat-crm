import { DesktopSidebar } from "./DesktopSidebar";
import { useSyncManager } from "@/hooks/use-sync-manager";
import { RefreshCcw, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "../ErrorBoundary";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isSyncing, pendingCount } = useSyncManager();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <DesktopSidebar />
      <div className="flex w-full flex-col pb-16 md:pb-0">
        {(pendingCount > 0 || isSyncing) && (
          <div className={cn(
            "flex items-center justify-center gap-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white transition-colors",
            isSyncing ? "bg-blue-600" : "bg-orange-500"
          )}>
            {isSyncing ? (
              <>
                <RefreshCcw className="h-3 w-3 animate-spin" />
                Syncing {pendingCount} Items...
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                Offline: {pendingCount} Pending Sync
              </>
            )}
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
