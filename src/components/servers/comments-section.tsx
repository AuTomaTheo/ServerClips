"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { commentSchema, type CommentInput } from "@/lib/validators/video";
import { Metin2Button } from "@/components/metin2/metin2-button";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Flag } from "lucide-react";
import { ReportDialog } from "@/components/reports/report-dialog";

export interface CommentData {
  id: string;
  body: string;
  createdAt: string;
  user: { id: string; name: string | null; displayName?: string | null; image: string | null };
}

export function CommentsSection({
  videoId,
  initialComments,
  currentUserId,
  isAdmin,
  isAuthenticated,
}: {
  videoId: string;
  initialComments: CommentData[];
  currentUserId?: string;
  isAdmin: boolean;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CommentInput>({
    resolver: zodResolver(commentSchema),
    defaultValues: { body: "" },
  });

  async function onSubmit(data: CommentInput) {
    if (!isAuthenticated) {
      router.push("/login");
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
      setError(result.error ?? "Failed to post comment");
      return;
    }
    setComments((prev) => [result, ...prev]);
    form.reset();
    router.refresh();
  }

  async function deleteComment(commentId: string) {
    const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="font-display text-lg font-semibold text-[#3d2814]">
        Comments ({comments.length})
      </h3>
      {isAuthenticated ? (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <Textarea placeholder="Share your thoughts..." rows={3} className="metin2-input" {...form.register("body")} />
          {error && <p className="text-sm text-red-700">{error}</p>}
          <Metin2Button type="submit" disabled={form.formState.isSubmitting}>Post comment</Metin2Button>
        </form>
      ) : (
        <p className="text-sm text-[#4a3020]">
          <a href="/login" className="font-semibold text-[#8b1a1a] hover:underline">Log in</a> to comment.
        </p>
      )}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-[#6b5a40]">No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="metin2-comment-card">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <span className="font-medium text-[#3d2814]">
                    {comment.user.displayName ?? comment.user.name ?? "Anonymous"}
                  </span>
                  <span className="ml-2 text-xs text-[#6b5a40]">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <div className="flex gap-1">
                  <ReportDialog targetType="COMMENT" targetId={comment.id} trigger={
                    <button className="rounded p-1 text-[#6b5a40] hover:text-[#a67c00]" title="Report">
                      <Flag className="h-4 w-4" />
                    </button>
                  } />
                  {(currentUserId === comment.user.id || isAdmin) && (
                    <button onClick={() => deleteComment(comment.id)} className="rounded p-1 text-[#6b5a40] hover:text-red-700" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <p className="whitespace-pre-wrap text-sm text-[#4a3020]">{comment.body}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
