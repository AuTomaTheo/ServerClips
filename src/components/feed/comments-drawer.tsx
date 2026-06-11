"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { commentSchema, type CommentInput } from "@/lib/validators/video";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CommentThread } from "@/components/comments/comment-thread";
import type { CommentNode } from "@/types/comments";
import { countCommentNodes } from "@/types/comments";

function removeCommentFromTree(nodes: CommentNode[], commentId: string): CommentNode[] {
  return nodes
    .filter((n) => n.id !== commentId)
    .map((n) => ({ ...n, replies: removeCommentFromTree(n.replies, commentId) }));
}

function updateCommentInTree(
  nodes: CommentNode[],
  commentId: string,
  patch: Partial<Pick<CommentNode, "likes" | "dislikes" | "userReaction">>
): CommentNode[] {
  return nodes.map((n) => {
    if (n.id === commentId) return { ...n, ...patch };
    return { ...n, replies: updateCommentInTree(n.replies, commentId, patch) };
  });
}

export function CommentsDrawer({
  videoId,
  videoTitle,
  initialCount,
  isAuthenticated,
  currentUserId,
  open,
  onClose,
  onAuthRequired,
}: {
  videoId: string;
  videoTitle: string;
  initialCount: number;
  isAuthenticated: boolean;
  currentUserId?: string;
  open: boolean;
  onClose: () => void;
  onAuthRequired?: () => void;
}) {
  const router = useRouter();
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [postingReply, setPostingReply] = useState(false);
  const [mounted, setMounted] = useState(false);

  const form = useForm<CommentInput>({
    resolver: zodResolver(commentSchema),
    defaultValues: { body: "" },
  });

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/videos/${videoId}/comments`);
      const data = await res.json();
      if (data.comments) {
        setComments(data.comments);
        setTotal(data.total ?? countCommentNodes(data.comments));
      } else if (Array.isArray(data)) {
        setComments(data);
        setTotal(data.length);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    loadComments();
    setReplyingToId(null);
    setReplyBody("");
  }, [open, loadComments]);

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
    await loadComments();
    form.reset();
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
      const result = await res.json();
      if (!res.ok) {
        setError(result.error ?? "Failed to reply");
        return;
      }
      setReplyingToId(null);
      setReplyBody("");
      await loadComments();
    } finally {
      setPostingReply(false);
    }
  }

  async function deleteComment(commentId: string) {
    setDeletingId(commentId);
    setError(null);
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
      if (!res.ok) {
        const result = await res.json();
        setError(result.error ?? "Failed to delete");
        return;
      }
      setComments((prev) => removeCommentFromTree(prev, commentId));
      setTotal((t) => Math.max(0, t - 1));
      await loadComments();
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
    if (!res.ok) return;
    const data = await res.json();
    setComments((prev) =>
      updateCommentInTree(prev, commentId, {
        likes: data.likes,
        dislikes: data.dislikes,
        userReaction: data.userReaction,
      })
    );
  }

  if (!open || !mounted) return null;

  const countLabel = total > 0 ? total : initialCount > 0 ? initialCount : null;

  const drawer = (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative flex max-h-[70vh] w-full max-w-lg flex-col rounded-t-2xl border border-zinc-800 bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
          <h3 className="text-sm font-semibold text-white">
            Comments{countLabel != null ? ` (${countLabel})` : ""}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-900 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="px-4 py-2 text-xs text-zinc-500">{videoTitle}</p>
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {loading ? (
            <p className="text-center text-sm text-zinc-500">Loading...</p>
          ) : comments.length === 0 ? (
            <p className="text-center text-sm text-zinc-500">No comments yet.</p>
          ) : (
            <CommentThread
              comments={comments}
              variant="feed"
              isAuthenticated={isAuthenticated}
              currentUserId={currentUserId}
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
              onAuthRequired={onAuthRequired}
            />
          )}
        </div>
        <div className="border-t border-zinc-800 p-4">
          {isAuthenticated ? (
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                rows={2}
                className="app-input min-h-0 flex-1 resize-none"
                {...form.register("body")}
              />
              <Button type="submit" size="sm" className="self-end">
                Post
              </Button>
            </form>
          ) : (
            <p className="text-center text-sm text-zinc-500">
              <a href="/login" className="text-red-400 hover:underline">Log in</a> to comment
            </p>
          )}
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );

  return createPortal(drawer, document.body);
}
