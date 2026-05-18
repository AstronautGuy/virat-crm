"use client";

import { DesktopSidebar } from "./DesktopSidebar";
import { MobileNav } from "./MobileNav";
import { useSyncManager } from "@/hooks/use-sync-manager";
import { useLocationBreadcrumbs } from "@/hooks/use-location-breadcrumbs";
import { RefreshCcw, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "../ErrorBoundary";
import { api } from "@/trpc/react";
import { SuspendedView } from "../dashboard/SuspendedView";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isSyncing, pendingCount } = useSyncManager();
  useLocationBreadcrumbs();

  const { error } = api.users.getMe.useQuery(undefined, {
    retry: false,
  });

  const isSystemLocked = error?.message?.includes("SYSTEM_LOCKED");

  if (isSystemLocked) {
    return <SuspendedView />;
  }

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
