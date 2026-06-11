"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { X, Search, Compass } from "lucide-react";
import type { FeedFilters, FeedItem } from "@/types/feed";
import type { ServerSystemKey } from "@/lib/constants";
import { GAMEPLAY_DIFFICULTIES, SCHOOL_TYPES } from "@/lib/constants";
import { buildFeedQuery } from "@/lib/feed-filters";
import { ServerFilterSelects, ServerSystemFilters } from "@/components/servers/server-filter-fields";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const QUICK_FILTERS = [
  { key: "schoolType", value: "OLDSCHOOL", label: "Oldschool" },
  { key: "schoolType", value: "MIDDLESCHOOL", label: "Middleschool" },
  { key: "schoolType", value: "NEWSCHOOL", label: "Newschool" },
  { key: "gameplayDifficulty", value: "PVP", label: "PvP" },
  { key: "gameplayDifficulty", value: "FARM", label: "Farm" },
  { key: "international", value: "true", label: "International" },
  { key: "launchingSoon", value: "true", label: "Launching soon" },
  { key: "verifiedOnly", value: "true", label: "Verified only" },
] as const;

export function SearchOverlay({
  open,
  onClose,
  onApplyFilters,
  initialFilters,
}: {
  open: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FeedFilters) => void;
  initialFilters?: FeedFilters;
}) {
  const [query, setQuery] = useState(initialFilters?.q ?? "");
  const [filters, setFilters] = useState<FeedFilters>(initialFilters ?? {});
  const [results, setResults] = useState<FeedItem[]>([]);
  const [isPending, startTransition] = useTransition();

  const search = useCallback((q: string, f: FeedFilters) => {
    const qs = buildFeedQuery({ ...f, q });
    startTransition(async () => {
      const res = await fetch(`/api/feed?${qs}&limit=10`);
      const data = await res.json();
      setResults(data.items ?? []);
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => search(query, filters), 300);
    return () => clearTimeout(timer);
  }, [open, query, filters, search]);

  function toggleQuickFilter(key: string, value: string) {
    setFilters((prev) => {
      const next = { ...prev };
      if (key === "international" || key === "launchingSoon" || key === "verifiedOnly") {
        const k = key as keyof FeedFilters;
        (next as Record<string, unknown>)[k] = !(prev as Record<string, unknown>)[k];
      } else if (key === "schoolType" || key === "gameplayDifficulty") {
        const k = key as "schoolType" | "gameplayDifficulty";
        next[k] = prev[k] === value ? undefined : value;
      }
      return next;
    });
  }

  function isQuickActive(key: string, value: string): boolean {
    if (key === "international" || key === "launchingSoon" || key === "verifiedOnly") {
      return !!(filters as Record<string, boolean>)[key];
    }
    if (key === "schoolType") return filters.schoolType === value;
    if (key === "gameplayDifficulty") return filters.gameplayDifficulty === value;
    return false;
  }

  function trackSearchEvent() {
    const payload = { query: query || undefined, filters: { ...filters, q: query || undefined } };
    fetch("/api/search/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }

  function applyToFeed() {
    trackSearchEvent();
    onApplyFilters({ ...filters, q: query || undefined });
    onClose();
  }

  function schoolLabel(value: string) {
    return SCHOOL_TYPES.find((s) => s.value === value)?.label ?? value;
  }

  function difficultyLabel(value: string) {
    return GAMEPLAY_DIFFICULTIES.find((d) => d.value === value)?.label ?? value;
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-black/95 backdrop-blur-xl">
      <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3 pt-safe">
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            autoFocus
            placeholder="Search servers, creators, systems..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="app-input py-2 pl-10 pr-3"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-zinc-800 px-4 py-3">
        {QUICK_FILTERS.map((f) => (
          <button
            key={`${f.key}-${f.value}`}
            onClick={() => toggleQuickFilter(f.key, f.value)}
            className={cn(
              "app-filter-pill",
              isQuickActive(f.key, f.value) && "app-filter-pill-active"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3 border-b border-zinc-800 px-4 py-3">
        <ServerFilterSelects
          values={{
            schoolType: filters.schoolType,
            gameplayDifficulty: filters.gameplayDifficulty,
            originCountry: filters.originCountry,
            mainLanguage: filters.mainLanguage,
            maxLevel: filters.maxLevel?.toString(),
          }}
          onChange={(key, value) =>
            setFilters((p) => ({
              ...p,
              [key]: key === "maxLevel" ? (value ? parseInt(value, 10) : undefined) : value || undefined,
            }))
          }
        />
        <ServerSystemFilters
          active={filters.systems ?? []}
          onToggle={(key: ServerSystemKey) =>
            setFilters((p) => {
              const current = p.systems ?? [];
              return {
                ...p,
                systems: current.includes(key)
                  ? current.filter((s) => s !== key)
                  : [...current, key],
              };
            })
          }
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isPending ? (
          <p className="text-center text-sm text-zinc-500">Searching...</p>
        ) : results.length === 0 ? (
          <p className="text-center text-sm text-zinc-500">No results found</p>
        ) : (
          <div className="space-y-2">
            {results.map((item) => (
              <Link
                key={item.id}
                href={item.server ? `/server/${item.server.slug}` : item.creator.username ? `/u/${item.creator.username}` : "/"}
                onClick={onClose}
                className="app-card flex items-center gap-3 p-3 transition-colors hover:border-zinc-700"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{item.title}</p>
                  <p className="truncate text-xs text-zinc-500">
                    {item.server
                      ? `${item.server.name} · ${schoolLabel(item.server.schoolType)} · ${difficultyLabel(item.server.gameplayDifficulty)}`
                      : `@${item.creator.username ?? "creator"}`}
                  </p>
                </div>
                <span className="text-xs text-zinc-500">{item.metrics.likes} likes</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 border-t border-zinc-800 p-4 pb-safe">
        <button type="button" onClick={applyToFeed} className={cn(buttonVariants(), "flex-1 py-3")}>
          Apply to feed
        </button>
        <Link
          href={`/explore?${buildFeedQuery({ ...filters, q: query })}`}
          onClick={() => {
            trackSearchEvent();
            onClose();
          }}
          className={cn(buttonVariants({ variant: "secondary" }), "gap-2 py-3")}
        >
          <Compass className="h-4 w-4" />
          Explore
        </Link>
      </div>
    </div>
  );
}
