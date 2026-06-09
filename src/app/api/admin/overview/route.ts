import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canModerateContent } from "@/lib/permissions";

export async function GET() {
  const session = await auth();
  if (!session?.user || !canModerateContent(session.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsers,
    totalVideos,
    pendingVideos,
    totalServers,
    pendingServers,
    openReports,
    removedContent,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.video.count(),
    prisma.video.count({ where: { status: "PENDING" } }),
    prisma.server.count(),
    prisma.server.count({ where: { status: "PENDING" } }),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.video.count({
      where: { status: { in: ["SUSPENDED", "DELETED", "REJECTED"] } },
    }),
  ]);

  return NextResponse.json({
    totalUsers,
    newUsers,
    totalVideos,
    pendingVideos,
    totalServers,
    pendingServers,
    openReports,
    removedContent,
  });
}
