"use client";

import { useRouter } from "next/navigation";
import { Metin2Button } from "@/components/metin2/metin2-button";
import { Role, UserStatus } from "@/generated/prisma/client";

export function UserAdminActions({
  userId,
  role,
  status,
}: {
  userId: string;
  role: Role;
  status: UserStatus;
}) {
  const router = useRouter();

  async function action(act: string, extra?: Record<string, string>) {
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: act, ...extra }),
    });
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status !== "BANNED" && (
        <Metin2Button className="text-sm" variant="ghost" onClick={() => action("ban")}>Ban</Metin2Button>
      )}
      {status === "BANNED" && (
        <Metin2Button className="text-sm" onClick={() => action("unban")}>Unban</Metin2Button>
      )}
      {status === "ACTIVE" && (
        <Metin2Button className="text-sm" variant="ghost" onClick={() => action("warn")}>Warn</Metin2Button>
      )}
      {role !== "CREATOR" && (
        <Metin2Button className="text-sm" variant="gold" onClick={() => action("change_role", { role: "CREATOR" })}>
          Make creator
        </Metin2Button>
      )}
    </div>
  );
}
