"use client";

import React from "react";
import { PageWrapper } from "../layout/PageWrapper";
import { 
  AlertCircle, 
  ArrowRight,
  ShoppingBag,
  Users,
  FileText,
  User,
  MapPin,
  BarChart3,
  Network,
  ShieldCheck,
  Contact,
  Download,
  Upload,
  Sliders,
  Wallet
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { api } from "@/trpc/react";

interface Metric {
  label: string;
  value: string;
  trend: string;
}

interface UserInfo {
  firstName: string;
  lastName?: string | null;
  role: string;
  branchId?: number | null;
}

interface DashboardViewProps {
  user: UserInfo | null;
  metrics: Metric[];
  isManager: boolean;
  isLoading?: boolean;
}

import { FeatureGate } from "../auth/FeatureGate";

export function DashboardView({
  user,
  metrics,
  isManager,
  isLoading,
}: DashboardViewProps) {
  const { data: lowStockItems = [] } =
    api.inventory.getLowStockItems.useQuery();

  const { data: rolePermissions, isLoading: permissionsLoading } =
    api.permissions.getForRole.useQuery(
      { role: user?.role ?? "Employee" },
      { enabled: !!user?.role },
    );

  const getIsFeatureEnabled = (key: string) => {
    if (permissionsLoading) return true; // Show while loading
    if (user?.role === "Developer") return true;
    
    // Developer disabled features (if any property exists for it in the future)
    // if (user?.disabledFeaturesGlobal?.includes(key)) return false;

    const p = rolePermissions?.find((p) => p.featureKey === key);
    if (p) return p.isEnabled;
    return user?.role === "Admin"; // Admins get everything by default
  };

  const isAdmin = user?.role === "Admin";

  const links = [
    {
      href: "/sales",
      label: "Sales Register",
      icon: ShoppingBag,
      hidden: !getIsFeatureEnabled("sales"),
      color: "bg-blue-50 text-blue-600",
      borderColor: "border-blue-200"
    },
    {
      href: "/inventory",
      label: "Inventory",
      icon: FileText,
      hidden: !getIsFeatureEnabled("inventory"),
      color: "bg-indigo-50 text-indigo-600",
      borderColor: "border-indigo-200"
    },
    {
      href: "/crm",
      label: "Customer Master",
      icon: Contact,
      hidden: !getIsFeatureEnabled("crm"),
      color: "bg-purple-50 text-purple-600",
      borderColor: "border-purple-200"
    },
    {
      href: "/reports",
      label: "Daily Reports",
      icon: FileText,
      hidden: !getIsFeatureEnabled("reports"),
      color: "bg-emerald-50 text-emerald-600",
      borderColor: "border-emerald-200"
    },
    {
      href: "/reports/mileage",
      label: "Mileage",
      icon: MapPin,
      hidden: !getIsFeatureEnabled("reports"),
      color: "bg-teal-50 text-teal-600",
      borderColor: "border-teal-200"
    },
    {
      href: "/reports/advance-register",
      label: "Advance",
      icon: Wallet,
      hidden: !getIsFeatureEnabled("reports"),
      color: "bg-orange-50 text-orange-600",
      borderColor: "border-orange-200"
    },
    {
      href: "/reports/replacement-register",
      label: "Replacements",
      icon: FileText,
      hidden: !getIsFeatureEnabled("reports"),
      color: "bg-rose-50 text-rose-600",
      borderColor: "border-rose-200"
    },
    {
      href: "/attendance",
      label: "Workforce",
      icon: Users,
      hidden: !getIsFeatureEnabled("attendance"),
      color: "bg-cyan-50 text-cyan-600",
      borderColor: "border-cyan-200"
    },
    {
      href: "/admin/live-map",
      label: "Live Map",
      icon: MapPin,
      hidden: !getIsFeatureEnabled("live-map") && !isAdmin,
      color: "bg-slate-100 text-slate-700",
      borderColor: "border-slate-300"
    },
    {
      href: "/admin/reports",
      label: "Analytics",
      icon: BarChart3,
      hidden: !getIsFeatureEnabled("admin-reports") && !isAdmin,
      color: "bg-slate-100 text-slate-700",
      borderColor: "border-slate-300"
    },
    {
      href: "/admin/org-chart",
      label: "Org Chart",
      icon: Network,
      hidden: !getIsFeatureEnabled("org-chart") && !isAdmin,
      color: "bg-slate-100 text-slate-700",
      borderColor: "border-slate-300"
    },
    {
      href: "/admin/feature-access",
      label: "Access Control",
      icon: ShieldCheck,
      hidden: !isAdmin,
      color: "bg-red-50 text-red-600",
      borderColor: "border-red-200"
    },
    {
      href: "/admin/users",
      label: "Users",
      icon: Users,
      hidden: !isAdmin,
      color: "bg-slate-100 text-slate-700",
      borderColor: "border-slate-300"
    },
    {
      href: "/admin/exports",
      label: "Exports",
      icon: Download,
      hidden: !isAdmin,
      color: "bg-slate-100 text-slate-700",
      borderColor: "border-slate-300"
    },
    {
      href: "/admin/imports",
      label: "Imports",
      icon: Upload,
      hidden: !isAdmin,
      color: "bg-slate-100 text-slate-700",
      borderColor: "border-slate-300"
    },
    {
      href: "/admin/developer",
      label: "Dev Console",
      icon: Sliders,
      hidden: user?.role !== "Developer",
      color: "bg-zinc-800 text-zinc-100",
      borderColor: "border-zinc-700"
    },
    { 
      href: "/profile", 
      label: "My Profile", 
      icon: User,
      hidden: false,
      color: "bg-pink-50 text-pink-600",
      borderColor: "border-pink-200"
    },
  ];

  return (
    <PageWrapper isLoading={isLoading}>
      <FeatureGate featureKey="dashboard">
        <div className="flex flex-col space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="mt-1 text-slate-500">
              Welcome back,{" "}
              <span className="font-semibold text-slate-700">
                {user?.firstName}
              </span>
              .
              {isManager
                ? " Here's your business at a glance."
                : " Have a productive day!"}
            </p>
          </div>

          {/* Real-time Premium Low Stock Alert Banner */}
          {lowStockItems.length > 0 && (
            <div className="animate-in fade-in slide-in-from-top-4 relative overflow-hidden rounded-2xl border border-amber-200/60 bg-amber-50/50 p-5 shadow-sm transition-all duration-300 hover:shadow-md dark:bg-amber-950/10">
              {/* Background Glow */}
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-amber-400/10 blur-2xl" />

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-500">
                    <AlertCircle className="h-5.5 w-5.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-400">
                      Attention: Low Stock Warning
                    </h4>
                    <p className="mt-0.5 text-xs leading-relaxed text-amber-700/85 dark:text-amber-500/90">
                      {lowStockItems.length}{" "}
                      {lowStockItems.length === 1
                        ? "product is"
                        : "products are"}{" "}
                      running below minimum stock limits. Please review and
                      restock immediately.
                    </p>
                  </div>
                </div>
                <Link href="/inventory" className="shrink-0">
                  <button className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-500/10 px-4.5 py-2 text-xs font-bold text-amber-700 transition-all duration-300 hover:bg-amber-500/20 hover:text-amber-900 dark:text-amber-400">
                    Manage Inventory
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </Link>
              </div>
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <Card
                key={metric.label}
                className="rounded-xl border-none p-0 shadow-sm transition-transform duration-300"
              >
                <CardContent className="p-6">
                  <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                    {metric.label}
                  </p>
                  <div className="mt-3 flex items-end justify-between">
                    <p className="text-3xl font-bold text-slate-900">
                      {metric.value}
                    </p>
                    <span className="bg-primary/10 text-primary rounded-lg px-2.5 py-1 text-[11px] font-bold">
                      {metric.trend}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Feature Navigation Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {links
              .filter((l) => !l.hidden)
              .map((link) => {
                const Icon = link.icon;
                return (
                  <Link href={link.href} key={link.href}>
                    <Card className={`group flex h-36 flex-col items-center justify-center gap-3 rounded-2xl border-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-md active:scale-95 ${link.borderColor} bg-white shadow-sm`}>
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${link.color}`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <span className="text-center text-sm font-bold tracking-tight text-slate-700 group-hover:text-slate-900 px-2 line-clamp-1">
                        {link.label}
                      </span>
                    </Card>
                  </Link>
                );
              })}
          </div>
        </div>
      </FeatureGate>
    </PageWrapper>
  );
}
