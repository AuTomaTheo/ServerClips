import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { serverInclude, getServerMember } from "@/lib/servers";
import { absoluteUrl } from "@/lib/utils";
import { SERVER_TYPES } from "@/lib/constants";
import { canEditServerProfile, canBypassServerPermissions } from "@/lib/permissions";
import { VideoPlayer } from "@/components/servers/video-player";
import { LikeButton } from "@/components/servers/like-button";
import { CommentsSection } from "@/components/servers/comments-section";
import { ReportDialog } from "@/components/reports/report-dialog";
import { Metin2Frame } from "@/components/metin2/metin2-frame";
import { Metin2Badge } from "@/components/metin2/metin2-badge";
import { Metin2Banner } from "@/components/metin2/metin2-banner";
import { Metin2Button } from "@/components/metin2/metin2-button";
import { MessageCircle, Pencil, Flag, BadgeCheck } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface PageProps {
  params: { slug: string };
}

function getServerTypeLabel(value: string) {
  return SERVER_TYPES.find((t) => t.value === value)?.label ?? value;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const server = await prisma.server.findUnique({ where: { slug: params.slug } });
  if (!server || server.status !== "APPROVED") return { title: "Server Not Found" };
  return {
    title: server.name,
    description: server.description.slice(0, 160),
    openGraph: { title: server.name, url: absoluteUrl(`/server/${server.slug}`) },
  };
}

export default async function ServerDetailPage({ params }: PageProps) {
  const session = await auth();
  const server = await prisma.server.findUnique({
    where: { slug: params.slug },
    include: {
      ...serverInclude,
      videos: {
        where: { status: "APPROVED", visibility: { in: ["PUBLIC", "UNLISTED"] } },
        include: {
          metrics: true,
          comments: {
            where: { status: "VISIBLE" },
            include: {
              user: {
                select: { id: true, name: true, displayName: true, image: true, username: true },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 50,
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!server) notFound();

  const member = session?.user
    ? await getServerMember(server.id, session.user.id)
    : null;
  const canEdit =
    !!session?.user &&
    (canBypassServerPermissions(session.user) || canEditServerProfile(member));
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";

  if (server.status !== "APPROVED" && !canEdit && !isAdmin) notFound();

  const primaryVideo = server.videos[0];
  let userLiked = false;
  if (session?.user && primaryVideo) {
    const like = await prisma.like.findUnique({
      where: { userId_videoId: { userId: session.user.id, videoId: primaryVideo.id } },
    });
    userLiked = !!like;
  }

  const ownerMember = server.members.find((m) => m.role === "OWNER");
  const ownerProfile = ownerMember?.user.username
    ? `/u/${ownerMember.user.username}`
    : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {server.status !== "APPROVED" && (
        <Metin2Frame variant="dark" className="mb-6">
          <p className="text-sm text-amber-200">Status: {server.status}</p>
        </Metin2Frame>
      )}

      <Metin2Frame title={server.name} className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {server.verified && (
            <span className="inline-flex items-center gap-1 text-sm text-metin2-gold">
              <BadgeCheck className="h-4 w-4" /> Verified
            </span>
          )}
        </div>
        <p className="text-sm text-[#4a3020]">
          {ownerProfile ? (
            <>
              by{" "}
              <Link href={ownerProfile} className="font-semibold text-[#8b1a1a] hover:underline">
                @{ownerMember?.user.username}
              </Link>
              {" · "}
            </>
          ) : null}
          {server.videos.length} video{server.videos.length !== 1 ? "s" : ""}
        </p>
      </Metin2Frame>

      {server.websiteUrl && (
        <div className="mb-6">
          <Metin2Banner
            href={server.websiteUrl}
            label={`Visit ${server.name}`}
            sublabel="External website — no game client downloads on ServerClips"
          />
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {primaryVideo && server.status === "APPROVED" && (
          <>
            <LikeButton
              videoId={primaryVideo.id}
              initialLiked={userLiked}
              initialCount={primaryVideo.metrics?.likes ?? 0}
              isAuthenticated={!!session?.user}
            />
            <ReportDialog
              targetType="SERVER"
              targetId={server.id}
              trigger={
                <Metin2Button variant="ghost">
                  <Flag className="h-4 w-4" /> Report
                </Metin2Button>
              }
            />
          </>
        )}
        {canEdit && (
          <Metin2Button href={`/studio/servers/${server.id}/edit`} variant="gold">
            <Pencil className="h-4 w-4" /> Edit
          </Metin2Button>
        )}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Metin2Badge variant="red">{getServerTypeLabel(server.serverType)}</Metin2Badge>
        <Metin2Badge>{server.region}</Metin2Badge>
        <Metin2Badge>{server.language}</Metin2Badge>
        <Metin2Badge variant="gold">EXP {server.expRate}</Metin2Badge>
        {server.launchDate && (
          <Metin2Badge>Launch {format(server.launchDate, "MMM d, yyyy")}</Metin2Badge>
        )}
        {server.tags.map(({ tag }) => (
          <Metin2Badge key={tag.id} variant="gold">#{tag.name}</Metin2Badge>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {server.videos.map((video) => (
            <Metin2Frame key={video.id} title={video.title} flush>
              <VideoPlayer src={video.videoUrl} poster={video.thumbnailUrl ?? undefined} />
            </Metin2Frame>
          ))}

          <Metin2Frame title="About">
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-metin2-ink">
              {server.description}
            </div>
          </Metin2Frame>
        </div>

        <div className="space-y-4">
          <Metin2Frame title="Server Info" variant="wood">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-metin2-wood/50 pb-2">
                <dt className="text-metin2-parchment/70">Videos</dt>
                <dd>{server.videos.length}</dd>
              </div>
              {primaryVideo && (
                <>
                  <div className="flex justify-between border-b border-metin2-wood/50 pb-2">
                    <dt className="text-metin2-parchment/70">Views</dt>
                    <dd>{primaryVideo.metrics?.views ?? 0}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-metin2-parchment/70">Likes</dt>
                    <dd>{primaryVideo.metrics?.likes ?? 0}</dd>
                  </div>
                </>
              )}
            </dl>
          </Metin2Frame>

          {server.discordUrl && (
            <Metin2Button href={server.discordUrl} external variant="primary" className="w-full">
              <MessageCircle className="h-4 w-4" /> Join Discord
            </Metin2Button>
          )}
          <Metin2Button href="/" variant="ghost" className="w-full">← Back to Feed</Metin2Button>
        </div>
      </div>

      {primaryVideo && server.status === "APPROVED" && (
        <div className="mt-8">
          <Metin2Frame title="Comments">
            <CommentsSection
              videoId={primaryVideo.id}
              initialComments={primaryVideo.comments.map((c) => ({
                ...c,
                createdAt: c.createdAt.toISOString(),
              }))}
              currentUserId={session?.user?.id}
              isAdmin={!!isAdmin}
              isAuthenticated={!!session?.user}
            />
          </Metin2Frame>
        </div>
      )}
    </div>
  );
}
