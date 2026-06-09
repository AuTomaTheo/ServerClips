import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { incrementVideoMetric } from "@/lib/analytics";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const video = await prisma.video.findFirst({
    where: { id: params.id, status: "APPROVED" },
    select: { id: true },
  });

  if (!video) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  await incrementVideoMetric(params.id, "shares", 1);

  const metric = await prisma.videoMetric.findUnique({
    where: { videoId: params.id },
    select: { shares: true },
  });

  return NextResponse.json({ shareCount: metric?.shares ?? 0 });
}
