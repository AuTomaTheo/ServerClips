import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serverSubmissionSchema } from "@/lib/validators/server-submission";
import { generateUniqueSlug, getServerMember, serverDataFromSubmission } from "@/lib/servers";
import { canEditServerProfile, canBypassServerPermissions } from "@/lib/permissions";

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
  const parsed = serverSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          parsed.error.issues[0]?.message ??
          `Invalid ${parsed.error.issues[0]?.path?.join(".") ?? "input"}`,
      },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const slug =
    data.name !== server.name
      ? await generateUniqueSlug(data.name, server.id)
      : server.slug;

  const serverFields = serverDataFromSubmission(data);

  const updated = await prisma.server.update({
    where: { id: server.id },
    data: {
      ...serverFields,
      name: data.name,
      slug,
      ...(session.user.role !== "ADMIN" && session.user.role !== "MODERATOR"
        ? { status: "PENDING" as const }
        : {}),
    },
  });

  return NextResponse.json({ id: updated.id, slug: updated.slug });
}
