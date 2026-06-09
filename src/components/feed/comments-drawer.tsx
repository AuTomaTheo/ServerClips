"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { commentSchema, type CommentInput } from "@/lib/validators/video";
import { X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Metin2Button } from "@/components/metin2/metin2-button";
import { Textarea } from "@/components/ui/textarea";

interface Comment {
  id: string;
  body: string;
  createdAt: string;
  user: { id: string; name: string | null; displayName?: string | null; username?: string | null };
}

export function CommentsDrawer({
  videoId,
  videoTitle,
  initialCount,
  isAuthenticated,
  open,
  onClose,
  onAuthRequired,
}: {
  videoId: string;
  videoTitle: string;
  initialCount: number;
  isAuthenticated: boolean;
  open: boolean;
  onClose: () => void;
  onAuthRequired?: () => void;
}) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CommentInput>({
    resolver: zodResolver(commentSchema),
    defaultValues: { body: "" },
  });

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`/api/videos/${videoId}/comments`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setComments(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, videoId]);

  async function onSubmit(data: CommentInput) {
    if (!isAuthenticated) {
      if (onAuthRequired) onAuthRequired();
      else router.push("/login");
      return;
    }
    setError(null);
    const res = await fetch(`/api/videos/${videoId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      setError(result.error ?? "Failed to post");
      return;
    }
    setComments((prev) => [result, ...prev]);
    form.reset();
  }

  if (!open) return null;

  const countLabel =
    comments.length > 0 ? comments.length : initialCount > 0 ? initialCount : null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative flex max-h-[70vh] w-full max-w-lg flex-col rounded-t-2xl border border-[#5c3d1e] bg-[#1a1208]">
        <div className="flex items-center justify-between border-b border-[#5c3d1e] px-4 py-3">
          <h3 className="font-display text-metin2-gold">
            Comments{countLabel != null ? ` (${countLabel})` : ""}
          </h3>
          <button onClick={onClose} className="rounded p-1 text-metin2-parchment hover:bg-black/30">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="px-4 py-2 text-xs text-metin2-parchment/60">{videoTitle}</p>
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {loading ? (
            <p className="text-center text-sm text-metin2-parchment/60">Loading...</p>
          ) : comments.length === 0 ? (
            <p className="text-center text-sm text-metin2-parchment/60">No comments yet.</p>
          ) : (
            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="border-b border-[#5c3d1e]/40 pb-3 last:border-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-metin2-gold">
                      {c.user.displayName ?? c.user.name ?? "User"}
                    </span>
                    <span className="text-xs text-metin2-parchment/50">
                      {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-metin2-parchment/90">{c.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="border-t border-[#5c3d1e] p-4">
          {isAuthenticated ? (
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                rows={2}
                className="metin2-input min-h-0 flex-1 resize-none"
                {...form.register("body")}
              />
              <Metin2Button type="submit" className="self-end text-sm">
                Post
              </Metin2Button>
            </form>
          ) : (
            <p className="text-center text-sm text-metin2-parchment/70">
              <a href="/login" className="text-metin2-gold hover:underline">Log in</a> to comment
            </p>
          )}
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}
