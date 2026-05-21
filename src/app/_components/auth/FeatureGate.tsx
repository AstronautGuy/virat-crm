"use client";

import { api } from "@/trpc/react";
import { ShieldAlert, Lock, Home } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface FeatureGateProps {
  featureKey: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export function FeatureGate({
  featureKey,
  children,
  fallback,
  className,
}: FeatureGateProps) {
  const { data: user, isLoading: userLoading } = api.users.getMe.useQuery();
  const { data: rolePermissions, isLoading: permissionsLoading } =
    api.permissions.getForRole.useQuery(
      { role: user?.role ?? "Employee" },
      { enabled: !!user?.role },
    );

  const isLoading = userLoading || permissionsLoading;

  // Admins bypass all gates
  if (user?.role === "Admin") return <>{children}</>;

  const permission = rolePermissions?.find((p) => p.featureKey === featureKey);
  const isEnabled = permission ? permission.isEnabled : false;

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] animate-pulse flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-gray-100" />
        <div className="h-4 w-48 rounded bg-gray-100" />
      </div>
    );
  }

  if (!isEnabled) {
    if (fallback) return <>{fallback}</>;

    return (
      <div
        className={cn(
          "animate-in fade-in zoom-in-95 flex min-h-[70vh] flex-col items-center justify-center rounded-[2.5rem] border border-gray-100 bg-gradient-to-b from-white to-gray-50/50 p-8 text-center shadow-xl shadow-gray-200/20 duration-700",
          className,
        )}
      >
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-pulse rounded-full bg-red-200 opacity-20 blur-2xl" />
          <div className="relative rounded-3xl border border-red-100/50 bg-red-50 p-6 shadow-inner">
            <ShieldAlert className="h-16 w-16 text-red-500" />
          </div>
        </div>

        <div className="mb-4 inline-flex items-center space-x-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[10px] font-bold tracking-wider text-red-600 uppercase">
          <Lock className="h-3 w-3" />
          <span>Administrator Only</span>
        </div>

        <h2 className="mb-3 text-4xl font-extrabold tracking-tight text-gray-900">
          Access Restricted
        </h2>

        <p className="mb-10 max-w-md text-lg leading-relaxed text-gray-500">
          The{" "}
          <span className="font-semibold text-gray-900 italic">
            &quot;{featureKey.replace("-", " ")}&quot;
          </span>{" "}
          module is currently restricted for your access level. Please contact
          your system administrator to request access.
        </p>

        <div className="flex flex-col gap-5 sm:flex-row">
          <Link
            href="/"
            className="group flex items-center justify-center space-x-3 rounded-2xl bg-gray-900 px-8 py-4 font-bold text-white shadow-lg shadow-gray-200 transition-all hover:bg-black active:scale-95"
          >
            <Home className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
            <span>Return Dashboard</span>
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="rounded-2xl border border-gray-200 bg-white px-8 py-4 font-bold text-gray-700 transition-all hover:bg-gray-50 active:scale-95"
          >
            Refresh Status
          </button>
        </div>

        <div className="mt-16 w-full max-w-xs border-t border-gray-100 pt-8">
          <p className="text-[10px] font-medium tracking-[0.2em] text-gray-400 uppercase">
            Virat Security Protocol &bull; RBAC v4.0
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
