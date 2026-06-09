"use client";

import { useState } from "react";
import { UserPlus, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoginPromptModal } from "./login-prompt-modal";

export function FeedFollowButton({
  username,
  initialFollowing,
  isAuthenticated,
  isSelf,
}: {
  username: string | null;
  initialFollowing: boolean;
  isAuthenticated: boolean;
  isSelf?: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  if (!username || isSelf) return null;

  async function toggleFollow() {
    if (!isAuthenticated) {
      setLoginOpen(true);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/users/${username}/follow`, { method: "POST" });
    const data = await res.json();
    if (res.ok) setFollowing(data.following);
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={toggleFollow}
        disabled={loading}
        className="flex flex-col items-center gap-0.5 text-white"
        aria-label={following ? "Unfollow" : "Follow"}
      >
        <span
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full bg-black/45 backdrop-blur-sm",
            following && "bg-metin2-gold/20"
          )}
        >
          {following ? (
            <UserCheck className="h-5 w-5 text-metin2-gold" />
          ) : (
            <UserPlus className="h-5 w-5" />
          )}
        </span>
        <span className="text-[11px] font-medium drop-shadow">
          {following ? "Following" : "Follow"}
        </span>
      </button>
      <LoginPromptModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        action="follow creators"
      />
    </>
  );
}
