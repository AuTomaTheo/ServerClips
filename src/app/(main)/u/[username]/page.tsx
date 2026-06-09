import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { profileSelect, getProfileStats, isFollowing } from "@/lib/users";
import { Metin2Frame } from "@/components/metin2/metin2-frame";
import { Metin2Button } from "@/components/metin2/metin2-button";
import { ProfileFollowButton } from "@/components/profile/profile-follow-button";
import { ProfileShareButton } from "@/components/profile/profile-share-button";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { formatNumber } from "@/lib/utils";

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
      where: {
        creatorId: user.id,
        status: "APPROVED",
        visibility: "PUBLIC",
      },
      include: {
        server: { select: { name: true, slug: true } },
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
          include: {
            metrics: { select: { views: true } },
            _count: { select: { likes: true } },
          },
          take: 30,
        })
      : Promise.resolve([]),
    tab === "saved" && (user.savedVideosPublic || isOwner)
      ? prisma.save.findMany({
          where: { userId: user.id },
          include: {
            video: {
              include: {
                metrics: { select: { views: true } },
                _count: { select: { likes: true } },
              },
            },
          },
          take: 30,
        })
      : Promise.resolve([]),
    prisma.serverMember.findMany({
      where: { userId: user.id, server: { status: "APPROVED" } },
      include: {
        server: {
          select: { id: true, name: true, slug: true, serverType: true, region: true },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const servers = serverMemberships.map((m) => m.server);
  const social = (user.socialLinks as Record<string, string> | null) ?? {};

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {user.bannerUrl && (
        <div className="relative mb-4 h-32 overflow-hidden rounded-lg border border-metin2-wood">
          <Image src={user.bannerUrl} alt="" fill className="object-cover" unoptimized />
        </div>
      )}

      <Metin2Frame>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-metin2-gold bg-metin2-wood">
            {user.avatarUrl ? (
              <Image src={user.avatarUrl} alt="" fill className="object-cover" unoptimized />
            ) : (
              <div className="flex h-full items-center justify-center text-2xl font-bold text-metin2-gold">
                {(user.displayName ?? user.username ?? "?")[0]}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold text-[#3d2814]">
              {user.displayName ?? user.username}
            </h1>
            <p className="text-sm text-[#6b5a40]">@{user.username}</p>
            {user.bio && <p className="mt-2 text-sm text-[#4a3020]">{user.bio}</p>}
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#4a3020]">
              <span><strong>{formatNumber(stats.followers)}</strong> followers</span>
              <span><strong>{formatNumber(stats.following)}</strong> following</span>
              <span><strong>{formatNumber(stats.totalLikes)}</strong> likes received</span>
            </div>
            {(user.websiteUrl || Object.values(social).some(Boolean)) && (
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {user.websiteUrl && (
                  <a href={user.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-[#8b1a1a] hover:underline">
                    Website
                  </a>
                )}
                {Object.entries(social).map(([k, v]) =>
                  v ? (
                    <a key={k} href={v} target="_blank" rel="noopener noreferrer" className="text-[#8b1a1a] hover:underline capitalize">
                      {k}
                    </a>
                  ) : null
                )}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {isOwner ? (
              <Metin2Button href="/account/edit" variant="gold">Edit profile</Metin2Button>
            ) : (
              <ProfileFollowButton username={user.username!} initialFollowing={following} />
            )}
            <ProfileShareButton username={user.username!} />
          </div>
        </div>
      </Metin2Frame>

      <div className="mt-6">
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
    </div>
  );
}
