import Link from "next/link";
import { requireModerator } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Metin2Frame } from "@/components/metin2/metin2-frame";
import { VideoModerationActions } from "@/components/admin/video-moderation-actions";
import { Metin2Badge } from "@/components/metin2/metin2-badge";
import { cn } from "@/lib/utils";

const FILTERS = [
  { label: "All", value: undefined },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Suspended", value: "SUSPENDED" },
] as const;

export const metadata = { title: "Admin — Videos" };

export default async function AdminVideosPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  await requireModerator();
  const status = searchParams.status as "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED" | undefined;

  const videos = await prisma.video.findMany({
    where: status ? { status } : undefined,
    include: {
      creator: { select: { username: true, displayName: true } },
      server: { select: { name: true } },
      _count: { select: { comments: true, likes: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const reportCounts =
    videos.length > 0
      ? await prisma.report.groupBy({
          by: ["targetId"],
          where: {
            targetType: "VIDEO",
            targetId: { in: videos.map((v) => v.id) },
            status: { in: ["OPEN", "REVIEWING"] },
          },
          _count: true,
        })
      : [];

  const reportCountMap = new Map(reportCounts.map((r) => [r.targetId, r._count]));

  return (
    <div>
      <h1 className="mb-4 font-display text-2xl font-bold text-metin2-gold">Videos</h1>
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.label}
            href={f.value ? `/admin/videos?status=${f.value}` : "/admin/videos"}
            className={cn(
              "rounded border px-3 py-1.5 text-xs font-medium",
              (status ?? undefined) === f.value
                ? "metin2-feed-badge"
                : "metin2-feed-badge-muted"
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>
      <div className="space-y-3">
        {videos.map((video) => {
          const reports = reportCountMap.get(video.id) ?? 0;
          return (
            <Metin2Frame key={video.id} title={video.title}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-[#6b5a40]">
                    by @{video.creator.username} · {video.server?.name ?? "No server"}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Metin2Badge variant={video.status === "APPROVED" ? "gold" : "red"}>{video.status}</Metin2Badge>
                    {reports > 0 && <Metin2Badge variant="red">{reports} reports</Metin2Badge>}
                  </div>
                </div>
                <VideoModerationActions videoId={video.id} status={video.status} />
              </div>
            </Metin2Frame>
          );
        })}
      </div>
    </div>
  );
}
