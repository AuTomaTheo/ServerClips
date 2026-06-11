"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOutToHome } from "@/lib/auth-client";
import { useEffect, useRef, useState } from "react";
import { Home, Compass, Plus, Bookmark, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const username = session?.user?.username;
  const profileHref = username ? `/u/${username}` : "/login";
  const savedHref = username ? `/u/${username}?tab=saved` : "/login";
  const uploadHref = session ? "/studio/videos/new" : "/login";

  useEffect(() => {
    if (!profileOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [profileOpen]);

  const NAV_ITEMS = [
    { href: "/", label: "Home", icon: Home, isUpload: false, isProfile: false },
    { href: "/explore", label: "Explore", icon: Compass, isUpload: false, isProfile: false },
    { href: uploadHref, label: "Upload", icon: Plus, isUpload: true, isProfile: false },
    { href: savedHref, label: "Saved", icon: Bookmark, isUpload: false, isProfile: false },
    { href: profileHref, label: "Profile", icon: User, isUpload: false, isProfile: true },
  ] as const;

  return (
    <nav className="pointer-events-none absolute bottom-0 left-0 right-0 z-30 px-3 pb-safe">
      <div className="pointer-events-auto mx-auto mb-2 flex max-w-[320px] items-end justify-around rounded-full border border-zinc-800/80 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-zinc-900/90 px-1.5 py-1 shadow-xl shadow-black/60 backdrop-blur-xl">
        {NAV_ITEMS.map(({ href, label, icon: Icon, isUpload, isProfile }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : href === "/explore"
                ? pathname === "/explore" || pathname.startsWith("/explore/")
                : href.startsWith("/u/") && username
                  ? pathname === `/u/${username}` || pathname.startsWith(`/u/${username}`)
                  : pathname === href || pathname.startsWith(`${href}/`);

          if (isUpload) {
            return (
              <Link
                key={label}
                href={href}
                className="flex flex-col items-center gap-0.5 px-1.5 active:scale-95"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 shadow-md shadow-red-900/40 transition-transform hover:bg-red-500">
                  <Plus className="h-4 w-4 text-white" strokeWidth={2.5} />
                </span>
                <span className="text-[9px] font-medium text-zinc-400">{label}</span>
              </Link>
            );
          }

          if (isProfile && username && status === "authenticated") {
            return (
              <div key={label} ref={profileRef} className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((open) => !open)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-2 py-0.5 transition-all active:scale-95",
                    active || profileOpen ? "text-red-500" : "text-zinc-500 hover:text-zinc-300"
                  )}
                  aria-label="Profile menu"
                  aria-expanded={profileOpen}
                >
                  <Icon className="h-4 w-4" strokeWidth={active || profileOpen ? 2.5 : 2} />
                  <span className="text-[9px] font-medium">{label}</span>
                </button>
                {profileOpen && (
                  <div className="absolute bottom-full left-1/2 z-50 mb-2 w-40 -translate-x-1/2 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-xl">
                    <Link
                      href={profileHref}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-white hover:bg-zinc-900"
                    >
                      <User className="h-4 w-4 text-zinc-400" />
                      View profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => signOutToHome()}
                      className="flex w-full items-center gap-2 border-t border-zinc-800 px-3 py-2.5 text-sm text-red-400 hover:bg-zinc-900"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={label}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-0.5 transition-all active:scale-95",
                active ? "text-red-500" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={active ? 2.5 : 2} />
              <span className="text-[9px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
