"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { videoSchema, type VideoInput } from "@/lib/validators/video";
import { Metin2Button } from "@/components/metin2/metin2-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

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
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kind", "video");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) form.setValue("videoUrl", data.url);
    else setError(data.error ?? "Upload failed");
    setUploading(false);
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
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div>
        <label className="metin2-label">Title</label>
        <Input className="metin2-input" {...form.register("title")} />
      </div>
      <div>
        <label className="metin2-label">Description</label>
        <Textarea className="metin2-input" rows={3} {...form.register("description")} />
      </div>
      <div>
        <label className="metin2-label">Attach to server (optional)</label>
        <Select className="metin2-input w-full" {...form.register("serverId")}>
          <option value="">None</option>
          {servers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </Select>
      </div>
      <div>
        <label className="metin2-label">Video file (mp4/webm)</label>
        <Input className="metin2-input" type="file" accept="video/mp4,video/webm,video/quicktime" onChange={handleVideoUpload} />
        {form.watch("videoUrl") && <p className="mt-1 text-xs text-green-800">Video uploaded</p>}
      </div>
      <div>
        <label className="metin2-label">Visibility</label>
        <Select className="metin2-input w-full" {...form.register("visibility")}>
          <option value="PUBLIC">Public</option>
          <option value="UNLISTED">Unlisted</option>
          <option value="PRIVATE">Private</option>
        </Select>
      </div>
      <Metin2Button type="submit" disabled={uploading || form.formState.isSubmitting}>
        {uploading ? "Uploading..." : videoId ? "Save changes" : "Submit video"}
      </Metin2Button>
    </form>
  );
}
