"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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
    <Button size="sm" variant="outline" onClick={start}>
      View as user
    </Button>
  );
}
