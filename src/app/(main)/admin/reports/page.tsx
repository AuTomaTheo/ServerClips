import { requireModerator } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Metin2Frame } from "@/components/metin2/metin2-frame";
import { Metin2Badge } from "@/components/metin2/metin2-badge";
import { ReportStatusActions } from "@/components/admin/admin-actions";

export const metadata = { title: "Admin — Reports" };

async function resolveReportTargets(
  reports: {
    id: string;
    targetType: string;
    targetId: string;
    reason: string;
    details: string | null;
    status: string;
    reporter: { username: string | null; email: string } | null;
  }[]
) {
  const videoIds = reports.filter((r) => r.targetType === "VIDEO").map((r) => r.targetId);
  const serverIds = reports.filter((r) => r.targetType === "SERVER").map((r) => r.targetId);
  const commentIds = reports.filter((r) => r.targetType === "COMMENT").map((r) => r.targetId);
  const userIds = reports.filter((r) => r.targetType === "USER").map((r) => r.targetId);

  const [videos, servers, comments, users] = await Promise.all([
    videoIds.length
      ? prisma.video.findMany({ where: { id: { in: videoIds } }, select: { id: true, title: true } })
      : [],
    serverIds.length
      ? prisma.server.findMany({ where: { id: { in: serverIds } }, select: { id: true, name: true, slug: true } })
      : [],
    commentIds.length
      ? prisma.comment.findMany({ where: { id: { in: commentIds } }, select: { id: true, body: true } })
      : [],
    userIds.length
      ? prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, username: true, displayName: true },
        })
      : [],
  ]);

  const videoMap = new Map(videos.map((v) => [v.id, v]));
  const serverMap = new Map(servers.map((s) => [s.id, s]));
  const commentMap = new Map(comments.map((c) => [c.id, c]));
  const userMap = new Map(users.map((u) => [u.id, u]));

  return reports.map((report) => ({
    ...report,
    video: report.targetType === "VIDEO" ? videoMap.get(report.targetId) : undefined,
    server: report.targetType === "SERVER" ? serverMap.get(report.targetId) : undefined,
    comment: report.targetType === "COMMENT" ? commentMap.get(report.targetId) : undefined,
    user: report.targetType === "USER" ? userMap.get(report.targetId) : undefined,
  }));
}

export default async function AdminReportsPage() {
  await requireModerator();
  const reports = await prisma.report.findMany({
    where: { status: { in: ["OPEN", "REVIEWING"] } },
    include: {
      reporter: { select: { username: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const enriched = await resolveReportTargets(reports);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-metin2-gold">Open Reports</h1>
      <div className="space-y-3">
        {enriched.length === 0 ? (
          <p className="text-metin2-parchment/60">No open reports.</p>
        ) : (
          enriched.map((report) => (
            <Metin2Frame key={report.id}>
              <div className="mb-2 flex gap-2">
                <Metin2Badge variant="red">{report.reason}</Metin2Badge>
                <Metin2Badge>{report.targetType}</Metin2Badge>
                <span className="text-xs text-[#6b5a40]">
                  by {report.reporter?.username ?? report.reporter?.email ?? "Anonymous"}
                </span>
              </div>
              {report.video && <p className="text-sm">Video: {report.video.title}</p>}
              {report.server && <p className="text-sm">Server: {report.server.name}</p>}
              {report.comment && (
                <p className="text-sm text-[#4a3020]">Comment: {report.comment.body.slice(0, 100)}</p>
              )}
              {report.user && (
                <p className="text-sm">
                  User: @{report.user.username ?? report.user.displayName}
                </p>
              )}
              {report.details && <p className="mt-1 text-sm text-[#4a3020]">{report.details}</p>}
              <div className="mt-3">
                <ReportStatusActions reportId={report.id} />
              </div>
            </Metin2Frame>
          ))
        )}
      </div>
    </div>
  );
}
