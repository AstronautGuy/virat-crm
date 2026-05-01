"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, RefreshCcw, User } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/sales", label: "Sales", icon: ShoppingCart },
    { href: "/replacements", label: "Returns", icon: RefreshCcw },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background px-2 pb-safe md:hidden">
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center space-y-1 w-full h-full ${
              isActive ? "text-primary font-medium" : "text-muted-foreground"
            }`}
          >
            <link.icon className="h-5 w-5" />
            <span className="text-[10px]">{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
