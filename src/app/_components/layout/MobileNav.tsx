"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Users, FileText, User, MapPin, Contact } from "lucide-react";

import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

export function MobileNav() {
  const pathname = usePathname();
  const { data: user } = api.users.getMe.useQuery();

  const isManager = user?.role === "Manager" || user?.role === "Admin";
  const isAdmin = user?.role === "Admin";
  
  const canViewMap = isManager || isAdmin || (process.env.NODE_ENV === "development");

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/sales", label: "Sales", icon: ShoppingBag },
    { href: "/crm", label: "CRM", icon: Contact },
    { href: "/reports", label: "Reports", icon: FileText },
    { href: "/attendance", label: "Staff", icon: Users },


    { 
      href: "/admin/live-map", 
      label: "Live", 
      icon: MapPin,
      hidden: !canViewMap
    },
    { href: "/documents", label: "Docs", icon: FileText },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border bg-card/80 backdrop-blur-xl px-2 pb-safe md:hidden shadow-[0_-1px_3px_0_rgb(0,0,0,0.02)]">
      {links.filter(l => !l.hidden).map((link) => {
        const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full h-full transition-all duration-300",
              isActive ? "text-primary scale-105" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn(
              "flex items-center justify-center rounded-full p-1.5 transition-colors duration-300",
              isActive ? "bg-primary/10" : ""
            )}>
              <Icon className={cn("h-5 w-5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
            </div>
            <span className={cn(
              "text-[10px] font-bold leading-none tracking-tight transition-all duration-300",
              isActive ? "opacity-100" : "opacity-70"
            )}>
              {link.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
