import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listingSchema } from "@/lib/validators/listing";
import { generateUniqueSlug, syncServerTags, getServerMember } from "@/lib/servers";
import { canEditServerProfile, canBypassServerPermissions } from "@/lib/permissions";
import { sanitizeRichText } from "@/lib/sanitize";
import type { ServerType } from "@/generated/prisma/client";

/** @deprecated Use /api/servers/[id] */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const server = await prisma.server.findUnique({
    where: { id: params.id },
  });

  if (!server) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const member = await getServerMember(params.id, session.user.id);
  if (!canBypassServerPermissions(session.user) && !canEditServerProfile(member)) {
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
  const slug =
    data.name !== server.name
      ? await generateUniqueSlug(data.name, server.id)
      : server.slug;

  const updated = await prisma.server.update({
    where: { id: server.id },
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
      ...(session.user.role !== "ADMIN" && session.user.role !== "MODERATOR"
        ? { status: "PENDING" as const }
        : {}),
    },
  });

  if (data.tags !== undefined) {
    await syncServerTags(updated.id, data.tags);
  }

  return NextResponse.json({ id: updated.id, slug: updated.slug });
}
