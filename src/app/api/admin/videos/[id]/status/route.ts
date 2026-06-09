import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canModerateContent } from "@/lib/permissions";
import { createAuditLog } from "@/lib/audit";
import { ContentStatus } from "@/generated/prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user || !canModerateContent(session.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { status, reason } = (await req.json()) as {
    status: ContentStatus;
    reason?: string;
  };

  const video = await prisma.video.update({
    where: { id: params.id },
    data: { status },
  });

  const actionMap: Record<string, string> = {
    APPROVED: "VIDEO_APPROVE",
    REJECTED: "VIDEO_REJECT",
    SUSPENDED: "VIDEO_SUSPEND",
    DELETED: "VIDEO_DELETE",
  };

  await createAuditLog({
    adminId: session.user.id,
    action: actionMap[status] ?? "VIDEO_UPDATE",
    targetType: "video",
    targetId: params.id,
    reason,
    metadata: { status },
    impersonatedUserId: session.impersonatingUserId,
  });

  return NextResponse.json(video);
}
