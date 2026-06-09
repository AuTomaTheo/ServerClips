import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { trackVideoView } from "@/lib/analytics";
import {
  getOrCreateGuestSessionId,
  getGuestSessionIdFromRequest,
} from "@/lib/guest-session";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const video = await prisma.video.findFirst({
    where: { id: params.id, status: "APPROVED", visibility: "PUBLIC" },
    select: { id: true },
  });

  if (!video) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  const session = await auth();
  let userId = session?.user?.id;
  if (userId) {
    const exists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!exists) userId = undefined;
  }
  const sessionId = userId
    ? undefined
    : getGuestSessionIdFromRequest(req) ?? (await getOrCreateGuestSessionId());

  let body: { watchSeconds?: number; completed?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    // optional body
  }

  await trackVideoView({
    videoId: params.id,
    userId,
    sessionId,
    watchSeconds: body.watchSeconds ?? 0,
    completed: body.completed ?? false,
    source: "FEED",
  });

  return NextResponse.json({ ok: true });
}
