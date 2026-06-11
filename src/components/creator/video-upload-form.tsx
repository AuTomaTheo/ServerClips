"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { videoSchema, type VideoInput } from "@/lib/validators/video";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useMediaUpload } from "@/hooks/use-media-upload";

export function VideoUploadForm({
  servers,
  defaultValues,
  videoId,
  redirectTo = "/studio",
}: {
  servers: { id: string; name: string }[];
  defaultValues?: Partial<VideoInput>;
  videoId?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const { update } = useSession();
  const [error, setError] = useState<string | null>(null);
  const { upload, uploading } = useMediaUpload();

  const form = useForm<VideoInput>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      title: "",
      description: "",
      videoUrl: "",
      visibility: "PUBLIC",
      serverId: "",
      ...defaultValues,
    },
  });

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const result = await upload(file, "video");
      form.setValue("videoUrl", result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  async function onSubmit(data: VideoInput) {
    setError(null);
    const url = videoId ? `/api/videos/${videoId}` : "/api/videos";
    const method = videoId ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      setError(result.error ?? "Failed");
      return;
    }
    if (result.promotedToCreator) {
      await update({ role: "CREATOR" });
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div>
        <label className="app-label">Title</label>
        <Input className="app-input" {...form.register("title")} />
      </div>
      <div>
        <label className="app-label">Description</label>
        <Textarea className="app-input" rows={3} {...form.register("description")} />
      </div>
      <div>
        <label className="app-label">Attach to server (optional)</label>
        <Select className="app-input w-full" {...form.register("serverId")}>
          <option value="">None</option>
          {servers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </Select>
      </div>
      <div>
        <label className="app-label">Video file (mp4/webm)</label>
        <Input className="app-input" type="file" accept="video/mp4,video/webm,video/quicktime" onChange={handleVideoUpload} />
        {form.watch("videoUrl") && <p className="mt-1 text-xs text-green-800">Video uploaded</p>}
      </div>
      <div>
        <label className="app-label">Visibility</label>
        <Select className="app-input w-full" {...form.register("visibility")}>
          <option value="PUBLIC">Public</option>
          <option value="UNLISTED">Unlisted</option>
          <option value="PRIVATE">Private</option>
        </Select>
      </div>
      <Button type="submit" disabled={uploading || form.formState.isSubmitting}>
        {uploading ? "Uploading..." : videoId ? "Save changes" : "Submit video"}
      </Button>
    </form>
  );
}
