"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LANGUAGES, REGIONS, SERVER_TYPES } from "@/lib/constants";
import { Search, X } from "lucide-react";

export function ServerFilters() {
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
        router.push(`/?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const clearFilters = () => {
    startTransition(() => router.push("/"));
  };

  const hasFilters = Array.from(searchParams.keys()).length > 0;

  return (
    <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <Input
          placeholder="Search servers..."
          className="pl-10"
          defaultValue={searchParams.get("q") ?? ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateParams({ q: (e.target as HTMLInputElement).value });
            }
          }}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          defaultValue={searchParams.get("language") ?? ""}
          onChange={(e) => updateParams({ language: e.target.value })}
        >
          <option value="">All languages</option>
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </Select>

        <Select
          defaultValue={searchParams.get("serverType") ?? ""}
          onChange={(e) => updateParams({ serverType: e.target.value })}
        >
          <option value="">All types</option>
          {SERVER_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Select>

        <Select
          defaultValue={searchParams.get("region") ?? ""}
          onChange={(e) => updateParams({ region: e.target.value })}
        >
          <option value="">All regions</option>
          {REGIONS.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </Select>

        <Input
          placeholder="EXP rate (e.g. x50)"
          defaultValue={searchParams.get("expRate") ?? ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateParams({ expRate: (e.target as HTMLInputElement).value });
            }
          }}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          type="date"
          defaultValue={searchParams.get("launchAfter") ?? ""}
          onChange={(e) => updateParams({ launchAfter: e.target.value })}
          aria-label="Launch after"
        />
        <Input
          type="date"
          defaultValue={searchParams.get("launchBefore") ?? ""}
          onChange={(e) => updateParams({ launchBefore: e.target.value })}
          aria-label="Launch before"
        />
      </div>

      {hasFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          disabled={isPending}
        >
          <X className="h-4 w-4" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
