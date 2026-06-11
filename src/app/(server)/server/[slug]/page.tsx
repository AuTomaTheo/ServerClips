import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getServerMember } from "@/lib/servers";
import { absoluteUrl } from "@/lib/utils";
import { canEditServerProfile, canBypassServerPermissions } from "@/lib/permissions";
import { normalizeMediaUrl } from "@/lib/media-url";
import { ServerProfileView } from "@/components/servers/server-profile-view";
import { ServerProfileViewTracker } from "@/components/servers/server-profile-view-tracker";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const server = await prisma.server.findUnique({ where: { slug: params.slug } });
  if (!server || server.status !== "APPROVED") return { title: "Server Not Found" };
  return {
    title: server.name,
    description: server.description?.slice(0, 160) ?? `${server.name} on ServerClips`,
    openGraph: { title: server.name, url: absoluteUrl(`/server/${server.slug}`) },
  };
}

export default async function ServerDetailPage({ params }: PageProps) {
  const session = await auth();
  const server = await prisma.server.findUnique({
    where: { slug: params.slug },
    include: {
      videos: {
        where: { status: "APPROVED", visibility: { in: ["PUBLIC", "UNLISTED"] } },
        include: {
          metrics: true,
          creator: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      members: {
        include: {
          user: { select: { id: true, username: true } },
        },
      },
      _count: { select: { follows: true } },
    },
  });

  if (!server) notFound();

  const member = session?.user ? await getServerMember(server.id, session.user.id) : null;
  const canEdit =
    !!session?.user &&
    (canBypassServerPermissions(session.user) || canEditServerProfile(member));
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";
  const isMember = !!member;

  if (server.status !== "APPROVED" && !canEdit && !isAdmin) notFound();

  let isFollowing = false;
  if (session?.user) {
    const follow = await prisma.serverFollow.findUnique({
      where: {
        userId_serverId: { userId: session.user.id, serverId: server.id },
      },
    });
    isFollowing = !!follow;
  }

  const creatorStats = new Map<
    string,
    { views: number; creator: (typeof server.videos)[0]["creator"] }
  >();
  for (const video of server.videos) {
    const views = video.metrics?.views ?? 0;
    const existing = creatorStats.get(video.creatorId);
    if (existing) {
      existing.views += views;
    } else {
      creatorStats.set(video.creatorId, { views, creator: video.creator });
    }
  }

  const creatorIds = Array.from(creatorStats.keys());
  const followerCounts =
    creatorIds.length > 0
      ? await prisma.follow.groupBy({
          by: ["followingId"],
          where: { followingId: { in: creatorIds } },
          _count: { _all: true },
        })
      : [];
  const followerMap = new Map(followerCounts.map((f) => [f.followingId, f._count._all]));

  const topCreators = Array.from(creatorStats.entries())
    .map(([id, { views, creator }]) => ({
      id,
      username: creator.username,
      displayName: creator.displayName,
      avatarUrl: creator.avatarUrl ?? creator.image,
      followers: followerMap.get(id) ?? 0,
      totalViews: views,
    }))
    .sort((a, b) => b.totalViews - a.totalViews);

  const mediaUrls = [
    server.bannerUrl,
    server.logoUrl,
    ...server.videos.map((v) => v.thumbnailUrl).filter(Boolean),
  ]
    .map((url) => (url ? normalizeMediaUrl(url) : ""))
    .filter((url, i, arr): url is string => !!url && arr.indexOf(url) === i);

  const videos = server.videos.map((v) => ({
    id: v.id,
    title: v.title,
    thumbnailUrl: v.thumbnailUrl,
    duration: v.duration,
    views: v.metrics?.views ?? 0,
    creator: {
      id: v.creator.id,
      username: v.creator.username,
      displayName: v.creator.displayName,
      avatarUrl: v.creator.avatarUrl ?? v.creator.image,
    },
  }));

  return (
    <>
      {server.status === "APPROVED" && <ServerProfileViewTracker serverId={server.id} />}
      <ServerProfileView
        server={server}
        videos={videos}
        mediaUrls={mediaUrls}
        topCreators={topCreators}
        followerCount={server._count.follows}
        isFollowing={isFollowing}
        isAuthenticated={!!session?.user}
        canEdit={canEdit}
        isMember={isMember}
      />
    </>
  );
}
