"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
        <Button size="sm" variant="outline" onClick={() => action("ban")}>
          Ban
        </Button>
      )}
      {status === "BANNED" && (
        <Button size="sm" onClick={() => action("unban")}>
          Unban
        </Button>
      )}
      {status === "ACTIVE" && (
        <Button size="sm" variant="outline" onClick={() => action("warn")}>
          Warn
        </Button>
      )}
      {role !== "CREATOR" && (
        <Button size="sm" variant="secondary" onClick={() => action("change_role", { role: "CREATOR" })}>
          Make creator
        </Button>
      )}
    </div>
  );
}
