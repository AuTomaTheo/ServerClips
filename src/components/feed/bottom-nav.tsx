"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Clapperboard, Bookmark, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/studio", label: "Studio", icon: Clapperboard },
  { href: "/account?tab=saved", label: "Saved", icon: Bookmark },
  { href: "/account", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 pb-safe">
      <div className="pointer-events-auto mx-auto flex max-w-[480px] items-center justify-around border-t border-[#5c3d1e]/40 bg-black/70 px-2 py-2 backdrop-blur-md">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium transition-colors",
                active ? "text-metin2-gold" : "text-zinc-400 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
