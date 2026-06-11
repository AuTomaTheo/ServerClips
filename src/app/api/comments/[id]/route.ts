import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canModerateContent } from "@/lib/permissions";
import { createAuditLog } from "@/lib/audit";
import { incrementVideoMetric } from "@/lib/analytics";
import { softDeleteCommentTree } from "@/lib/comments";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const comment = await prisma.comment.findUnique({
    where: { id: params.id },
  });

  if (!comment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner = comment.userId === session.user.id;
  const isMod = canModerateContent(session.user);

  if (!isOwner && !isMod) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (comment.status !== "DELETED") {
    const deletedCount = await softDeleteCommentTree(comment.id, comment.videoId);
    await incrementVideoMetric(comment.videoId, "comments", -deletedCount);
  }

  if (isMod && !isOwner) {
    await createAuditLog({
      adminId: session.user.id,
      action: "COMMENT_DELETE",
      targetType: "comment",
      targetId: params.id,
    });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user || !canModerateContent(session.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const comment = await prisma.comment.findUnique({ where: { id: params.id } });
  if (!comment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const wasDeleted = comment.status === "DELETED";

  await prisma.comment.update({
    where: { id: params.id },
    data: { status: "VISIBLE" },
  });

  if (wasDeleted) {
    await incrementVideoMetric(comment.videoId, "comments", 1);
  }

  await createAuditLog({
    adminId: session.user.id,
    action: "COMMENT_RESTORE",
    targetType: "comment",
    targetId: params.id,
  });

  return NextResponse.json({ success: true });
}
