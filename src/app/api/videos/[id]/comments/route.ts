import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { commentSchema } from "@/lib/validators/video";
import { sanitizeText } from "@/lib/sanitize";
import { incrementVideoMetric } from "@/lib/analytics";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const comments = await prisma.comment.findMany({
    where: { videoId: params.id, status: "VISIBLE" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          displayName: true,
          username: true,
          avatarUrl: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(comments);
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const video = await prisma.video.findUnique({ where: { id: params.id } });
  if (!video || video.status !== "APPROVED") {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  const comment = await prisma.comment.create({
    data: {
      userId: session.user.id,
      videoId: params.id,
      body: sanitizeText(parsed.data.body),
      status: "VISIBLE",
    },
    include: {
      user: {
        select: { id: true, name: true, displayName: true, username: true },
      },
    },
  });

  await incrementVideoMetric(params.id, "comments", 1);

  return NextResponse.json(comment, { status: 201 });
}
