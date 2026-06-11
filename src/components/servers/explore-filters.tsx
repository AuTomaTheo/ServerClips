"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { SCHOOL_TYPES, GAMEPLAY_DIFFICULTIES } from "@/lib/constants";
import type { ServerSystemKey } from "@/lib/constants";
import { Search, X } from "lucide-react";
import { ServerFilterSelects, ServerSystemFilters } from "@/components/servers/server-filter-fields";
import { cn } from "@/lib/utils";

function FilterCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="app-card p-4">
      <h3 className="app-section-title mb-3">{title}</h3>
      {children}
    </div>
  );
}

export function ExploreFilters({
  layout = "horizontal",
}: {
  layout?: "horizontal" | "sidebar";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [systems, setSystems] = useState<ServerSystemKey[]>(
    (searchParams.get("systems")?.split(",").filter(Boolean) as ServerSystemKey[]) ?? []
  );

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      if (systems.length > 0) params.set("systems", systems.join(","));
      else params.delete("systems");
      startTransition(() => {
        router.push(`/explore?${params.toString()}`);
      });
    },
    [router, searchParams, systems]
  );

  const clearFilters = () => {
    setSystems([]);
    startTransition(() => router.push("/explore"));
  };

  const hasFilters = Array.from(searchParams.keys()).length > 0 || systems.length > 0;
  const activeSchool = searchParams.get("schoolType") ?? "";

  if (layout === "sidebar") {
    return (
      <div className="space-y-4">
        <FilterCard title="School Type">
          <nav className="space-y-0.5">
            <button
              onClick={() => updateParams({ schoolType: "" })}
              className={cn("app-nav-item", !activeSchool && "app-nav-item-active")}
            >
              All types
            </button>
            {SCHOOL_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => updateParams({ schoolType: type.value })}
                className={cn("app-nav-item", activeSchool === type.value && "app-nav-item-active")}
              >
                {type.label}
              </button>
            ))}
          </nav>
        </FilterCard>

        <FilterCard title="Difficulty">
          <nav className="space-y-0.5">
            {GAMEPLAY_DIFFICULTIES.map((type) => (
              <button
                key={type.value}
                onClick={() => updateParams({ gameplayDifficulty: type.value })}
                className={cn(
                  "app-nav-item",
                  searchParams.get("gameplayDifficulty") === type.value && "app-nav-item-active"
                )}
              >
                {type.label}
              </button>
            ))}
          </nav>
        </FilterCard>

        <FilterCard title="Filters">
          <ServerFilterSelects
            layout="stack"
            values={{
              schoolType: searchParams.get("schoolType") ?? undefined,
              gameplayDifficulty: searchParams.get("gameplayDifficulty") ?? undefined,
              originCountry: searchParams.get("originCountry") ?? undefined,
              mainLanguage: searchParams.get("mainLanguage") ?? undefined,
              maxLevel: searchParams.get("maxLevel") ?? undefined,
            }}
            onChange={(key, value) => updateParams({ [key]: value })}
          />
        </FilterCard>

        <FilterCard title="Systems">
          <ServerSystemFilters
            active={systems}
            onToggle={(key) => {
              const next = systems.includes(key)
                ? systems.filter((s) => s !== key)
                : [...systems, key];
              setSystems(next);
              const params = new URLSearchParams(searchParams.toString());
              if (next.length) params.set("systems", next.join(","));
              else params.delete("systems");
              startTransition(() => router.push(`/explore?${params.toString()}`));
            }}
          />
        </FilterCard>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            disabled={isPending}
            className="app-btn-secondary w-full text-sm"
          >
            <X className="h-4 w-4" />
            Clear filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="app-card p-4">
      <h3 className="app-section-title mb-3">Search & Filters</h3>
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            placeholder="Search servers..."
            className="app-input py-2 pl-10 pr-3"
            defaultValue={searchParams.get("q") ?? ""}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateParams({ q: (e.target as HTMLInputElement).value });
              }
            }}
          />
        </div>

        <ServerFilterSelects
          values={{
            schoolType: searchParams.get("schoolType") ?? undefined,
            gameplayDifficulty: searchParams.get("gameplayDifficulty") ?? undefined,
            originCountry: searchParams.get("originCountry") ?? undefined,
            mainLanguage: searchParams.get("mainLanguage") ?? undefined,
            maxLevel: searchParams.get("maxLevel") ?? undefined,
          }}
          onChange={(key, value) => updateParams({ [key]: value })}
        />

        <ServerSystemFilters
          active={systems}
          onToggle={(key) => {
            const next = systems.includes(key)
              ? systems.filter((s) => s !== key)
              : [...systems, key];
            setSystems(next);
            const params = new URLSearchParams(searchParams.toString());
            if (next.length) params.set("systems", next.join(","));
            else params.delete("systems");
            startTransition(() => router.push(`/explore?${params.toString()}`));
          }}
        />

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            disabled={isPending}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
          >
            <X className="h-4 w-4" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
