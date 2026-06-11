"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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
      <Button size="sm" onClick={() => updateStatus("APPROVED")}>
        Approve
      </Button>
      <Button size="sm" variant="outline" onClick={() => updateStatus("REJECTED")}>
        Reject
      </Button>
      <Button size="sm" variant="outline" onClick={() => updateStatus("SUSPENDED")}>
        Suspend
      </Button>
      <Button size="sm" variant="secondary" onClick={() => updateStatus(undefined, !featured)}>
        {featured ? "Unfeature" : "Feature"}
      </Button>
      {verified !== undefined && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => updateStatus(undefined, undefined, !verified)}
        >
          {verified ? "Unverify" : "Verify"}
        </Button>
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
      <Button size="sm" variant="outline" onClick={() => updateStatus("REVIEWING")}>
        Reviewing
      </Button>
      <Button size="sm" variant="outline" onClick={() => updateStatus("DISMISSED")}>
        Dismiss
      </Button>
      <Button size="sm" onClick={() => updateStatus("RESOLVED")}>
        Resolved
      </Button>
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
    <Button size="sm" variant="ghost" onClick={handleDelete}>
      Delete
    </Button>
  );
}
