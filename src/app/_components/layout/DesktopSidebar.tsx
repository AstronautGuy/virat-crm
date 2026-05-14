"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Users, FileText, User, MapPin, BarChart3, Network, ShieldCheck, Contact, Download, Upload } from "lucide-react";

import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

export function DesktopSidebar() {
  const pathname = usePathname();
  const { data: user, isLoading: userLoading } = api.users.getMe.useQuery();
  const { data: rolePermissions, isLoading: permissionsLoading } = api.permissions.getForRole.useQuery(
    { role: user?.role ?? "Employee" },
    { enabled: !!user?.role }
  );

  const isAdmin = user?.permissions.isAdmin;
  const isManager = user?.permissions.isManager;
  
  const getIsFeatureEnabled = (key: string) => {
    if (userLoading || permissionsLoading) return true; // Default to showing while loading to avoid flicker?
    const p = rolePermissions?.find(p => p.featureKey === key);
    if (p) return p.isEnabled;
    return user?.role === "Admin"; // Default for Admins
  };

  const links = [
    { href: "/", label: "Dashboard", icon: Home, hidden: !getIsFeatureEnabled("dashboard") },
    { href: "/sales", label: "Sales Register", icon: ShoppingBag, hidden: !getIsFeatureEnabled("sales") },
    { href: "/inventory", label: "Inventory", icon: FileText, hidden: !getIsFeatureEnabled("inventory") },
    { href: "/crm", label: "Customer Master", icon: Contact, hidden: !getIsFeatureEnabled("crm") },
    { href: "/reports", label: "Daily Reports", icon: FileText, hidden: !getIsFeatureEnabled("reports") },
    { href: "/attendance", label: "Workforce", icon: Users, hidden: !getIsFeatureEnabled("workforce") },


    { 
      href: "/admin/live-map", 
      label: "Live Field View", 
      icon: MapPin,
      hidden: !getIsFeatureEnabled("live-map") || !(isManager ?? isAdmin ?? false)
    },
    { 
      href: "/admin/reports", 
      label: "Intelligence Reports", 
      icon: BarChart3,
      hidden: !getIsFeatureEnabled("reports") || !(isManager ?? isAdmin ?? false)
    },
    { 
      href: "/admin/org-chart", 
      label: "Org Chart", 
      icon: Network,
      hidden: !getIsFeatureEnabled("org-chart") || !(isManager ?? isAdmin ?? false)
    },
    { href: "/documents", label: "Documents", icon: FileText, hidden: !getIsFeatureEnabled("documents") },
    { 
      href: "/admin/feature-access", 
      label: "Feature Access", 
      icon: ShieldCheck,
      hidden: !isAdmin 
    },
    { 
      href: "/admin/users", 
      label: "User Management", 
      icon: Users,
      hidden: !isAdmin 
    },
    { 
      href: "/admin/exports", 
      label: "Bulk Exports", 
      icon: Download,
      hidden: !isAdmin 
    },
    { 
      href: "/admin/imports", 
      label: "Bulk Imports", 
      icon: Upload,
      hidden: !isAdmin 
    },
    { href: "/profile", label: "My Profile", icon: User },
  ];

  return (
    <div className="hidden w-64 border-r border-border bg-card md:block">
      <div className="flex h-16 items-center border-b border-border px-6">
        <h1 className="text-xl font-bold tracking-tight text-primary">Virat CRM</h1>
      </div>
      <div className="p-4 no-scrollbar h-[calc(100vh-64px)] overflow-y-auto">
        <nav className="space-y-1">
          {links.filter(l => !l.hidden).map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center space-x-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-300",
                  isActive
                    ? "bg-primary/10 text-primary font-bold shadow-[0_1px_2px_rgba(37,99,235,0.05)]"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4.5 w-4.5 transition-transform duration-300", isActive ? "stroke-[2.5px] scale-110" : "stroke-[2px]")} />
                <span className="tracking-wide">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
