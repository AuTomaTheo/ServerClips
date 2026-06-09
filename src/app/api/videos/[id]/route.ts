import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { videoSchema } from "@/lib/validators/video";
import { canManageVideo } from "@/lib/auth/session";
import { canModerateContent } from "@/lib/permissions";
import { createAuditLog } from "@/lib/audit";
import { videoInclude, canViewVideo } from "@/lib/videos";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const video = await prisma.video.findUnique({
    where: { id: params.id },
    include: {
      ...videoInclude,
    },
  });

  if (!video) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!canViewVideo(video, session?.user?.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(video);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const video = await prisma.video.findUnique({ where: { id: params.id } });
  if (!video) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const canEdit =
    canManageVideo(session.user, video.creatorId) || canModerateContent(session.user);
  if (!canEdit) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = videoSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const updated = await prisma.video.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      description: parsed.data.description ?? undefined,
      serverId: parsed.data.serverId || undefined,
    },
  });

  if (canModerateContent(session.user) && session.user.id !== video.creatorId) {
    await createAuditLog({
      adminId: session.user.id,
      action: "VIDEO_UPDATE",
      targetType: "video",
      targetId: params.id,
      metadata: parsed.data,
    });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const video = await prisma.video.findUnique({ where: { id: params.id } });
  if (!video) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!canManageVideo(session.user, video.creatorId) && !canModerateContent(session.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.video.update({
    where: { id: params.id },
    data: { status: "DELETED" },
  });

  if (canModerateContent(session.user)) {
    await createAuditLog({
      adminId: session.user.id,
      action: "VIDEO_DELETE",
      targetType: "video",
      targetId: params.id,
    });
  }

  return NextResponse.json({ ok: true });
}
