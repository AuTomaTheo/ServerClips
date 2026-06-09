"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Metin2Button } from "@/components/metin2/metin2-button";

export function ImpersonateButton({ userId, username }: { userId: string; username: string | null }) {
  const { update } = useSession();
  const router = useRouter();

  async function start() {
    const res = await fetch("/api/admin/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) return;
    await update({ impersonatingUserId: userId });
    router.push(username ? `/u/${username}` : "/");
    router.refresh();
  }

  return (
    <Metin2Button className="text-sm" variant="ghost" onClick={start}>
      View as user
    </Metin2Button>
  );
}
