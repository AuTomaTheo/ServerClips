"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { X, Search, Compass } from "lucide-react";
import { LANGUAGES, REGIONS } from "@/lib/constants";
import type { FeedFilters, FeedItem } from "@/types/feed";
import { cn } from "@/lib/utils";
import { Metin2Button } from "@/components/metin2/metin2-button";

const QUICK_FILTERS = [
  { key: "serverType", value: "OLDSCHOOL", label: "Oldschool" },
  { key: "serverType", value: "MIDDLESCHOOL", label: "Middleschool" },
  { key: "serverType", value: "NEWSCHOOL", label: "Newschool" },
  { key: "serverType", value: "PVP", label: "PvP" },
  { key: "serverType", value: "PVM", label: "PvM" },
  { key: "international", value: "true", label: "International" },
  { key: "launchingSoon", value: "true", label: "Launching soon" },
  { key: "recentlyAdded", value: "true", label: "Recently added" },
  { key: "verifiedOnly", value: "true", label: "Verified only" },
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
    const qs = buildQuery({ ...f, q });
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
      if (key === "international" || key === "launchingSoon" || key === "recentlyAdded" || key === "verifiedOnly") {
        const k = key as keyof FeedFilters;
        (next as Record<string, unknown>)[k] = !(prev as Record<string, unknown>)[k];
      } else if (key === "serverType") {
        next.serverType = prev.serverType === value ? undefined : value;
      }
      return next;
    });
  }

  function isQuickActive(key: string, value: string): boolean {
    if (key === "international" || key === "launchingSoon" || key === "recentlyAdded" || key === "verifiedOnly") {
      return !!(filters as Record<string, boolean>)[key];
    }
    return filters.serverType === value;
  }

  function applyToFeed() {
    onApplyFilters({ ...filters, q: query || undefined });
    onClose();
  }

  if (!open) return null;

  return (
    <div className="metin2-overlay-bg fixed inset-0 z-[70] flex flex-col">
      <div className="flex items-center gap-3 border-b border-[#5c3d1e] px-4 py-3 pt-safe">
        <button onClick={onClose} className="rounded p-2 text-metin2-parchment hover:bg-[#3d2814]">
          <X className="h-5 w-5" />
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b5a40]" />
          <input
            autoFocus
            placeholder="Search servers, tags, types..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="metin2-input w-full py-2 pl-10 pr-3"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-[#5c3d1e] px-4 py-3">
        {QUICK_FILTERS.map((f) => (
          <button
            key={`${f.key}-${f.value}`}
            onClick={() => toggleQuickFilter(f.key, f.value)}
            className={cn(
              "rounded border px-3 py-1.5 text-xs font-medium transition-colors",
              isQuickActive(f.key, f.value)
                ? "metin2-feed-badge"
                : "metin2-feed-badge-muted"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 border-b border-[#5c3d1e] px-4 py-3">
        <select
          value={filters.region ?? ""}
          onChange={(e) =>
            setFilters((p) => ({ ...p, region: e.target.value || undefined }))
          }
          className="metin2-input flex-1 px-3 py-2 text-sm"
        >
          <option value="">All regions</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select
          value={filters.language ?? ""}
          onChange={(e) =>
            setFilters((p) => ({ ...p, language: e.target.value || undefined }))
          }
          className="metin2-input flex-1 px-3 py-2 text-sm"
        >
          <option value="">All languages</option>
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isPending ? (
          <p className="text-center text-sm text-metin2-parchment/60">Searching...</p>
        ) : results.length === 0 ? (
          <p className="text-center text-sm text-metin2-parchment/60">No results found</p>
        ) : (
          <div className="space-y-2">
            {results.map((item) => (
              <Link
                key={item.id}
                href={item.server ? `/server/${item.server.slug}` : item.creator.username ? `/u/${item.creator.username}` : "/"}
                onClick={onClose}
                className="metin2-card flex items-center gap-3 rounded p-3 hover:border-metin2-gold"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-metin2-gold">{item.title}</p>
                  <p className="truncate text-xs text-metin2-parchment/60">
                    {item.server
                      ? `${item.server.name} · ${item.server.serverType} · EXP ${item.server.expRate}`
                      : `@${item.creator.username ?? "creator"}`}
                  </p>
                  {item.server && item.server.tags.length > 0 && (
                    <p className="metin2-feed-tag mt-1 text-xs">
                      {item.server.tags.slice(0, 3).map((t) => `#${t}`).join(" ")}
                    </p>
                  )}
                </div>
                <span className="text-xs text-metin2-parchment/50">{item.metrics.likes} likes</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 border-t border-[#5c3d1e] p-4">
        <Metin2Button onClick={applyToFeed} className="flex-1 justify-center py-3">
          Apply to feed
        </Metin2Button>
        <Metin2Button
          href={`/explore?${buildQuery({ ...filters, q: query })}`}
          variant="ghost"
          className="gap-2 py-3"
          onClick={onClose}
        >
          <Compass className="h-4 w-4" />
          Explore
        </Metin2Button>
      </div>
    </div>
  );
}
