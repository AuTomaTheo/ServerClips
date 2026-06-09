import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listingSchema } from "@/lib/validators/listing";
import { generateUniqueSlug, syncServerTags } from "@/lib/servers";
import { sanitizeRichText } from "@/lib/sanitize";
import { isCreator } from "@/lib/permissions";
import type { ServerType } from "@/generated/prisma/client";

/** @deprecated Use /api/servers */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCreator(session.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = listingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const slug = await generateUniqueSlug(data.name);

  const server = await prisma.$transaction(async (tx) => {
    const created = await tx.server.create({
      data: {
        name: data.name,
        slug,
        description: sanitizeRichText(data.description),
        websiteUrl: data.websiteUrl || null,
        discordUrl: data.discordUrl || null,
        region: data.region,
        language: data.language,
        serverType: data.serverType as ServerType,
        expRate: data.expRate,
        yangRate: data.yangRate,
        dropRate: data.dropRate,
        launchDate: data.launchDate ? new Date(data.launchDate) : null,
        status: "PENDING",
      },
    });

    await tx.serverMember.create({
      data: {
        serverId: created.id,
        userId: session.user.id,
        role: "OWNER",
      },
    });

    return created;
  });

  if (data.tags) {
    await syncServerTags(server.id, data.tags);
  }

  return NextResponse.json({ id: server.id, slug: server.slug });
}
