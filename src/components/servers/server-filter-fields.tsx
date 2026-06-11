"use client";

import {
  GAMEPLAY_DIFFICULTIES,
  LANGUAGES,
  ORIGIN_COUNTRIES,
  SCHOOL_TYPES,
  SERVER_SYSTEMS,
} from "@/lib/constants";
import type { ServerSystemKey } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ServerFilterSelects({
  values,
  onChange,
  layout = "grid",
}: {
  values: Record<string, string | undefined>;
  onChange: (key: string, value: string) => void;
  layout?: "grid" | "stack";
}) {
  const className = layout === "grid" ? "grid gap-3 sm:grid-cols-2" : "space-y-3";

  return (
    <div className={className}>
      <select
        className="app-input px-2 py-2 text-sm"
        value={values.schoolType ?? ""}
        onChange={(e) => onChange("schoolType", e.target.value)}
      >
        <option value="">All school types</option>
        {SCHOOL_TYPES.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>

      <select
        className="app-input px-2 py-2 text-sm"
        value={values.gameplayDifficulty ?? ""}
        onChange={(e) => onChange("gameplayDifficulty", e.target.value)}
      >
        <option value="">All difficulties</option>
        {GAMEPLAY_DIFFICULTIES.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>

      <select
        className="app-input px-2 py-2 text-sm"
        value={values.originCountry ?? ""}
        onChange={(e) => onChange("originCountry", e.target.value)}
      >
        <option value="">All countries</option>
        {ORIGIN_COUNTRIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        className="app-input px-2 py-2 text-sm"
        value={values.mainLanguage ?? ""}
        onChange={(e) => onChange("mainLanguage", e.target.value)}
      >
        <option value="">All languages</option>
        {LANGUAGES.map((l) => (
          <option key={l} value={l}>{l}</option>
        ))}
      </select>

      <input
        type="number"
        min={1}
        max={250}
        placeholder="Max level"
        className="app-input px-2 py-2 text-sm"
        value={values.maxLevel ?? ""}
        onChange={(e) => onChange("maxLevel", e.target.value)}
      />
    </div>
  );
}

export function ServerSystemFilters({
  active,
  onToggle,
}: {
  active: ServerSystemKey[];
  onToggle: (key: ServerSystemKey) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {SERVER_SYSTEMS.map((system) => (
        <button
          key={system.key}
          type="button"
          onClick={() => onToggle(system.key)}
          className={cn(
            "app-filter-pill",
            active.includes(system.key) && "app-filter-pill-active"
          )}
        >
          {system.label}
        </button>
      ))}
    </div>
  );
}
