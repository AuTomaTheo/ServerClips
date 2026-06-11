"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function ServerFollowButton({
  serverId,
  serverSlug,
  initialFollowing,
  initialFollowers,
  isAuthenticated,
}: {
  serverId: string;
  serverSlug: string;
  initialFollowing: boolean;
  initialFollowers: number;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [followers, setFollowers] = useState(initialFollowers);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/server/${serverSlug}`)}`);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/servers/${serverId}/follow`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setFollowing(data.following);
      setFollowers(data.followers);
    }
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-semibold transition-all active:scale-[0.97]",
        following
          ? "border-zinc-600 bg-zinc-800 text-white"
          : "border-zinc-600 bg-zinc-900 text-white hover:bg-zinc-800"
      )}
    >
      <Heart className={cn("h-4 w-4", following && "fill-red-500 text-red-500")} />
      {following ? "Following" : "Follow"}
      <span className="text-zinc-400">{formatNumber(followers)}</span>
    </button>
  );
}
