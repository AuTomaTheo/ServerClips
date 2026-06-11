"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { commentSchema, type CommentInput } from "@/lib/validators/video";
import { Metin2Button } from "@/components/metin2/metin2-button";
import { Textarea } from "@/components/ui/textarea";
import { CommentThread } from "@/components/comments/comment-thread";
import type { CommentNode } from "@/types/comments";
import { countCommentNodes } from "@/types/comments";

export function CommentsSection({
  videoId,
  initialComments,
  initialTotal,
  currentUserId,
  isAdmin,
  isAuthenticated,
}: {
  videoId: string;
  initialComments: CommentNode[];
  initialTotal?: number;
  currentUserId?: string;
  isAdmin: boolean;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [total, setTotal] = useState(initialTotal ?? countCommentNodes(initialComments));
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [postingReply, setPostingReply] = useState(false);

  const form = useForm<CommentInput>({
    resolver: zodResolver(commentSchema),
    defaultValues: { body: "" },
  });

  const loadComments = useCallback(async () => {
    const res = await fetch(`/api/videos/${videoId}/comments`);
    const data = await res.json();
    if (data.comments) {
      setComments(data.comments);
      setTotal(data.total ?? countCommentNodes(data.comments));
    }
  }, [videoId]);

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
    form.reset();
    await loadComments();
    router.refresh();
  }

  async function submitReply(parentId: string) {
    if (!isAuthenticated || replyBody.trim().length < 2) return;
    setPostingReply(true);
    setError(null);
    try {
      const res = await fetch(`/api/videos/${videoId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyBody.trim(), parentId }),
      });
      if (!res.ok) {
        const result = await res.json();
        setError(result.error ?? "Failed to reply");
        return;
      }
      setReplyingToId(null);
      setReplyBody("");
      await loadComments();
      router.refresh();
    } finally {
      setPostingReply(false);
    }
  }

  async function deleteComment(commentId: string) {
    setDeletingId(commentId);
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
      if (res.ok) {
        await loadComments();
        router.refresh();
      }
    } finally {
      setDeletingId(null);
    }
  }

  async function reactToComment(commentId: string, type: "LIKE" | "DISLIKE") {
    const res = await fetch(`/api/comments/${commentId}/reaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    if (res.ok) await loadComments();
  }

  return (
    <div className="space-y-6">
      <h3 className="font-display text-lg font-semibold text-[#3d2814]">
        Comments ({total})
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
          <CommentThread
            comments={comments}
            variant="server"
            isAuthenticated={isAuthenticated}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            deletingId={deletingId}
            replyingToId={replyingToId}
            replyBody={replyBody}
            postingReply={postingReply}
            onReplyClick={(id) => {
              setReplyingToId(id);
              setReplyBody("");
            }}
            onReplyCancel={() => {
              setReplyingToId(null);
              setReplyBody("");
            }}
            onReplyBodyChange={setReplyBody}
            onReplySubmit={submitReply}
            onDelete={deleteComment}
            onReaction={reactToComment}
            onAuthRequired={() => router.push("/login")}
          />
        )}
      </div>
    </div>
  );
}
