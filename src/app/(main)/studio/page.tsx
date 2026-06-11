import Link from "next/link";
import { requireCreator } from "@/lib/auth/session";
import { canModerateContent } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { format } from "date-fns";
import { Plus, Server } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = { title: "Studio" };

function StatusBadge({ status }: { status: string }) {
  const colors =
    status === "APPROVED"
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
      : status === "PENDING"
        ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
        : "bg-red-500/15 text-red-400 border-red-500/30";
  return (
    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase", colors)}>
      {status}
    </span>
  );
}

export default async function StudioPage() {
  const user = await requireCreator();

  const [videos, memberships] = await Promise.all([
    prisma.video.findMany({
      where: { creatorId: user.id },
      include: {
        server: { select: { name: true, slug: true } },
        metrics: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.serverMember.findMany({
      where: { userId: user.id },
      include: { server: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const totalViews = videos.reduce((s, v) => s + (v.metrics?.views ?? 0), 0);
  const totalLikes = videos.reduce((s, v) => s + (v.metrics?.likes ?? 0), 0);
  const pendingCount = videos.filter((v) => v.status === "PENDING").length;
  const isModerator = canModerateContent(user);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Studio</h1>
          <p className="text-zinc-500">Manage videos, servers, and analytics</p>
        </div>
        <div className="flex gap-2">
          <Link href="/studio/videos/new" className={cn(buttonVariants())}>
            <Plus className="h-4 w-4" /> Upload video
          </Link>
          <Link href="/studio/servers/new" className={cn(buttonVariants({ variant: "secondary" }))}>
            <Server className="h-4 w-4" /> New server
          </Link>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total views", value: totalViews },
          { label: "Total likes", value: totalLikes },
          { label: "Videos", value: videos.length },
          { label: "Servers", value: memberships.length },
        ].map((s) => (
          <div key={s.label} className="app-card p-4">
            <p className="text-xs text-zinc-500">{s.label}</p>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {pendingCount > 0 && (
        <div className="app-card mb-6 p-4">
          <p className="text-sm text-zinc-400">
            {pendingCount} video{pendingCount !== 1 ? "s" : ""} awaiting moderation.
          </p>
          {isModerator && (
            <Link
              href="/admin/videos?status=PENDING"
              className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "mt-3")}
            >
              Review pending videos
            </Link>
          )}
        </div>
      )}

      <h2 className="app-section-title mb-4">Your Videos</h2>
      <div className="mb-10 space-y-3">
        {videos.length === 0 ? (
          <div className="app-card p-6 text-sm text-zinc-500">No videos yet.</div>
        ) : (
          videos.map((video) => (
            <div key={video.id} className="app-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-white">{video.title}</p>
                  <p className="text-sm text-zinc-500">
                    {video.server ? video.server.name : "No server"} ·{" "}
                    Updated {format(video.updatedAt, "MMM d, yyyy")}
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {video.metrics?.views ?? 0} views · {video.metrics?.likes ?? 0} likes ·{" "}
                    {video.metrics?.comments ?? 0} comments · {video.metrics?.saves ?? 0} saves
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={video.status} />
                  <Link
                    href={`/studio/videos/${video.id}/edit`}
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <h2 className="app-section-title mb-4">Server Profiles</h2>
      <div className="space-y-3">
        {memberships.length === 0 ? (
          <div className="app-card p-6 text-sm text-zinc-500">No server profiles yet.</div>
        ) : (
          memberships.map(({ server, role }) => (
            <div key={server.id} className="app-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-white">{server.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <StatusBadge status={server.status} />
                    <span className="text-xs text-zinc-500">{role}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {server.status === "APPROVED" && (
                    <Link
                      href={`/server/${server.slug}`}
                      className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                    >
                      View
                    </Link>
                  )}
                  <Link
                    href={`/studio/servers/${server.id}/edit`}
                    className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
                  >
                    Edit
                  </Link>
                  <Link
                    href="/server-dashboard"
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                  >
                    Dashboard
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
