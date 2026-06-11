import Link from "next/link";
import { requireModerator } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { AdminPageTitle } from "@/components/admin/admin-ui";

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
      <AdminPageTitle title="Admin Overview" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const card = (
            <div className="app-card p-4 transition-colors hover:border-zinc-600">
              <p className="text-xs text-zinc-500">{s.label}</p>
              <p className="mt-1 text-2xl font-bold text-white">{s.value}</p>
            </div>
          );
          return s.href ? (
            <Link key={s.label} href={s.href} className="block">
              {card}
            </Link>
          ) : (
            <div key={s.label}>{card}</div>
          );
        })}
      </div>
    </div>
  );
}
