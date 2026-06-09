"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import { LoginPromptModal } from "./login-prompt-modal";

export function FeedLikeButton({
  videoId,
  initialLiked,
  initialCount,
  isAuthenticated,
}: {
  videoId: string;
  initialLiked: boolean;
  initialCount: number;
  isAuthenticated: boolean;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  async function toggleLike() {
    if (!isAuthenticated) {
      setLoginOpen(true);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/videos/${videoId}/like`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setLiked(data.liked);
      setCount(data.count);
    }
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={toggleLike}
        disabled={loading}
        className="flex flex-col items-center gap-0.5 text-white"
        aria-label="Like"
      >
        <span
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full bg-black/45 backdrop-blur-sm",
            liked && "bg-metin2-red/25"
          )}
        >
          <Heart className={cn("h-6 w-6", liked && "fill-red-500 text-red-500")} />
        </span>
        <span className="text-[11px] font-medium drop-shadow">{formatNumber(count)}</span>
      </button>
      <LoginPromptModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        action="like videos"
      />
    </>
  );
}
