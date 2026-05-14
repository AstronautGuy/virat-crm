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

export function FeatureGate({ featureKey, children, fallback, className }: FeatureGateProps) {
  const { data: user, isLoading: userLoading } = api.users.getMe.useQuery();
  const { data: rolePermissions, isLoading: permissionsLoading } = api.permissions.getForRole.useQuery(
    { role: user?.role ?? "Employee" },
    { enabled: !!user?.role }
  );

  const isLoading = userLoading || permissionsLoading;
  
  // Admins bypass all gates
  if (user?.role === "Admin") return <>{children}</>;

  const permission = rolePermissions?.find(p => p.featureKey === featureKey);
  const isEnabled = permission ? permission.isEnabled : false;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 animate-pulse">
        <div className="w-12 h-12 bg-gray-100 rounded-full" />
        <div className="h-4 w-48 bg-gray-100 rounded" />
      </div>
    );
  }

  if (!isEnabled) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className={cn(
        "flex flex-col items-center justify-center min-h-[70vh] text-center p-8 bg-gradient-to-b from-white to-gray-50/50 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 animate-in fade-in zoom-in-95 duration-700",
        className
      )}>
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-red-200 blur-2xl opacity-20 rounded-full animate-pulse" />
          <div className="relative p-6 bg-red-50 rounded-3xl border border-red-100/50 shadow-inner">
            <ShieldAlert className="w-16 h-16 text-red-500" />
          </div>
        </div>
        
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 border border-red-100">
          <Lock className="w-3 h-3" />
          <span>Administrator Only</span>
        </div>

        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">Access Restricted</h2>
        
        <p className="text-gray-500 max-w-md leading-relaxed mb-10 text-lg">
          The <span className="text-gray-900 font-semibold italic">&quot;{featureKey.replace("-", " ")}&quot;</span> module is currently restricted for your access level. Please contact your system administrator to request access.
        </p>

        <div className="flex flex-col sm:flex-row gap-5">
          <Link
            href="/"
            className="group flex items-center justify-center space-x-3 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200"
          >
            <Home className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
            <span>Return Dashboard</span>
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all active:scale-95"
          >
            Refresh Status
          </button>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-100 w-full max-w-xs">
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em]">
            Virat Security Protocol &bull; RBAC v4.0
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
