import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/permissions";
import { createAuditLog } from "@/lib/audit";
import { Role, UserStatus } from "@/generated/prisma/client";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user || !canAccessAdmin(session.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      videos: { take: 20, orderBy: { createdAt: "desc" } },
      serverMembers: {
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { server: { select: { id: true, name: true, slug: true, status: true } } },
      },
      _count: {
        select: {
          followers: true,
          following: true,
          comments: true,
          reports: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { passwordHash, ...safe } = user;
  void passwordHash;
  return NextResponse.json(safe);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user || !canAccessAdmin(session.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { action, reason, role, status } = body as {
    action?: string;
    reason?: string;
    role?: Role;
    status?: UserStatus;
  };

  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};

  switch (action) {
    case "warn":
      updates.status = "WARNED";
      break;
    case "suspend":
      updates.status = "SUSPENDED";
      break;
    case "ban":
      updates.status = "BANNED";
      break;
    case "unban":
      updates.status = "ACTIVE";
      break;
    case "change_role":
      if (role) updates.role = role;
      break;
    case "delete_avatar":
      updates.avatarUrl = null;
      break;
    case "delete_banner":
      updates.bannerUrl = null;
      break;
    default:
      if (status) updates.status = status;
      if (role) updates.role = role;
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: updates,
  });

  await createAuditLog({
    adminId: session.user.id,
    action: action ? `USER_${action.toUpperCase()}` : "USER_UPDATE",
    targetType: "user",
    targetId: params.id,
    reason,
    metadata: updates,
    impersonatedUserId: session.impersonatingUserId,
  });

  const { passwordHash, ...safe } = updated;
  void passwordHash;
  return NextResponse.json(safe);
}
