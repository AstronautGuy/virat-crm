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
        "flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-3xl border border-gray-100 shadow-sm animate-in fade-in zoom-in-95 duration-500",
        className
      )}>
        <div className="p-4 bg-red-50 rounded-full mb-6">
          <ShieldAlert className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500 max-w-md mb-8">
          The <span className="font-bold text-gray-700 capitalize">'{featureKey.replace("-", " ")}'</span> module has been disabled for your role by the system administrator.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <Home className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
          >
            Check Again
          </button>
        </div>
        <div className="mt-12 flex items-center space-x-2 text-xs text-gray-400">
          <Lock className="w-3 h-3" />
          <span>Restricted by Virat Role-Based Access Control</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
