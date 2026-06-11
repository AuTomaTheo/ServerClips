import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serverSubmissionSchema } from "@/lib/validators/server-submission";
import { generateUniqueSlug, serverDataFromSubmission } from "@/lib/servers";
import { isCreator } from "@/lib/permissions";
import type { ServerMemberRole } from "@/generated/prisma/client";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCreator(session.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = serverSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue?.path?.join(".") ?? "input";
    const message =
      issue?.message && issue.message !== "Invalid input"
        ? issue.message
        : `Invalid ${field}`;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const data = parsed.data;
  const slug = await generateUniqueSlug(data.name);
  const serverFields = serverDataFromSubmission(data);

  const server = await prisma.$transaction(async (tx) => {
    const created = await tx.server.create({
      data: {
        ...serverFields,
        slug,
        status: "PENDING",
      },
    });

    await tx.serverMember.create({
      data: {
        serverId: created.id,
        userId: session.user.id,
        role: (data.memberRole ?? "OWNER") as ServerMemberRole,
      },
    });

    return created;
  });

  return NextResponse.json({ id: server.id, slug: server.slug });
}
