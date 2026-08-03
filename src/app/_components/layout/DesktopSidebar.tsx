"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
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
  RefreshCcw,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

export function DesktopSidebar({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: user, isLoading: userLoading } = api.users.getMe.useQuery();
  const { data: rolePermissions, isLoading: permissionsLoading } =
    api.permissions.getForRole.useQuery(
      { role: user?.role ?? "Employee" },
      { enabled: !!user?.role },
    );

  const isAdmin = user?.permissions.isAdmin;
  const isManager = user?.permissions.isManager;

  const getIsFeatureEnabled = (key: string) => {
    if (userLoading || permissionsLoading) return true; // Default to showing while loading to avoid flicker?

    // Developer role bypasses ALL feature locks
    if (user?.role === "Developer") return true;

    // Check if the feature is globally disabled by the Developer
    if (user?.disabledFeaturesGlobal?.includes(key)) return false;

    const p = rolePermissions?.find((p) => p.featureKey === key);
    if (p) return p.isEnabled;
    return user?.role === "Admin"; // Default for Admins
  };

  const links = [
    {
      href: "/",
      label: "Dashboard",
      icon: Home,
      hidden: !getIsFeatureEnabled("dashboard"),
    },
    {
      href: "/sales",
      label: "Sales Register",
      icon: ShoppingBag,
      hidden: !getIsFeatureEnabled("sales"),
    },
    {
      href: "/replacements",
      label: "Replacements",
      icon: RefreshCcw,
      hidden: !getIsFeatureEnabled("sales"),
    },
    {
      href: "/inventory",
      label: "Inventory",
      icon: FileText,
      hidden: !getIsFeatureEnabled("inventory"),
    },
    {
      href: "/crm",
      label: "Customer Master",
      icon: Contact,
      hidden: !getIsFeatureEnabled("crm"),
    },
    {
      href: "/reports",
      label: "Daily Reports",
      icon: FileText,
      hidden: !getIsFeatureEnabled("reports"),
    },
    {
      href: "/reports/mileage",
      label: "Mileage Reports",
      icon: FileText,
      hidden: !getIsFeatureEnabled("reports"),
    },
    {
      href: "/attendance",
      label: "Workforce",
      icon: Users,
      hidden: !getIsFeatureEnabled("workforce"),
    },

    {
      href: "/admin/live-map",
      label: "Live Field View",
      icon: MapPin,
      hidden:
        !getIsFeatureEnabled("live-map") || !(isManager ?? isAdmin ?? false),
    },
    {
      href: "/admin/reports",
      label: "Intelligence Reports",
      icon: BarChart3,
      hidden:
        !getIsFeatureEnabled("reports") || !(isManager ?? isAdmin ?? false),
    },
    {
      href: "/admin/org-chart",
      label: "Org Chart",
      icon: Network,
      hidden:
        !getIsFeatureEnabled("org-chart") || !(isManager ?? isAdmin ?? false),
    },
    {
      href: "/documents",
      label: "Documents",
      icon: FileText,
      hidden: !getIsFeatureEnabled("documents"),
    },
    {
      href: "/admin/feature-access",
      label: "Feature Access",
      icon: ShieldCheck,
      hidden: !isAdmin,
    },
    {
      href: "/admin/users",
      label: "User Management",
      icon: Users,
      hidden: !isAdmin,
    },
    {
      href: "/admin/exports",
      label: "Bulk Exports",
      icon: Download,
      hidden: !isAdmin,
    },
    {
      href: "/admin/imports",
      label: "Bulk Imports",
      icon: Upload,
      hidden: !isAdmin,
    },
    {
      href: "/admin/developer",
      label: "Developer Console",
      icon: Sliders,
      hidden: user?.role !== "Developer",
    },
    { href: "/profile", label: "My Profile", icon: User },
  ];

  return (
    <div
      className={cn(
        "border-border flex flex-col h-full transition-all duration-300 ease-in-out bg-green-50/40 dark:bg-green-950/20",
        !isMobile && "hidden border-r md:flex",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className={cn("border-border flex h-16 items-center border-b px-4", isCollapsed ? "justify-center" : "justify-between")}>
        {!isCollapsed && (
          <h1 className="text-primary text-xl font-bold tracking-tight">
            Virat CRM
          </h1>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-slate-200/50 rounded-lg text-slate-500 transition-colors"
        >
          {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>
      </div>
      <div className="no-scrollbar h-[calc(100vh-64px)] overflow-y-auto p-3">
        <nav className="space-y-1">
          {links
            .filter((l) => !l.hidden)
            .map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  title={isCollapsed ? link.label : undefined}
                  className={cn(
                    "flex items-center rounded-xl py-3 transition-all duration-300",
                    isCollapsed ? "justify-center px-2" : "px-4 space-x-3",
                    isActive
                      ? "bg-primary font-semibold text-white shadow-md"
                      : "text-slate-500 hover:bg-white/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4.5 w-4.5 transition-transform duration-300",
                      isActive ? "scale-110 stroke-[2.5px]" : "stroke-[2px]",
                      isCollapsed && "h-5 w-5"
                    )}
                  />
                  {!isCollapsed && <span className="tracking-wide text-sm">{link.label}</span>}
                </Link>
              );
            })}
        </nav>
      </div>
    </div>
  );
}
