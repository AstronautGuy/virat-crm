"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Users, FileText, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/sales", label: "Sales", icon: ShoppingBag },
    { href: "/attendance", label: "Staff", icon: Users },
    { href: "/documents", label: "Docs", icon: FileText },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-gray-100 bg-white/80 backdrop-blur-md px-2 pb-safe md:hidden">
      {links.map((link) => {
        const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors",
              isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Icon className={cn("h-5 w-5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
            <span className="text-[10px] font-medium leading-none">{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
