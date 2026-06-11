"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  serverSubmissionSchema,
  type ServerSubmissionInput,
} from "@/lib/validators/server-submission";
import {
  GAMEPLAY_DIFFICULTIES,
  LANGUAGES,
  ORIGIN_COUNTRIES,
  SCHOOL_TYPES,
  SERVER_MEMBER_ROLES,
  SERVER_SYSTEMS,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { mediaUrlForDisplay } from "@/lib/media-url";
import { cn } from "@/lib/utils";

interface ServerSubmissionFormProps {
  defaultValues?: Partial<ServerSubmissionInput>;
  serverId?: string;
  mode: "submit" | "studio-create" | "edit";
  redirectTo?: string;
}

function getFirstFormError(errors: FieldErrors<ServerSubmissionInput>): string | null {
  for (const value of Object.values(errors)) {
    if (!value) continue;
    if (typeof value === "object" && "message" in value && value.message) {
      return String(value.message);
    }
    if (typeof value === "object") {
      const nested = getFirstFormError(value as FieldErrors<ServerSubmissionInput>);
      if (nested) return nested;
    }
  }
  return null;
}

export function ServerSubmissionForm({
  defaultValues,
  serverId,
  mode,
  redirectTo = "/",
}: ServerSubmissionFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<"logo" | "banner" | null>(null);
  const [othersEnabled, setOthersEnabled] = useState(
    Boolean(defaultValues?.otherSystems?.trim())
  );

  const form = useForm<ServerSubmissionInput>({
    resolver: zodResolver(serverSubmissionSchema) as Resolver<ServerSubmissionInput>,
    defaultValues: {
      name: "",
      websiteUrl: "",
      discordUrl: "",
      logoUrl: "",
      bannerUrl: "",
      launchDate: "",
      memberRole: "OWNER",
      representsServer: true,
      maxLevel: undefined,
      schoolType: "OLDSCHOOL",
      gameplayDifficulty: "MEDIUM",
      originCountry: "Romania",
      mainLanguage: "Romanian",
      supportedLanguages: ["Romanian"],
      systems: {},
      description: "",
      otherSystems: "",
      ...defaultValues,
    },
  });

  const supportedLanguages = form.watch("supportedLanguages") ?? [];

  async function uploadImage(file: File, field: "logoUrl" | "bannerUrl") {
    setUploading(field === "logoUrl" ? "logo" : "banner");
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "image");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "Upload failed");
      form.setValue(field, result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  }

  function toggleLanguage(lang: string) {
    const current = form.getValues("supportedLanguages") ?? [];
    if (current.includes(lang)) {
      if (current.length <= 1) return;
      form.setValue(
        "supportedLanguages",
        current.filter((l) => l !== lang)
      );
    } else {
      form.setValue("supportedLanguages", [...current, lang]);
    }
  }

  async function onSubmit(data: ServerSubmissionInput) {
    setError(null);
    const url =
      mode === "edit" && serverId
        ? `/api/servers/${serverId}`
        : mode === "studio-create"
          ? "/api/servers"
          : "/api/servers/submit";
    const method = mode === "edit" ? "PATCH" : "POST";

    const payload = {
      ...data,
      otherSystems: othersEnabled ? data.otherSystems : "",
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(result.error ?? "Something went wrong");
        return;
      }

      if (mode === "submit") {
        const params = new URLSearchParams({
          name: data.name,
          ...(result.slug ? { slug: result.slug } : {}),
        });
        router.push(`/submit-server/success?${params.toString()}`);
      } else {
        router.push(redirectTo);
      }
      router.refresh();
    } catch {
      setError("Network error — please check your connection and try again.");
    }
  }

  function onInvalid(errors: FieldErrors<ServerSubmissionInput>) {
    setError(getFirstFormError(errors) ?? "Please fix the highlighted fields and try again.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="relative space-y-8">
      {isSubmitting && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-5 shadow-lg">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
            <p className="text-sm font-medium text-zinc-300">Submitting your server profile…</p>
          </div>
        </div>
      )}
      {error && (
        <div className="rounded border border-red-800 bg-red-950/30 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <section className="space-y-4">
        <h2 className="app-section-title text-sm normal-case tracking-wide text-zinc-300">Server identity</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="name" className="app-label">Server name</label>
            <Input id="name" className="app-input" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-red-400">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="websiteUrl" className="app-label">Website</label>
            <Input id="websiteUrl" className="app-input" type="url" placeholder="https://" {...form.register("websiteUrl")} />
            {form.formState.errors.websiteUrl && (
              <p className="text-sm text-red-400">{form.formState.errors.websiteUrl.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="discordUrl" className="app-label">Discord</label>
            <Input id="discordUrl" className="app-input" type="url" placeholder="https://discord.gg/..." {...form.register("discordUrl")} />
            {form.formState.errors.discordUrl && (
              <p className="text-sm text-red-400">{form.formState.errors.discordUrl.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="app-label">Logo</label>
            <Input
              type="file"
              accept="image/*"
              className="app-input"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadImage(file, "logoUrl");
              }}
            />
            {uploading === "logo" && <p className="text-xs text-zinc-500">Uploading...</p>}
            {form.watch("logoUrl") && mediaUrlForDisplay(form.watch("logoUrl")) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mediaUrlForDisplay(form.watch("logoUrl"))!}
                alt="Logo preview"
                className="h-16 w-16 rounded border object-cover"
              />
            )}
          </div>

          <div className="space-y-2">
            <label className="app-label">Banner</label>
            <Input
              type="file"
              accept="image/*"
              className="app-input"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadImage(file, "bannerUrl");
              }}
            />
            {uploading === "banner" && <p className="text-xs text-zinc-500">Uploading...</p>}
            {form.watch("bannerUrl") && mediaUrlForDisplay(form.watch("bannerUrl")) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mediaUrlForDisplay(form.watch("bannerUrl"))!}
                alt="Banner preview"
                className="h-20 w-full rounded border object-cover"
              />
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="launchDate" className="app-label">Launch date</label>
            <Input id="launchDate" className="app-input" type="date" {...form.register("launchDate")} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="app-section-title text-sm normal-case tracking-wide text-zinc-300">About your server</h2>
        <div className="space-y-2">
          <label htmlFor="description" className="app-label">Description</label>
          <Textarea
            id="description"
            className="app-input min-h-[120px]"
            rows={5}
            placeholder="Describe your server — rates, features, community, events, or anything else you want players to know."
            {...form.register("description")}
          />
          {form.formState.errors.description && (
            <p className="text-sm text-red-700">{form.formState.errors.description.message}</p>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="app-section-title text-sm normal-case tracking-wide text-zinc-300">Your relationship</h2>
        <div className="space-y-2">
          <label htmlFor="memberRole" className="app-label">Role on this server</label>
          <Select id="memberRole" className="app-input" {...form.register("memberRole")}>
            {SERVER_MEMBER_ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </Select>
        </div>

        <fieldset className="space-y-2">
          <legend className="app-label">Verification declaration</legend>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="radio"
              checked={form.watch("representsServer") === true}
              onChange={() => form.setValue("representsServer", true)}
            />
            I represent this server
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="radio"
              checked={form.watch("representsServer") === false}
              onChange={() => form.setValue("representsServer", false)}
            />
            I do not represent this server
          </label>
        </fieldset>
      </section>

      <section className="space-y-4">
        <h2 className="app-section-title text-sm normal-case tracking-wide text-zinc-300">Metin2 metadata</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="maxLevel" className="app-label">Max level</label>
            <Input id="maxLevel" className="app-input" type="number" min={1} max={250} {...form.register("maxLevel")} />
          </div>

          <div className="space-y-2">
            <label htmlFor="schoolType" className="app-label">School type</label>
            <Select id="schoolType" className="app-input" {...form.register("schoolType")}>
              {SCHOOL_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="gameplayDifficulty" className="app-label">Gameplay difficulty</label>
            <Select id="gameplayDifficulty" className="app-input" {...form.register("gameplayDifficulty")}>
              {GAMEPLAY_DIFFICULTIES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="originCountry" className="app-label">Origin country</label>
            <Select id="originCountry" className="app-input" {...form.register("originCountry")}>
              {ORIGIN_COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="mainLanguage" className="app-label">Main language</label>
            <Select
              id="mainLanguage"
              className="app-input"
              {...form.register("mainLanguage")}
              onChange={(e) => {
                form.setValue("mainLanguage", e.target.value);
                const langs = form.getValues("supportedLanguages") ?? [];
                if (!langs.includes(e.target.value)) {
                  form.setValue("supportedLanguages", [...langs, e.target.value]);
                }
              }}
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <span className="app-label">Supported languages</span>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => toggleLanguage(lang)}
                className={cn(
                  "rounded border px-3 py-1 text-xs transition-all active:scale-95",
                  supportedLanguages.includes(lang)
                    ? "app-filter-pill app-filter-pill-active"
                    : "app-filter-pill"
                )}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="app-section-title text-sm normal-case tracking-wide text-zinc-300">Systems</h2>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {SERVER_SYSTEMS.map((system) => (
            <label key={system.key} className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                {...form.register(`systems.${system.key}`, { setValueAs: (v) => v === true || v === "on" })}
              />
              {system.label}
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={othersEnabled}
              onChange={(e) => {
                setOthersEnabled(e.target.checked);
                if (!e.target.checked) form.setValue("otherSystems", "");
              }}
            />
            Others
          </label>
        </div>
        {othersEnabled && (
          <div className="space-y-2">
            <label htmlFor="otherSystems" className="app-label">Other systems</label>
            <Textarea
              id="otherSystems"
              className="app-input min-h-[80px]"
              rows={3}
              placeholder="List any other systems not covered above (e.g. Gaya System, Biologist Quest, Switchbot). Separate multiple with commas or new lines."
              {...form.register("otherSystems")}
            />
            {form.formState.errors.otherSystems && (
              <p className="text-sm text-red-400">{form.formState.errors.otherSystems.message}</p>
            )}
          </div>
        )}
      </section>

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "Submitting…" : mode === "edit" ? "Save changes" : "Submit server profile"}
      </Button>
    </form>
  );
}
