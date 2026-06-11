import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { commentSchema } from "@/lib/validators/video";
import { sanitizeText } from "@/lib/sanitize";
import { incrementVideoMetric } from "@/lib/analytics";
import { fetchVideoCommentTree } from "@/lib/comments";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const data = await fetchVideoCommentTree(params.id, session?.user?.id);
  return NextResponse.json(data);
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

  if (parsed.data.parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: parsed.data.parentId },
    });
    if (!parent || parent.videoId !== params.id || parent.status !== "VISIBLE") {
      return NextResponse.json({ error: "Parent comment not found" }, { status: 400 });
    }
  }

  const comment = await prisma.comment.create({
    data: {
      userId: session.user.id,
      videoId: params.id,
      parentId: parsed.data.parentId ?? null,
      body: sanitizeText(parsed.data.body),
      status: "VISIBLE",
    },
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
      reactions: { select: { type: true, userId: true } },
    },
  });

  await incrementVideoMetric(params.id, "comments", 1);

  return NextResponse.json(
    {
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt.toISOString(),
      parentId: comment.parentId,
      user: comment.user,
      likes: 0,
      dislikes: 0,
      userReaction: null,
      replies: [],
    },
    { status: 201 }
  );
}
