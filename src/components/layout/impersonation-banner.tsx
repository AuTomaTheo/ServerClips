"use client";

import { useSession } from "next-auth/react";
import { Metin2Button } from "@/components/metin2/metin2-button";

export function ImpersonationBanner() {
  const { data: session, update } = useSession();

  if (!session?.impersonatedBy) return null;

  const username = session.user.username ?? session.user.displayName ?? session.user.email;

  async function stopImpersonating() {
    await fetch("/api/admin/impersonate", { method: "DELETE" });
    await update({ stopImpersonation: true });
    window.location.href = "/admin/users";
  }

  return (
    <div className="sticky top-0 z-[100] border-b-2 border-amber-600 bg-amber-900 px-4 py-2 text-center text-sm text-amber-100">
      <span className="font-medium">Impersonating @{username}</span>
      <span className="mx-2 text-amber-300">·</span>
      <span className="text-amber-200/80">Read-only mode — destructive actions disabled</span>
      <Metin2Button
        className="ml-4 inline-flex text-xs"
        variant="ghost"
        onClick={stopImpersonating}
      >
        Stop impersonating
      </Metin2Button>
    </div>
  );
}
