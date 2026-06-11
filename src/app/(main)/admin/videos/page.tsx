import Link from "next/link";
import { Play } from "lucide-react";
import { requireModerator } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { mediaUrlForDisplay } from "@/lib/media-url";
import {
  AdminFilterTabs,
  AdminListCard,
  AdminPageTitle,
  AdminStatusBadge,
} from "@/components/admin/admin-ui";
import { VideoModerationActions } from "@/components/admin/video-moderation-actions";

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
  const status = searchParams.status as
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "SUSPENDED"
    | undefined;

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
      <AdminPageTitle
        title="Videos"
        description="Click a video to preview it in the feed player before approving."
      />
      <AdminFilterTabs
        items={FILTERS}
        activeValue={status}
        basePath="/admin/videos"
      />
      <div className="space-y-3">
        {videos.map((video) => {
          const reports = reportCountMap.get(video.id) ?? 0;
          const thumb = mediaUrlForDisplay(video.thumbnailUrl);

          return (
            <AdminListCard key={video.id}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <Link
                  href={`/watch/${video.id}?from=admin`}
                  className="flex min-w-0 flex-1 items-center gap-4"
                >
                  <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-900">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-zinc-800">
                        <Play className="h-5 w-5 text-zinc-500" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="h-6 w-6 text-white drop-shadow" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white hover:text-red-400">
                      {video.title}
                    </p>
                    <p className="text-sm text-zinc-400">
                      by @{video.creator.username} · {video.server?.name ?? "No server"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <AdminStatusBadge status={video.status} />
                      {reports > 0 && (
                        <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-red-400">
                          {reports} reports
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
                <VideoModerationActions videoId={video.id} status={video.status} />
              </div>
            </AdminListCard>
          );
        })}
      </div>
    </div>
  );
}
