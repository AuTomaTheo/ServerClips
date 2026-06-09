import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canModerateContent } from "@/lib/permissions";
import { createAuditLog } from "@/lib/audit";
import { ContentStatus } from "@/generated/prisma/client";

/** @deprecated Use /api/admin/servers/[id]/status */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user || !canModerateContent(session.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { status, featured, verified, reason } = body as {
    status?: ContentStatus;
    featured?: boolean;
    verified?: boolean;
    reason?: string;
  };

  const server = await prisma.server.update({
    where: { id: params.id },
    data: {
      ...(status ? { status } : {}),
      ...(featured !== undefined ? { featured } : {}),
      ...(verified !== undefined ? { verified } : {}),
    },
  });

  await createAuditLog({
    adminId: session.user.id,
    action: status ? `SERVER_${status}` : "SERVER_UPDATE",
    targetType: "server",
    targetId: params.id,
    reason,
    metadata: { status, featured, verified },
    impersonatedUserId: session.impersonatingUserId,
  });

  return NextResponse.json(server);
}
