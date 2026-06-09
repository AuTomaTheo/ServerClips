"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Metin2Button } from "@/components/metin2/metin2-button";

export function ProfileFollowButton({
  username,
  initialFollowing,
}: {
  username: string;
  initialFollowing: boolean;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!session?.user) {
      router.push("/login");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/users/${username}/follow`, { method: "POST" });
    const data = await res.json();
    if (res.ok) setFollowing(data.following);
    setLoading(false);
  }

  return (
    <Metin2Button variant={following ? "ghost" : "primary"} onClick={toggle} disabled={loading}>
      {following ? "Following" : "Follow"}
    </Metin2Button>
  );
}
