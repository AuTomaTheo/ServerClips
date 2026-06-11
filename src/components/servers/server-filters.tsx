"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, X } from "lucide-react";
import { Metin2Frame } from "@/components/metin2/metin2-frame";
import { Metin2Button } from "@/components/metin2/metin2-button";
import { ServerFilterSelects, ServerSystemFilters } from "@/components/servers/server-filter-fields";
import type { ServerSystemKey } from "@/lib/constants";
import { useState } from "react";

export function ServerFilters() {
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

  return (
    <Metin2Frame title="Server Filters">
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
          <Metin2Button variant="ghost" onClick={clearFilters} disabled={isPending} className="text-sm">
            <X className="h-4 w-4" />
            Clear filters
          </Metin2Button>
        )}
      </div>
    </Metin2Frame>
  );
}
