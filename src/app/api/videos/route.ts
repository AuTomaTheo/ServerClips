import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { videoSchema } from "@/lib/validators/video";
import { isCreator, canManageServerVideos } from "@/lib/permissions";
import { getServerMember } from "@/lib/servers";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !isCreator(session.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = videoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const data = parsed.data;

  if (data.serverId) {
    const member = await getServerMember(data.serverId, session.user.id);
    if (!member || !canManageServerVideos(member)) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }
  }

  const video = await prisma.video.create({
    data: {
      creatorId: session.user.id,
      title: data.title,
      description: data.description || null,
      videoUrl: data.videoUrl,
      thumbnailUrl: data.thumbnailUrl || null,
      serverId: data.serverId || null,
      visibility: data.visibility,
      status: "PENDING",
      metrics: { create: {} },
    },
    include: { metrics: true },
  });

  return NextResponse.json(video, { status: 201 });
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const creatorId = searchParams.get("creatorId") ?? searchParams.get("ownerId") ?? session.user.id;

  if (creatorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const videos = await prisma.video.findMany({
    where: { creatorId },
    include: {
      server: { select: { name: true, slug: true } },
      metrics: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(videos);
}
