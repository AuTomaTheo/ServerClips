"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Metin2Button } from "@/components/metin2/metin2-button";
import { Heart } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

export function LikeButton({
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
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function toggleLike() {
    if (!isAuthenticated) {
      router.push("/login");
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
    <Metin2Button
      variant="ghost"
      onClick={toggleLike}
      disabled={loading}
      className={cn(liked && "border-metin2-red text-red-400")}
    >
      <Heart className={cn("h-4 w-4", liked && "fill-red-400")} />
      {formatNumber(count)}
    </Metin2Button>
  );
}
