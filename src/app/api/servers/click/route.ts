import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { trackServerClick } from "@/lib/analytics";
import {
  getOrCreateGuestSessionId,
  getGuestSessionIdFromRequest,
} from "@/lib/guest-session";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { serverId, videoId, clickType = "website" } = body as {
    serverId?: string;
    videoId?: string;
    clickType?: string;
  };

  if (!serverId) {
    return NextResponse.json({ error: "serverId required" }, { status: 400 });
  }

  const server = await prisma.server.findFirst({
    where: { id: serverId, status: "APPROVED" },
    select: { id: true },
  });

  if (!server) {
    return NextResponse.json({ error: "Server not found" }, { status: 404 });
  }

  const session = await auth();
  const userId = session?.user?.id;
  const sessionId = userId
    ? undefined
    : getGuestSessionIdFromRequest(req) ?? (await getOrCreateGuestSessionId());

  await trackServerClick({
    serverId,
    videoId,
    userId,
    sessionId,
    referrerSource: "FEED",
    clickType,
  });

  return NextResponse.json({ ok: true });
}
