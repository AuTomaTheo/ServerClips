import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { commentReactionSchema } from "@/lib/validators/video";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = commentReactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const comment = await prisma.comment.findUnique({ where: { id: params.id } });
  if (!comment || comment.status !== "VISIBLE") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const existing = await prisma.commentReaction.findUnique({
    where: {
      userId_commentId: { userId: session.user.id, commentId: params.id },
    },
  });

  let userReaction: "LIKE" | "DISLIKE" | null = parsed.data.type;

  if (existing) {
    if (existing.type === parsed.data.type) {
      await prisma.commentReaction.delete({ where: { id: existing.id } });
      userReaction = null;
    } else {
      await prisma.commentReaction.update({
        where: { id: existing.id },
        data: { type: parsed.data.type },
      });
    }
  } else {
    await prisma.commentReaction.create({
      data: {
        userId: session.user.id,
        commentId: params.id,
        type: parsed.data.type,
      },
    });
  }

  const [likes, dislikes] = await Promise.all([
    prisma.commentReaction.count({
      where: { commentId: params.id, type: "LIKE" },
    }),
    prisma.commentReaction.count({
      where: { commentId: params.id, type: "DISLIKE" },
    }),
  ]);

  return NextResponse.json({ likes, dislikes, userReaction });
}
