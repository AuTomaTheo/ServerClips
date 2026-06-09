"use client";

import { useCallback, useState, useTransition } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { FeedFilters, FeedItem } from "@/types/feed";
import { LANGUAGES, REGIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Metin2Button } from "@/components/metin2/metin2-button";

const QUICK_FILTERS = [
  { key: "serverType", value: "OLDSCHOOL", label: "Oldschool" },
  { key: "serverType", value: "PVP", label: "PvP" },
  { key: "verifiedOnly", value: "true", label: "Verified" },
  { key: "launchingSoon", value: "true", label: "Launching soon" },
] as const;

function buildQuery(filters: FeedFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.serverType) params.set("serverType", filters.serverType);
  if (filters.language) params.set("language", filters.language);
  if (filters.region) params.set("region", filters.region);
  if (filters.international) params.set("international", "true");
  if (filters.launchingSoon) params.set("launchingSoon", "true");
  if (filters.recentlyAdded) params.set("recentlyAdded", "true");
  if (filters.verifiedOnly) params.set("verifiedOnly", "true");
  return params.toString();
}

export function SearchPageClient({ initialItems }: { initialItems: FeedItem[] }) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FeedFilters>({});
  const [results, setResults] = useState<FeedItem[]>(initialItems);
  const [isPending, startTransition] = useTransition();

  const search = useCallback((q: string, f: FeedFilters) => {
    const qs = buildQuery({ ...f, q });
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
      } else if (key === "serverType") {
        next.serverType = prev.serverType === value ? undefined : value;
      }
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 font-display text-2xl font-bold text-metin2-gold">Search</h1>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b5a40]" />
        <input
          placeholder="Search servers, tags, creators..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch()}
          className="metin2-input w-full py-2 pl-10 pr-3"
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {QUICK_FILTERS.map((f) => (
          <button
            key={`${f.key}-${f.value}`}
            onClick={() => toggleQuickFilter(f.key, f.value)}
            className={cn(
              "rounded border px-3 py-1.5 text-xs font-medium",
              (f.key === "serverType" ? filters.serverType === f.value : !!(filters as Record<string, boolean>)[f.key])
                ? "metin2-feed-badge"
                : "metin2-feed-badge-muted"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mb-6 flex gap-2">
        <select
          value={filters.region ?? ""}
          onChange={(e) => setFilters((p) => ({ ...p, region: e.target.value || undefined }))}
          className="metin2-input flex-1 px-3 py-2 text-sm"
        >
          <option value="">All regions</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select
          value={filters.language ?? ""}
          onChange={(e) => setFilters((p) => ({ ...p, language: e.target.value || undefined }))}
          className="metin2-input flex-1 px-3 py-2 text-sm"
        >
          <option value="">All languages</option>
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <Metin2Button onClick={runSearch} className="shrink-0">
          Search
        </Metin2Button>
      </div>

      {isPending ? (
        <p className="text-center text-sm text-metin2-parchment/60">Searching...</p>
      ) : results.length === 0 ? (
        <p className="text-center text-sm text-metin2-parchment/60">No results found</p>
      ) : (
        <div className="space-y-2">
          {results.map((item) => (
            <Link
              key={item.id}
              href={item.server ? `/server/${item.server.slug}` : "/"}
              className="metin2-card flex items-center gap-3 rounded p-3 hover:border-metin2-gold"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-metin2-gold">{item.title}</p>
                <p className="truncate text-xs text-metin2-parchment/60">
                  {item.server
                    ? `${item.server.name}${item.server.verified ? " · Verified" : ""} · ${item.server.serverType}`
                    : `@${item.creator.username ?? "creator"}`}
                </p>
              </div>
              <span className="text-xs text-metin2-parchment/50">{item.metrics.likes} likes</span>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Metin2Button href="/" variant="ghost">← Back to feed</Metin2Button>
      </div>
    </div>
  );
}
