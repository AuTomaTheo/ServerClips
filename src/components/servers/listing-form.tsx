"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { listingSchema, type ListingInput } from "@/lib/validators/listing";
import { LANGUAGES, REGIONS, SERVER_TYPES } from "@/lib/constants";
import { Metin2Button } from "@/components/metin2/metin2-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

interface ListingFormProps {
  defaultValues?: Partial<ListingInput>;
  listingId?: string;
  mode: "create" | "edit";
}

export function ListingForm({ defaultValues, listingId, mode }: ListingFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ListingInput>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      name: "",
      description: "",
      websiteUrl: "",
      discordUrl: "",
      region: "Europe",
      language: "English",
      serverType: "OLDSCHOOL",
      expRate: "x1",
      yangRate: "x1",
      dropRate: "x1",
      launchDate: "",
      tags: "",
      ...defaultValues,
    },
  });

  async function onSubmit(data: ListingInput) {
    setError(null);
    const url = mode === "create" ? "/api/servers" : `/api/servers/${listingId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) {
      setError(result.error ?? "Something went wrong");
      return;
    }

    router.push("/studio");
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded border border-red-800 bg-red-950/30 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="name" className="metin2-label">Server name</label>
          <Input id="name" className="metin2-input" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-sm text-red-700">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="description" className="metin2-label">Description</label>
          <Textarea id="description" rows={6} className="metin2-input" placeholder="Describe your server in a few sentences (min. 10 characters)" {...form.register("description")} />
          {form.formState.errors.description && (
            <p className="text-sm text-red-700">{form.formState.errors.description.message}</p>
          )}
          <p className="text-xs text-[#6b5a40]">At least 10 characters</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="websiteUrl" className="metin2-label">Website URL</label>
          <Input id="websiteUrl" className="metin2-input" type="url" placeholder="https://" {...form.register("websiteUrl")} />
        </div>

        <div className="space-y-2">
          <label htmlFor="discordUrl" className="metin2-label">Discord URL</label>
          <Input id="discordUrl" className="metin2-input" type="url" placeholder="https://discord.gg/..." {...form.register("discordUrl")} />
        </div>

        <div className="space-y-2">
          <label htmlFor="region" className="metin2-label">Region</label>
          <Select id="region" className="metin2-input" {...form.register("region")}>
            {REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="language" className="metin2-label">Language</label>
          <Select id="language" className="metin2-input" {...form.register("language")}>
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="serverType" className="metin2-label">Server type</label>
          <Select id="serverType" className="metin2-input" {...form.register("serverType")}>
            {SERVER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="launchDate" className="metin2-label">Launch date</label>
          <Input id="launchDate" className="metin2-input" type="date" {...form.register("launchDate")} />
        </div>

        <div className="space-y-2">
          <label htmlFor="expRate" className="metin2-label">EXP rate</label>
          <Input id="expRate" className="metin2-input" placeholder="x50" {...form.register("expRate")} />
        </div>

        <div className="space-y-2">
          <label htmlFor="yangRate" className="metin2-label">Yang rate</label>
          <Input id="yangRate" className="metin2-input" placeholder="x50" {...form.register("yangRate")} />
        </div>

        <div className="space-y-2">
          <label htmlFor="dropRate" className="metin2-label">Drop rate</label>
          <Input id="dropRate" className="metin2-input" placeholder="x50" {...form.register("dropRate")} />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="tags" className="metin2-label">Tags (comma-separated)</label>
          <Input id="tags" className="metin2-input" placeholder="oldschool, pvp, international" {...form.register("tags")} />
        </div>

      </div>

      <Metin2Button type="submit" disabled={form.formState.isSubmitting}>
        {mode === "create" ? "Submit server profile" : "Save changes"}
      </Metin2Button>
    </form>
  );
}
