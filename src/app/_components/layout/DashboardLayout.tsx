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
import { usePathname } from "next/navigation";
import { NotificationBell } from "../notifications/NotificationBell";
import { AlertTriangle, X } from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isSyncing, pendingCount } = useSyncManager();
  const pathname = usePathname();
  useLocationBreadcrumbs();

  const { error } = api.users.getMe.useQuery(undefined, {
    retry: false,
  });

  const { data: notifications = [], refetch } = api.notifications.getMyNotifications.useQuery(undefined, {
    refetchInterval: 15000,
  });
  const markAsRead = api.notifications.markAsRead.useMutation({
    onSuccess: () => void refetch(),
  });

  const isSystemLocked = error?.message?.includes("SYSTEM_LOCKED");

  const unreadLowStockAlert = notifications.find(n => !n.isRead && n.title.includes("Low Stock"));

  if (isSystemLocked) {
    return <SuspendedView />;
  }

  const getPageTitle = (path: string) => {
    if (path === "/") return "Dashboard Overview";
    if (path.startsWith("/sales")) return "Sales Register";
    if (path.startsWith("/inventory")) return "Inventory & Stock";
    if (path.startsWith("/crm")) return "Customer Master";
    if (path.startsWith("/reports")) return "Daily Activity Reports";
    if (path.startsWith("/attendance")) return "Workforce Management";
    if (path.startsWith("/admin/live-map")) return "Live Field View";
    if (path.startsWith("/admin/reports")) return "Intelligence & Analytics";
    if (path.startsWith("/admin/org-chart")) return "Organization Structure";
    if (path.startsWith("/documents")) return "Document Repository";
    if (path.startsWith("/admin/feature-access"))
      return "Feature Access Control";
    if (path.startsWith("/admin/users")) return "User & Agent Management";
    if (path.startsWith("/admin/exports")) return "Bulk Data Export";
    if (path.startsWith("/admin/imports")) return "Bulk Data Import";
    if (path.startsWith("/admin/developer")) return "Developer Sandbox Console";
    if (path.startsWith("/profile")) return "User Profile Settings";
    return "Virat CRM Portal";
  };

  return (
    <div className="bg-background text-foreground flex min-h-screen">
      <DesktopSidebar />
      <div className="flex w-full flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom,12px))] md:pb-0">
        {(pendingCount > 0 || isSyncing) && (
          <div
            className={cn(
              "flex items-center justify-center gap-2 py-1.5 text-[10px] font-bold tracking-widest text-white uppercase transition-colors",
              isSyncing ? "bg-blue-600" : "bg-orange-500",
            )}
          >
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

        {unreadLowStockAlert && (
          <div className="bg-red-50 dark:bg-red-950/40 border-b border-red-100 dark:border-red-900 px-6 py-3 flex items-center justify-between shadow-sm z-50 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 dark:bg-red-900/50 p-1.5 rounded-full text-red-600 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-red-800 dark:text-red-200">
                  {unreadLowStockAlert.title}
                </span>
                <span className="text-xs text-red-600 dark:text-red-300">
                  {unreadLowStockAlert.message}
                </span>
              </div>
            </div>
            <button
              onClick={() => markAsRead.mutate({ notificationId: unreadLowStockAlert.id })}
              className="text-red-700 hover:text-red-800 dark:text-red-300 dark:hover:text-red-100 bg-red-100/50 hover:bg-red-200/50 dark:bg-red-900/30 dark:hover:bg-red-800/50 transition-colors px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              Dismiss
            </button>
          </div>
        )}

        {/* Premium Top Navigation Header */}
        <header className="border-border bg-card/65 sticky top-0 z-40 flex h-16 items-center justify-between border-b px-6 backdrop-blur-md md:px-8">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
              Portal
            </span>
            <h2 className="mt-0.5 text-sm font-bold tracking-tight text-slate-800 dark:text-slate-100">
              {getPageTitle(pathname)}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
