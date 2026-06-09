"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileInput } from "@/lib/validators/profile";
import { Metin2Button } from "@/components/metin2/metin2-button";

export function ProfileEditForm({
  defaultValues,
}: {
  defaultValues: ProfileInput & { socialLinks?: Record<string, string> };
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  async function onSubmit(data: ProfileInput) {
    setError(null);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      setError(result.error ?? "Failed to update");
      return;
    }
    router.push(`/u/${result.username}`);
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div>
        <label className="metin2-label">Display name</label>
        <input className="metin2-input w-full px-3 py-2" {...form.register("displayName")} />
      </div>
      <div>
        <label className="metin2-label">Username</label>
        <input className="metin2-input w-full px-3 py-2" {...form.register("username")} />
      </div>
      <div>
        <label className="metin2-label">Bio</label>
        <textarea className="metin2-input w-full px-3 py-2" rows={3} {...form.register("bio")} />
      </div>
      <div>
        <label className="metin2-label">Website</label>
        <input className="metin2-input w-full px-3 py-2" {...form.register("websiteUrl")} />
      </div>
      <label className="flex items-center gap-2 text-sm text-[#4a3020]">
        <input type="checkbox" {...form.register("likedVideosPublic")} />
        Make liked videos public
      </label>
      <label className="flex items-center gap-2 text-sm text-[#4a3020]">
        <input type="checkbox" {...form.register("savedVideosPublic")} />
        Make saved videos public
      </label>
      <Metin2Button type="submit" disabled={form.formState.isSubmitting}>Save profile</Metin2Button>
    </form>
  );
}
