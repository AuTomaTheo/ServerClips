import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRecommendedVideos } from "@/lib/recommendations";
import {
  mapVideoToFeedItem,
  getUserVideoEngagement,
} from "@/lib/videos";
import { prisma } from "@/lib/prisma";
import {
  getOrCreateGuestSessionId,
  getGuestSessionIdFromRequest,
} from "@/lib/guest-session";
import type { FeedFilters } from "@/types/feed";
import type { ServerSystemKey } from "@/lib/constants";

function parseSystemsParam(value: string | null): ServerSystemKey[] | undefined {
  if (!value) return undefined;
  const systems = value.split(",").filter(Boolean) as ServerSystemKey[];
  return systems.length > 0 ? systems : undefined;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filters: FeedFilters = {
    q: searchParams.get("q") ?? undefined,
    schoolType: searchParams.get("schoolType") ?? searchParams.get("serverType") ?? undefined,
    gameplayDifficulty: searchParams.get("gameplayDifficulty") ?? undefined,
    mainLanguage: searchParams.get("mainLanguage") ?? searchParams.get("language") ?? undefined,
    originCountry: searchParams.get("originCountry") ?? searchParams.get("region") ?? undefined,
    maxLevel: searchParams.get("maxLevel")
      ? parseInt(searchParams.get("maxLevel")!, 10)
      : undefined,
    systems: parseSystemsParam(searchParams.get("systems")),
    international: searchParams.get("international") === "true",
    launchingSoon: searchParams.get("launchingSoon") === "true",
    recentlyAdded: searchParams.get("recentlyAdded") === "true",
    verifiedOnly: searchParams.get("verifiedOnly") === "true",
    followingOnly: searchParams.get("following") === "true",
  };

  const cursor = searchParams.get("cursor") ?? undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 50);

  const session = await auth();
  const userId = session?.user?.id;
  const sessionId = userId
    ? undefined
    : getGuestSessionIdFromRequest(req) ?? (await getOrCreateGuestSessionId());

  const { videos, nextCursor, total } = await getRecommendedVideos({
    userId,
    sessionId,
    query: filters.q,
    filters,
    limit,
    cursor,
  });

  const videoIds = videos.map((v) => v.id);
  const creatorIds = Array.from(new Set(videos.map((v) => v.creatorId)));
  const serverIds = Array.from(
    new Set(videos.map((v) => v.serverId).filter(Boolean) as string[])
  );

  const { likedIds, savedIds } = userId
    ? await getUserVideoEngagement(userId, videoIds)
    : { likedIds: new Set<string>(), savedIds: new Set<string>() };

  let followingSet = new Set<string>();
  let followingServerSet = new Set<string>();

  if (userId && videos.length > 0) {
    const [follows, serverFollows] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: userId, followingId: { in: creatorIds } },
        select: { followingId: true },
      }),
      serverIds.length > 0
        ? prisma.serverFollow.findMany({
            where: { userId, serverId: { in: serverIds } },
            select: { serverId: true },
          })
        : Promise.resolve([]),
    ]);
    followingSet = new Set(follows.map((f) => f.followingId));
    followingServerSet = new Set(serverFollows.map((f) => f.serverId));
  }

  return NextResponse.json({
    items: videos.map((video) =>
      mapVideoToFeedItem(video, {
        liked: likedIds.has(video.id),
        saved: savedIds.has(video.id),
        following: followingSet.has(video.creatorId),
        followingServer: video.serverId
          ? followingServerSet.has(video.serverId)
          : false,
      })
    ),
    nextCursor,
    total,
  });
}
