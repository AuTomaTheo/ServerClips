"use client";

import { formatDistanceToNow } from "date-fns";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import type { CommentNode } from "@/types/comments";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type CommentThreadProps = {
  comments: CommentNode[];
  depth?: number;
  isAuthenticated: boolean;
  currentUserId?: string;
  isAdmin?: boolean;
  deletingId: string | null;
  replyingToId: string | null;
  replyBody: string;
  postingReply: boolean;
  onReplyClick: (commentId: string) => void;
  onReplyCancel: () => void;
  onReplyBodyChange: (value: string) => void;
  onReplySubmit: (parentId: string) => void;
  onDelete: (commentId: string) => void;
  onReaction: (commentId: string, type: "LIKE" | "DISLIKE") => void;
  onAuthRequired?: () => void;
  variant?: "feed" | "server";
};

function CommentRow({
  comment,
  depth,
  variant,
  isAuthenticated,
  currentUserId,
  isAdmin,
  deletingId,
  replyingToId,
  replyBody,
  postingReply,
  onReplyClick,
  onReplyCancel,
  onReplyBodyChange,
  onReplySubmit,
  onDelete,
  onReaction,
  onAuthRequired,
}: {
  comment: CommentNode;
  depth: number;
} & Omit<CommentThreadProps, "comments">) {
  const isFeed = variant === "feed";
  const showReplyForm = replyingToId === comment.id;

  function handleReaction(type: "LIKE" | "DISLIKE") {
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }
    onReaction(comment.id, type);
  }

  return (
    <div className={cn(depth > 0 && "ml-4 border-l border-zinc-800 pl-3")}>
      <div className={cn("pb-3", isFeed ? "" : "metin2-comment-card")}>
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-baseline gap-2">
            <span
              className={cn(
                "text-sm font-medium",
                isFeed ? "text-white" : "text-[#3d2814]"
              )}
            >
              {comment.user.displayName ?? comment.user.name ?? "User"}
            </span>
            <span className={cn("text-xs", isFeed ? "text-zinc-500" : "text-[#6b5a40]")}>
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>
          {(currentUserId === comment.user.id || isAdmin) && (
            <button
              type="button"
              onClick={() => onDelete(comment.id)}
              disabled={deletingId === comment.id}
              className="shrink-0 text-xs text-zinc-500 hover:text-red-400 disabled:opacity-50"
            >
              {deletingId === comment.id ? "Deleting…" : "Delete"}
            </button>
          )}
        </div>

        <p
          className={cn(
            "mt-0.5 text-sm",
            isFeed ? "text-zinc-300" : "whitespace-pre-wrap text-[#4a3020]"
          )}
        >
          {comment.body}
        </p>

        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleReaction("LIKE")}
            className={cn(
              "flex items-center gap-1 text-xs transition-colors",
              comment.userReaction === "LIKE"
                ? "text-red-400"
                : isFeed
                  ? "text-zinc-500 hover:text-zinc-300"
                  : "text-[#6b5a40] hover:text-[#3d2814]"
            )}
            aria-label="Like comment"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            {comment.likes > 0 && <span>{comment.likes}</span>}
          </button>
          <button
            type="button"
            onClick={() => handleReaction("DISLIKE")}
            className={cn(
              "flex items-center gap-1 text-xs transition-colors",
              comment.userReaction === "DISLIKE"
                ? "text-red-400"
                : isFeed
                  ? "text-zinc-500 hover:text-zinc-300"
                  : "text-[#6b5a40] hover:text-[#3d2814]"
            )}
            aria-label="Dislike comment"
          >
            <ThumbsDown className="h-3.5 w-3.5" />
            {comment.dislikes > 0 && <span>{comment.dislikes}</span>}
          </button>
          <button
            type="button"
            onClick={() => {
              if (!isAuthenticated) {
                onAuthRequired?.();
                return;
              }
              onReplyClick(comment.id);
            }}
            className={cn(
              "text-xs",
              isFeed ? "text-zinc-500 hover:text-white" : "text-[#6b5a40] hover:text-[#3d2814]"
            )}
          >
            Reply
          </button>
        </div>

        {showReplyForm && (
          <div className="mt-2 flex gap-2">
            <Textarea
              value={replyBody}
              onChange={(e) => onReplyBodyChange(e.target.value)}
              placeholder="Write a reply..."
              rows={2}
              className={cn("min-h-0 flex-1 resize-none", isFeed ? "app-input" : "metin2-input")}
            />
            <div className="flex flex-col gap-1 self-end">
              <Button
                type="button"
                size="sm"
                disabled={postingReply || replyBody.trim().length < 2}
                onClick={() => onReplySubmit(comment.id)}
              >
                {postingReply ? "…" : "Reply"}
              </Button>
              <button
                type="button"
                onClick={onReplyCancel}
                className="text-xs text-zinc-500 hover:text-zinc-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {comment.replies.length > 0 && (
        <div className="space-y-1">
          {comment.replies.map((reply) => (
            <CommentRow
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              variant={variant}
              isAuthenticated={isAuthenticated}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              deletingId={deletingId}
              replyingToId={replyingToId}
              replyBody={replyBody}
              postingReply={postingReply}
              onReplyClick={onReplyClick}
              onReplyCancel={onReplyCancel}
              onReplyBodyChange={onReplyBodyChange}
              onReplySubmit={onReplySubmit}
              onDelete={onDelete}
              onReaction={onReaction}
              onAuthRequired={onAuthRequired}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentThread(props: CommentThreadProps) {
  const { comments, depth = 0 } = props;

  if (comments.length === 0) return null;

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <CommentRow key={comment.id} comment={comment} depth={depth} {...props} />
      ))}
    </div>
  );
}
