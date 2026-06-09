import { requireCreator } from "@/lib/auth/session";
import { canModerateContent } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { Metin2Frame } from "@/components/metin2/metin2-frame";
import { Metin2Button } from "@/components/metin2/metin2-button";
import { Metin2Badge } from "@/components/metin2/metin2-badge";
import { format } from "date-fns";
import { Plus, Server } from "lucide-react";

export const metadata = { title: "Studio" };

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
          <h1 className="font-display text-3xl font-bold text-metin2-gold">Studio</h1>
          <p className="text-metin2-parchment/70">Manage videos, servers, and analytics</p>
        </div>
        <div className="flex gap-2">
          <Metin2Button href="/studio/videos/new">
            <Plus className="h-4 w-4" /> Upload video
          </Metin2Button>
          <Metin2Button href="/studio/servers/new" variant="gold">
            <Server className="h-4 w-4" /> New server
          </Metin2Button>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total views", value: totalViews },
          { label: "Total likes", value: totalLikes },
          { label: "Videos", value: videos.length },
          { label: "Servers", value: memberships.length },
        ].map((s) => (
          <Metin2Frame key={s.label} variant="wood">
            <p className="text-xs text-metin2-parchment/60">{s.label}</p>
            <p className="text-2xl font-bold text-metin2-gold">{s.value}</p>
          </Metin2Frame>
        ))}
      </div>

      {pendingCount > 0 && (
        <Metin2Frame variant="wood" className="mb-6">
          <p className="text-sm text-[#4a3020]">
            {pendingCount} video{pendingCount !== 1 ? "s" : ""} awaiting moderation.
          </p>
          {isModerator && (
            <Metin2Button href="/admin/videos?status=PENDING" variant="gold" className="mt-3 text-sm">
              Review pending videos
            </Metin2Button>
          )}
        </Metin2Frame>
      )}

      <h2 className="mb-4 font-display text-xl text-metin2-gold">Your Videos</h2>
      <div className="mb-10 space-y-3">
        {videos.length === 0 ? (
          <Metin2Frame><p className="text-[#4a3020]">No videos yet.</p></Metin2Frame>
        ) : (
          videos.map((video) => (
            <Metin2Frame key={video.id} title={video.title}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-[#6b5a40]">
                    {video.server ? video.server.name : "No server"} ·{" "}
                    Updated {format(video.updatedAt, "MMM d, yyyy")}
                  </p>
                  <p className="mt-1 text-sm text-[#4a3020]">
                    {video.metrics?.views ?? 0} views · {video.metrics?.likes ?? 0} likes ·{" "}
                    {video.metrics?.comments ?? 0} comments · {video.metrics?.saves ?? 0} saves
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Metin2Badge variant={video.status === "APPROVED" ? "gold" : video.status === "PENDING" ? "default" : "red"}>
                    {video.status}
                  </Metin2Badge>
                  <Metin2Button href={`/studio/videos/${video.id}/edit`} variant="ghost" className="text-sm">Edit</Metin2Button>
                </div>
              </div>
            </Metin2Frame>
          ))
        )}
      </div>

      <h2 className="mb-4 font-display text-xl text-metin2-gold">Server Profiles</h2>
      <div className="space-y-3">
        {memberships.map(({ server, role }) => (
          <Metin2Frame key={server.id} title={server.name}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Metin2Badge>{server.status}</Metin2Badge>
              <span className="text-xs text-[#6b5a40]">{role}</span>
              <div className="flex gap-2">
                {server.status === "APPROVED" && (
                  <Metin2Button href={`/server/${server.slug}`} variant="ghost" className="text-sm">View</Metin2Button>
                )}
                <Metin2Button href={`/studio/servers/${server.id}/edit`} variant="gold" className="text-sm">Edit</Metin2Button>
                <Metin2Button href="/server-dashboard" variant="ghost" className="text-sm">Dashboard</Metin2Button>
              </div>
            </div>
          </Metin2Frame>
        ))}
      </div>
    </div>
  );
}
