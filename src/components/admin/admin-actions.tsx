"use client";

import { useRouter } from "next/navigation";
import { Metin2Button } from "@/components/metin2/metin2-button";

export function ServerStatusActions({
  serverId,
  featured,
  verified,
}: {
  serverId: string;
  featured: boolean;
  verified?: boolean;
}) {
  const router = useRouter();

  async function updateStatus(
    status?: string,
    newFeatured?: boolean,
    newVerified?: boolean
  ) {
    await fetch(`/api/admin/servers/${serverId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(status ? { status } : {}),
        ...(newFeatured !== undefined ? { featured: newFeatured } : {}),
        ...(newVerified !== undefined ? { verified: newVerified } : {}),
      }),
    });
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Metin2Button className="text-sm" onClick={() => updateStatus("APPROVED")}>
        Approve
      </Metin2Button>
      <Metin2Button className="text-sm" variant="ghost" onClick={() => updateStatus("REJECTED")}>
        Reject
      </Metin2Button>
      <Metin2Button className="text-sm" variant="ghost" onClick={() => updateStatus("SUSPENDED")}>
        Suspend
      </Metin2Button>
      <Metin2Button
        className="text-sm"
        variant="gold"
        onClick={() => updateStatus(undefined, !featured)}
      >
        {featured ? "Unfeature" : "Feature"}
      </Metin2Button>
      {verified !== undefined && (
        <Metin2Button
          className="text-sm"
          variant="ghost"
          onClick={() => updateStatus(undefined, undefined, !verified)}
        >
          {verified ? "Unverify" : "Verify"}
        </Metin2Button>
      )}
    </div>
  );
}

/** @deprecated Use ServerStatusActions */
export const ListingStatusActions = ServerStatusActions;

export function ReportStatusActions({ reportId }: { reportId: string }) {
  const router = useRouter();

  async function updateStatus(status: string) {
    await fetch(`/api/admin/reports/${reportId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Metin2Button className="text-sm" variant="ghost" onClick={() => updateStatus("REVIEWING")}>
        Reviewing
      </Metin2Button>
      <Metin2Button className="text-sm" variant="ghost" onClick={() => updateStatus("DISMISSED")}>
        Dismiss
      </Metin2Button>
      <Metin2Button className="text-sm" onClick={() => updateStatus("RESOLVED")}>
        Resolved
      </Metin2Button>
    </div>
  );
}

export function DeleteCommentButton({ commentId }: { commentId: string }) {
  const router = useRouter();

  async function handleDelete() {
    await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <Metin2Button className="text-sm" variant="ghost" onClick={handleDelete}>
      Delete
    </Metin2Button>
  );
}
