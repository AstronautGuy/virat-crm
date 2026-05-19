"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check, Loader2, Info } from "lucide-react";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: notifications = [], refetch, isLoading } = api.notifications.getMyNotifications.useQuery(undefined, {
    refetchInterval: 15000, // Poll every 15 seconds for real-time feel
  });

  const markAsRead = api.notifications.markAsRead.useMutation({
    onSuccess: () => void refetch(),
  });

  const markAllAsRead = api.notifications.markAllAsRead.useMutation({
    onSuccess: () => void refetch(),
  });

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const unreadCount = unreadNotifications.length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative flex items-center justify-center h-10 w-10 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20",
          isOpen
            ? "bg-primary/10 text-primary shadow-inner"
            : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
        )}
      >
        <Bell
          className={cn(
            "h-5 w-5 transition-transform duration-500",
            unreadCount > 0 && "animate-wiggle"
          )}
        />

        {/* Glow & Badge */}
        {unreadCount > 0 && (
          <>
            <span className="absolute top-1.5 right-1.5 h-3.5 w-3.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900 flex items-center justify-center text-[8px] font-bold text-white shadow-lg animate-pulse" style={{ animationDuration: "1.5s" }}>
              {unreadCount}
            </span>
            <span className="absolute top-1.5 right-1.5 h-3.5 w-3.5 rounded-full bg-red-400 ring-2 ring-white dark:ring-slate-900 animate-ping opacity-75" style={{ animationDuration: "2s" }} />
          </>
        )}
      </button>

      {/* Styled Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shadow-2xl z-50 overflow-hidden transform origin-top-right transition-all duration-300 animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Notifications</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {unreadCount > 0 ? `${unreadCount} unread alerts` : "No unread alerts"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead.mutate()}
                disabled={markAllAsRead.isPending}
                className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                {markAllAsRead.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    Mark all read
                  </>
                )}
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40 no-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-xs font-medium mt-3">Fetching alerts...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 shadow-sm border border-slate-100 dark:border-slate-800/40">
                  <Bell className="h-6 w-6 stroke-[1.5]" />
                </div>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">All caught up!</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[240px] mt-1">
                  You have no notifications or low-stock alerts at this moment.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead.mutate({ notificationId: notification.id });
                    }
                  }}
                  className={cn(
                    "flex gap-3 px-5 py-4 cursor-pointer transition-all duration-200 hover:bg-slate-50/60 dark:hover:bg-slate-900/30",
                    !notification.isRead
                      ? "bg-slate-50/30 dark:bg-slate-900/10 font-medium"
                      : "opacity-75"
                  )}
                >
                  <div className="mt-0.5">
                    <div
                      className={cn(
                        "h-8 w-8 rounded-xl flex items-center justify-center border",
                        !notification.isRead
                          ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-600 dark:text-amber-500"
                          : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500"
                      )}
                    >
                      <Info className="h-4.5 w-4.5" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn("text-xs font-semibold truncate", !notification.isRead ? "text-slate-800 dark:text-slate-100" : "text-slate-600 dark:text-slate-400")}>
                        {notification.title}
                      </p>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 shrink-0 font-medium">
                        {new Date(notification.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className={cn("text-xs leading-relaxed mt-1 break-words", !notification.isRead ? "text-slate-600 dark:text-slate-300" : "text-slate-500 dark:text-slate-400")}>
                      {notification.message}
                    </p>
                  </div>

                  {!notification.isRead && (
                    <div className="flex items-center shrink-0">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
