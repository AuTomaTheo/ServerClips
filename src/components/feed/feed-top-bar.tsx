"use client";

import { Search } from "lucide-react";

export function FeedTopBar({ onSearchOpen }: { onSearchOpen: () => void }) {
  return (
    <header className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-3 py-2 pt-safe">
      <span className="font-display text-sm font-bold tracking-wide text-metin2-gold drop-shadow-lg">
        ServerClips
      </span>
      <button
        onClick={onSearchOpen}
        className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </button>
    </header>
  );
}
