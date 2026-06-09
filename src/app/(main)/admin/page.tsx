import Link from "next/link";
import { requireModerator } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Metin2Frame } from "@/components/metin2/metin2-frame";

export const metadata = { title: "Admin Overview" };

export default async function AdminOverviewPage() {
  await requireModerator();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalUsers, newUsers, totalVideos, pendingVideos, totalServers, pendingServers, openReports, removedContent] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.video.count(),
      prisma.video.count({ where: { status: "PENDING" } }),
      prisma.server.count(),
      prisma.server.count({ where: { status: "PENDING" } }),
      prisma.report.count({ where: { status: "OPEN" } }),
      prisma.video.count({ where: { status: { in: ["SUSPENDED", "DELETED", "REJECTED"] } } }),
    ]);

  const stats: { label: string; value: number; href?: string }[] = [
    { label: "Total users", value: totalUsers },
    { label: "New users (7d)", value: newUsers },
    { label: "Total videos", value: totalVideos, href: "/admin/videos" },
    { label: "Pending videos", value: pendingVideos, href: "/admin/videos?status=PENDING" },
    { label: "Total servers", value: totalServers, href: "/admin/servers" },
    { label: "Pending servers", value: pendingServers, href: "/admin/servers" },
    { label: "Open reports", value: openReports, href: "/admin/reports" },
    { label: "Removed content", value: removedContent },
  ];

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-bold text-metin2-gold">Admin Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const card = (
            <>
              <p className="text-xs text-metin2-parchment/60">{s.label}</p>
              <p className="text-2xl font-bold text-metin2-gold">{s.value}</p>
            </>
          );
          return s.href ? (
            <Link key={s.label} href={s.href} className="block transition-opacity hover:opacity-90">
              <Metin2Frame variant="wood">{card}</Metin2Frame>
            </Link>
          ) : (
            <Metin2Frame key={s.label} variant="wood">{card}</Metin2Frame>
          );
        })}
      </div>
    </div>
  );
}
