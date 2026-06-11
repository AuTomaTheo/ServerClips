import { ContentStatus, Prisma, VideoVisibility } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { FeedFilters, FeedItem, FeedMetrics } from "@/types/feed";
import { buildFeedWhere } from "@/lib/search-ranking";

const emptyMetrics = (): FeedMetrics => ({
  views: 0,
  uniqueViews: 0,
  likes: 0,
  comments: 0,
  saves: 0,
  shares: 0,
  serverClicks: 0,
  profileClicks: 0,
  averageWatchSeconds: 0,
  completionRate: 0,
});

export const videoInclude = {
  creator: {
    select: {
      id: true,
      username: true,
      displayName: true,
      name: true,
      avatarUrl: true,
      image: true,
      status: true,
    },
  },
  server: {
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      bannerUrl: true,
      websiteUrl: true,
      discordUrl: true,
      originCountry: true,
      mainLanguage: true,
      supportedLanguages: true,
      schoolType: true,
      gameplayDifficulty: true,
      maxLevel: true,
      launchDate: true,
      featured: true,
      verified: true,
      verificationStatus: true,
      status: true,
      systemAlchemy: true,
      systemScarf: true,
      systemLycan: true,
      systemBonus67: true,
      systemOfflineShop: true,
      systemCostume: true,
      systemPet: true,
      systemMount: true,
      systemBattlePass: true,
      systemDungeonRanking: true,
      systemElement: true,
      systemTalisman: true,
      otherSystems: true,
      tags: { include: { tag: true } },
    },
  },
  metrics: true,
} as const;

export type VideoWithIncludes = Prisma.VideoGetPayload<{ include: typeof videoInclude }>;

export function publicVideoWhere(): Prisma.VideoWhereInput {
  return {
    status: "APPROVED",
    visibility: "PUBLIC",
    creator: { status: { in: ["ACTIVE", "WARNED"] } },
  };
}

export function buildVideoFeedWhere(filters: FeedFilters): Prisma.VideoWhereInput {
  const { where } = buildFeedWhere(filters);
  if (filters.q) {
    return {
      AND: [
        where,
        {
          OR: [
            { title: { contains: filters.q, mode: "insensitive" } },
            { description: { contains: filters.q, mode: "insensitive" } },
            { creator: { username: { contains: filters.q, mode: "insensitive" } } },
            { server: { name: { contains: filters.q, mode: "insensitive" } } },
            {
              server: {
                tags: { some: { tag: { name: { contains: filters.q, mode: "insensitive" } } } },
              },
            },
          ],
        },
      ],
    };
  }
  return where;
}

export async function getUserVideoEngagement(
  userId: string,
  videoIds: string[]
): Promise<{ likedIds: Set<string>; savedIds: Set<string> }> {
  if (videoIds.length === 0) {
    return { likedIds: new Set(), savedIds: new Set() };
  }

  const [likes, saves] = await Promise.all([
    prisma.like.findMany({
      where: { userId, videoId: { in: videoIds } },
      select: { videoId: true },
    }),
    prisma.save.findMany({
      where: { userId, videoId: { in: videoIds } },
      select: { videoId: true },
    }),
  ]);

  return {
    likedIds: new Set(likes.map((l) => l.videoId)),
    savedIds: new Set(saves.map((s) => s.videoId)),
  };
}

function mapMetrics(metrics: VideoWithIncludes["metrics"]): FeedMetrics {
  if (!metrics) return emptyMetrics();
  return {
    views: metrics.views,
    uniqueViews: metrics.uniqueViews,
    likes: metrics.likes,
    comments: metrics.comments,
    saves: metrics.saves,
    shares: metrics.shares,
    serverClicks: metrics.serverClicks,
    profileClicks: metrics.profileClicks,
    averageWatchSeconds: metrics.averageWatchSeconds,
    completionRate: metrics.completionRate,
  };
}

export function mapVideoToFeedItem(
  video: VideoWithIncludes,
  engagement: {
    liked: boolean;
    saved: boolean;
    following: boolean;
    followingServer?: boolean;
  }
): FeedItem {
  const server = video.server;
  return {
    id: video.id,
    title: video.title,
    description: video.description ?? "",
    videoUrl: video.videoUrl,
    thumbnailUrl: video.thumbnailUrl,
    metrics: mapMetrics(video.metrics),
    liked: engagement.liked,
    saved: engagement.saved,
    following: engagement.following,
    followingServer: engagement.followingServer ?? false,
    creator: {
      id: video.creator.id,
      username: video.creator.username,
      displayName: video.creator.displayName ?? video.creator.name,
      avatarUrl: video.creator.avatarUrl ?? video.creator.image,
    },
    server: server
      ? {
          id: server.id,
          name: server.name,
          slug: server.slug,
          logoUrl: server.logoUrl,
          bannerUrl: server.bannerUrl,
          websiteUrl: server.websiteUrl,
          discordUrl: server.discordUrl,
          originCountry: server.originCountry,
          mainLanguage: server.mainLanguage,
          supportedLanguages: server.supportedLanguages,
          schoolType: server.schoolType,
          gameplayDifficulty: server.gameplayDifficulty,
          maxLevel: server.maxLevel,
          launchDate: server.launchDate?.toISOString() ?? null,
          verified: server.verified,
          tags: server.tags.map((t) => t.tag.name),
          systemAlchemy: server.systemAlchemy,
          systemScarf: server.systemScarf,
          systemLycan: server.systemLycan,
          systemBonus67: server.systemBonus67,
          systemOfflineShop: server.systemOfflineShop,
          systemCostume: server.systemCostume,
          systemPet: server.systemPet,
          systemMount: server.systemMount,
          systemBattlePass: server.systemBattlePass,
          systemDungeonRanking: server.systemDungeonRanking,
          systemElement: server.systemElement,
          systemTalisman: server.systemTalisman,
          otherSystems: server.otherSystems,
        }
      : null,
  };
}

export function canViewVideo(
  video: { creatorId: string; visibility: VideoVisibility; status: ContentStatus },
  viewerId?: string
) {
  if (video.status === "APPROVED" && video.visibility === "PUBLIC") return true;
  if (!viewerId) return false;
  if (video.creatorId === viewerId) return true;
  if (video.visibility === "UNLISTED" && video.status === "APPROVED") return true;
  return false;
}
