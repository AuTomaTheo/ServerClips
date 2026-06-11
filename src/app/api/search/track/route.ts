import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { trackSearch } from "@/lib/analytics";
import { getOrCreateGuestSessionId } from "@/lib/guest-session";
import type { FeedFilters } from "@/types/feed";

export async function POST(req: Request) {
  const session = await auth();
  const body = (await req.json()) as { query?: string; filters?: FeedFilters };

  const sessionId = session?.user?.id
    ? undefined
    : await getOrCreateGuestSessionId();

  await trackSearch({
    userId: session?.user?.id,
    sessionId,
    query: body.query?.trim() || undefined,
    filters: (body.filters ?? undefined) as Prisma.InputJsonValue | undefined,
  });

  return NextResponse.json({ ok: true });
}
