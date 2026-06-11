"use client";

import { Search } from "lucide-react";
import { AppLogo } from "@/components/layout/app-logo";
import { cn } from "@/lib/utils";

export type FeedTab = "forYou" | "following";

export function FeedTopBar({
  activeTab,
  onTabChange,
  onSearchOpen,
}: {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
  onSearchOpen: () => void;
}) {
  return (
    <header className="pointer-events-none absolute left-0 right-0 top-0 z-40 px-3 pt-safe">
      <div className="pointer-events-auto mx-auto grid max-w-[340px] grid-cols-[1fr_auto_1fr] items-center py-2">
        <AppLogo href="/" size="sm" />

        {/* Tabs */}
        <div className="flex items-center justify-center gap-0.5 rounded-full bg-zinc-900/90 p-0.5 backdrop-blur-md">
          <button
            type="button"
            onClick={() => onTabChange("forYou")}
            className={cn(
              "relative rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all active:scale-95",
              activeTab === "forYou"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            For You
            {activeTab === "forYou" && (
              <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-red-500" />
            )}
          </button>
          <button
            type="button"
            onClick={() => onTabChange("following")}
            className={cn(
              "rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all active:scale-95",
              activeTab === "following"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Following
          </button>
        </div>

        {/* Search */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onSearchOpen}
            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 transition-colors hover:text-white active:scale-95"
            aria-label="Search"
          >
            <Search className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
