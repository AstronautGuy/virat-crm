"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ShoppingBag,
  Users,
  FileText,
  User,
  MapPin,
  Contact,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

export function MobileNav() {
  const pathname = usePathname();
  const { data: user, isLoading: userLoading } = api.users.getMe.useQuery();
  const { data: rolePermissions, isLoading: permissionsLoading } =
    api.permissions.getForRole.useQuery(
      { role: user?.role ?? "Employee" },
      { enabled: !!user?.role },
    );

  const isManager =
    user?.role === "Manager" ||
    user?.role === "Admin" ||
    user?.role === "Developer";
  const isAdmin = user?.role === "Admin" || user?.role === "Developer";

  const getIsFeatureEnabled = (key: string) => {
    if (userLoading || permissionsLoading) return true;
    if (user?.role === "Developer") return true;
    if (user?.disabledFeaturesGlobal?.includes(key)) return false;

    const p = rolePermissions?.find((p) => p.featureKey === key);
    if (p) return p.isEnabled;
    return user?.role === "Admin";
  };

  const links = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      hidden: !getIsFeatureEnabled("dashboard"),
    },
    {
      href: "/sales",
      label: "Sales",
      icon: ShoppingBag,
      hidden: !getIsFeatureEnabled("sales"),
    },
    {
      href: "/crm",
      label: "CRM",
      icon: Contact,
      hidden: !getIsFeatureEnabled("crm"),
    },
    {
      href: "/reports",
      label: "Reports",
      icon: FileText,
      hidden: !getIsFeatureEnabled("reports"),
    },
    {
      href: "/attendance",
      label: "Staff",
      icon: Users,
      hidden: !getIsFeatureEnabled("workforce"),
    },
    {
      href: "/admin/live-map",
      label: "Live",
      icon: MapPin,
      hidden: !getIsFeatureEnabled("live-map") || !isManager,
    },
    {
      href: "/documents",
      label: "Docs",
      icon: FileText,
      hidden: !getIsFeatureEnabled("documents"),
    },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="border-border bg-card/80 pb-safe fixed right-0 bottom-0 left-0 z-50 flex h-16 items-center justify-around border-t px-2 shadow-[0_-1px_3px_0_rgb(0,0,0,0.02)] backdrop-blur-xl md:hidden">
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
              className={cn(
                "flex h-full w-full flex-col items-center justify-center gap-1 transition-all duration-300",
                isActive
                  ? "text-primary scale-105"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center rounded-full p-1.5 transition-colors duration-300",
                  isActive ? "bg-primary/10" : "",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "stroke-[2.5px]" : "stroke-[2px]",
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] leading-none font-bold tracking-tight transition-all duration-300",
                  isActive ? "opacity-100" : "opacity-70",
                )}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
    </div>
  );
}
