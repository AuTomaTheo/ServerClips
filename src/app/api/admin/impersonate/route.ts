import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { canImpersonate } from "@/lib/permissions";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !canImpersonate(session.user) || session.impersonatedBy) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (target.role === "ADMIN") {
    return NextResponse.json({ error: "Cannot impersonate admins" }, { status: 400 });
  }

  await createAuditLog({
    adminId: session.user.id,
    action: "IMPERSONATION_START",
    targetType: "user",
    targetId: userId,
    impersonatedUserId: userId,
    metadata: { username: target.username },
  });

  return NextResponse.json({
    ok: true,
    impersonatingUserId: userId,
    message: "Call session.update with impersonatingUserId to activate",
  });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.impersonatedBy) {
    return NextResponse.json({ error: "Not impersonating" }, { status: 400 });
  }

  await createAuditLog({
    adminId: session.impersonatedBy,
    action: "IMPERSONATION_STOP",
    targetType: "user",
    targetId: session.user.id,
    impersonatedUserId: session.user.id,
  });

  return NextResponse.json({ ok: true });
}
