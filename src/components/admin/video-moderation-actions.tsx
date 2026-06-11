"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ContentStatus } from "@/generated/prisma/client";

export function VideoModerationActions({
  videoId,
  status,
}: {
  videoId: string;
  status: ContentStatus;
}) {
  const router = useRouter();

  async function updateStatus(newStatus: ContentStatus) {
    await fetch(`/api/admin/videos/${videoId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === "PENDING" && (
        <>
          <Button size="sm" onClick={() => updateStatus("APPROVED")}>
            Approve
          </Button>
          <Button size="sm" variant="outline" onClick={() => updateStatus("REJECTED")}>
            Reject
          </Button>
        </>
      )}
      {status === "APPROVED" && (
        <Button size="sm" variant="outline" onClick={() => updateStatus("SUSPENDED")}>
          Suspend
        </Button>
      )}
      {status === "SUSPENDED" && (
        <Button size="sm" onClick={() => updateStatus("APPROVED")}>
          Unsuspend
        </Button>
      )}
      <Button size="sm" variant="ghost" onClick={() => updateStatus("DELETED")}>
        Delete
      </Button>
    </div>
  );
}
