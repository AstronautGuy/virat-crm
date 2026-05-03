"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Users, FileText, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function DesktopSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/sales", label: "Sales Register", icon: ShoppingBag },
    { href: "/attendance", label: "Workforce", icon: Users },
    { href: "/documents", label: "Documents", icon: FileText },
    { href: "/profile", label: "My Profile", icon: User },
  ];

  return (
    <div className="hidden w-64 border-r border-gray-100 bg-white md:block">
      <div className="flex h-16 items-center border-b border-gray-100 px-6">
        <h1 className="text-lg font-bold tracking-tight text-blue-600">Virat CRM</h1>
      </div>
      <div className="p-4">
        <nav className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className={cn("h-4.5 w-4.5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
