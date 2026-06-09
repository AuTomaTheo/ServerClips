"use client";

import { useRouter } from "next/navigation";
import { Metin2Button } from "@/components/metin2/metin2-button";
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
          <Metin2Button className="text-sm" onClick={() => updateStatus("APPROVED")}>Approve</Metin2Button>
          <Metin2Button className="text-sm" variant="ghost" onClick={() => updateStatus("REJECTED")}>Reject</Metin2Button>
        </>
      )}
      {status === "APPROVED" && (
        <Metin2Button className="text-sm" variant="ghost" onClick={() => updateStatus("SUSPENDED")}>Suspend</Metin2Button>
      )}
      {status === "SUSPENDED" && (
        <Metin2Button className="text-sm" onClick={() => updateStatus("APPROVED")}>Unsuspend</Metin2Button>
      )}
      <Metin2Button className="text-sm" variant="ghost" onClick={() => updateStatus("DELETED")}>Delete</Metin2Button>
    </div>
  );
}
