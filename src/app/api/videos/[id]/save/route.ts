import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { incrementVideoMetric } from "@/lib/analytics";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const video = await prisma.video.findUnique({ where: { id: params.id } });
  if (!video || video.status !== "APPROVED") {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  const existing = await prisma.save.findUnique({
    where: {
      userId_videoId: { userId: session.user.id, videoId: params.id },
    },
  });

  if (existing) {
    await prisma.save.delete({ where: { id: existing.id } });
    await incrementVideoMetric(params.id, "saves", -1);
  } else {
    await prisma.save.create({
      data: { userId: session.user.id, videoId: params.id },
    });
    await incrementVideoMetric(params.id, "saves", 1);
  }

  const metric = await prisma.videoMetric.findUnique({
    where: { videoId: params.id },
    select: { saves: true },
  });

  return NextResponse.json({ saved: !existing, count: metric?.saves ?? 0 });
}
