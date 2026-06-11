import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { profileSelect, getProfileStats, isFollowing } from "@/lib/users";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileTabs } from "@/components/profile/profile-tabs";

export async function generateMetadata({ params }: { params: { username: string } }) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: { displayName: true, username: true },
  });
  if (!user) return { title: "Profile Not Found" };
  return { title: `@${user.username} — ${user.displayName}` };
}

export default async function UserProfilePage({
  params,
  searchParams,
}: {
  params: { username: string };
  searchParams: { tab?: string };
}) {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: profileSelect,
  });

  if (!user || user.status === "BANNED") notFound();

  const isOwner = session?.user?.id === user.id;
  const stats = await getProfileStats(user.id);
  const following = session?.user
    ? await isFollowing(session.user.id, user.id)
    : false;

  const tab = searchParams.tab ?? "videos";

  const [videos, likedVideos, savedVideos, serverMemberships] = await Promise.all([
    prisma.video.findMany({
      where: isOwner
        ? { creatorId: user.id, status: { not: "DELETED" } }
        : { creatorId: user.id, status: "APPROVED", visibility: "PUBLIC" },
      select: {
        id: true,
        title: true,
        thumbnailUrl: true,
        status: true,
        metrics: { select: { views: true, likes: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    tab === "liked" && (user.likedVideosPublic || isOwner)
      ? prisma.video.findMany({
          where: {
            likes: { some: { userId: user.id } },
            status: "APPROVED",
            visibility: "PUBLIC",
          },
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
            metrics: { select: { views: true } },
            _count: { select: { likes: true } },
          },
          take: 50,
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
    tab === "saved" && (user.savedVideosPublic || isOwner)
      ? prisma.save.findMany({
          where: { userId: user.id },
          include: {
            video: {
              select: {
                id: true,
                title: true,
                thumbnailUrl: true,
                metrics: { select: { views: true } },
                _count: { select: { likes: true } },
              },
            },
          },
          take: 50,
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
    prisma.serverMember.findMany({
      where: { userId: user.id, server: { status: "APPROVED" } },
      include: {
        server: {
          select: {
            id: true,
            name: true,
            slug: true,
            schoolType: true,
            gameplayDifficulty: true,
            originCountry: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const servers = serverMemberships.map((m) => m.server);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <ProfileHeader
        user={user}
        stats={stats}
        isOwner={isOwner}
        following={following}
      />

      <ProfileTabs
        username={user.username!}
        activeTab={tab}
        isOwner={isOwner}
        likedPublic={user.likedVideosPublic}
        savedPublic={user.savedVideosPublic}
        videos={videos}
        likedVideos={likedVideos}
        savedVideos={savedVideos.map((s) => s.video)}
        servers={servers}
      />
    </div>
  );
}
