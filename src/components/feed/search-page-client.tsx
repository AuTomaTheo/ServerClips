"use client";

import { useCallback, useState, useTransition } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { FeedFilters, FeedItem } from "@/types/feed";
import type { ServerSystemKey } from "@/lib/constants";
import { GAMEPLAY_DIFFICULTIES, SCHOOL_TYPES } from "@/lib/constants";
import { buildFeedQuery } from "@/lib/feed-filters";
import { ServerFilterSelects, ServerSystemFilters } from "@/components/servers/server-filter-fields";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const QUICK_FILTERS = [
  { key: "schoolType", value: "OLDSCHOOL", label: "Oldschool" },
  { key: "gameplayDifficulty", value: "PVP", label: "PvP" },
  { key: "verifiedOnly", value: "true", label: "Verified" },
  { key: "launchingSoon", value: "true", label: "Launching soon" },
] as const;

export function SearchPageClient({ initialItems }: { initialItems: FeedItem[] }) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FeedFilters>({});
  const [results, setResults] = useState<FeedItem[]>(initialItems);
  const [isPending, startTransition] = useTransition();

  const search = useCallback((q: string, f: FeedFilters) => {
    const qs = buildFeedQuery({ ...f, q });
    startTransition(async () => {
      const res = await fetch(`/api/feed?${qs}&limit=30`);
      const data = await res.json();
      setResults(data.items ?? []);
    });
  }, []);

  function runSearch() {
    search(query, filters);
  }

  function toggleQuickFilter(key: string, value: string) {
    setFilters((prev) => {
      const next = { ...prev };
      if (key === "launchingSoon" || key === "verifiedOnly") {
        const k = key as keyof FeedFilters;
        (next as Record<string, unknown>)[k] = !(prev as Record<string, unknown>)[k];
      } else if (key === "schoolType" || key === "gameplayDifficulty") {
        const k = key as "schoolType" | "gameplayDifficulty";
        next[k] = prev[k] === value ? undefined : value;
      }
      return next;
    });
  }

  function schoolLabel(value: string) {
    return SCHOOL_TYPES.find((s) => s.value === value)?.label ?? value;
  }

  function difficultyLabel(value: string) {
    return GAMEPLAY_DIFFICULTIES.find((d) => d.value === value)?.label ?? value;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold text-white">Search Videos</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Results prioritize videos linked to matching servers.
      </p>

      <div className="app-card mb-6 space-y-4 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            placeholder="Search servers, creators, systems..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
            className="app-input py-2 pl-10 pr-3"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {QUICK_FILTERS.map((f) => (
            <button
              key={`${f.key}-${f.value}`}
              onClick={() => toggleQuickFilter(f.key, f.value)}
              className={cn(
                "app-filter-pill",
                (f.key === "schoolType"
                  ? filters.schoolType === f.value
                  : f.key === "gameplayDifficulty"
                    ? filters.gameplayDifficulty === f.value
                    : !!(filters as Record<string, boolean>)[f.key]) && "app-filter-pill-active"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

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

        <button type="button" onClick={runSearch} className={cn(buttonVariants())}>
          Search
        </button>
      </div>

      {isPending ? (
        <p className="text-center text-sm text-zinc-500">Searching...</p>
      ) : results.length === 0 ? (
        <p className="text-center text-sm text-zinc-500">No results found</p>
      ) : (
        <div className="space-y-2">
          {results.map((item) => (
            <Link
              key={item.id}
              href={item.server ? `/server/${item.server.slug}` : "/"}
              className="app-card flex items-center gap-3 p-3 transition-colors hover:border-zinc-700"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{item.title}</p>
                <p className="truncate text-xs text-zinc-500">
                  {item.server
                    ? `${item.server.name}${item.server.verified ? " · Verified" : ""} · ${schoolLabel(item.server.schoolType)} · ${difficultyLabel(item.server.gameplayDifficulty)}`
                    : `@${item.creator.username ?? "creator"}`}
                </p>
              </div>
              <span className="text-xs text-zinc-500">{item.metrics.likes} likes</span>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/" className={cn(buttonVariants({ variant: "ghost" }))}>
          ← Back to feed
        </Link>
      </div>
    </div>
  );
}
