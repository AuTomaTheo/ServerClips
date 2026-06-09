"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { LANGUAGES, REGIONS, SERVER_TYPES } from "@/lib/constants";
import { Search, X } from "lucide-react";
import { Metin2Frame } from "@/components/metin2/metin2-frame";
import { Metin2Button } from "@/components/metin2/metin2-button";
import { cn } from "@/lib/utils";

export function ExploreFilters({
  layout = "horizontal",
}: {
  layout?: "horizontal" | "sidebar";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      startTransition(() => {
        router.push(`/explore?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const clearFilters = () => {
    startTransition(() => router.push("/explore"));
  };

  const hasFilters = Array.from(searchParams.keys()).length > 0;
  const activeType = searchParams.get("serverType") ?? "";

  if (layout === "sidebar") {
    return (
      <div className="space-y-4">
        <Metin2Frame title="Server Type" variant="wood">
          <nav className="space-y-0">
            <button
              onClick={() => updateParams({ serverType: "" })}
              className={cn("metin2-nav-item w-full rounded-t", !activeType && "metin2-nav-item-active")}
            >
              All types
            </button>
            {SERVER_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => updateParams({ serverType: type.value })}
                className={cn(
                  "metin2-nav-item w-full",
                  activeType === type.value && "metin2-nav-item-active"
                )}
              >
                {type.label}
              </button>
            ))}
          </nav>
        </Metin2Frame>

        <Metin2Frame title="Region" variant="wood">
          <select
            className="metin2-input w-full px-2 py-1.5 text-sm"
            defaultValue={searchParams.get("region") ?? ""}
            onChange={(e) => updateParams({ region: e.target.value })}
          >
            <option value="">All regions</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </Metin2Frame>

        <Metin2Frame title="Language" variant="wood">
          <select
            className="metin2-input w-full px-2 py-1.5 text-sm"
            defaultValue={searchParams.get("language") ?? ""}
            onChange={(e) => updateParams({ language: e.target.value })}
          >
            <option value="">All languages</option>
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </Metin2Frame>

        {hasFilters && (
          <Metin2Button variant="ghost" onClick={clearFilters} disabled={isPending} className="w-full">
            <X className="h-4 w-4" />
            Clear filters
          </Metin2Button>
        )}
      </div>
    );
  }

  return (
    <Metin2Frame title="Search & Filters">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-metin2-ink/50" />
          <input
            placeholder="Search servers..."
            className="metin2-input w-full py-2 pl-10 pr-3 text-sm"
            defaultValue={searchParams.get("q") ?? ""}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateParams({ q: (e.target as HTMLInputElement).value });
              }
            }}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <select
            className="metin2-input px-2 py-2 text-sm"
            defaultValue={searchParams.get("serverType") ?? ""}
            onChange={(e) => updateParams({ serverType: e.target.value })}
          >
            <option value="">All types</option>
            {SERVER_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          <select
            className="metin2-input px-2 py-2 text-sm"
            defaultValue={searchParams.get("region") ?? ""}
            onChange={(e) => updateParams({ region: e.target.value })}
          >
            <option value="">All regions</option>
            {REGIONS.map((region) => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <Metin2Button variant="ghost" onClick={clearFilters} disabled={isPending} className="text-sm">
            <X className="h-4 w-4" />
            Clear filters
          </Metin2Button>
        )}
      </div>
    </Metin2Frame>
  );
}
