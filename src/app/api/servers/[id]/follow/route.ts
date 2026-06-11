import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const server = await prisma.server.findFirst({
    where: { id: params.id, status: "APPROVED" },
    select: { id: true },
  });

  if (!server) {
    return NextResponse.json({ error: "Server not found" }, { status: 404 });
  }

  const existing = await prisma.serverFollow.findUnique({
    where: {
      userId_serverId: {
        userId: session.user.id,
        serverId: server.id,
      },
    },
  });

  if (existing) {
    await prisma.serverFollow.delete({ where: { id: existing.id } });
  } else {
    await prisma.serverFollow.create({
      data: { userId: session.user.id, serverId: server.id },
    });
  }

  const followers = await prisma.serverFollow.count({ where: { serverId: server.id } });

  return NextResponse.json({ following: !existing, followers });
}
