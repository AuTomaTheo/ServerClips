import { auth } from "@/lib/auth";
import { getRecommendedVideos } from "@/lib/recommendations";
import { VideoFeed } from "@/components/feed/video-feed";
import {
  mapVideoToFeedItem,
  getUserVideoEngagement,
} from "@/lib/videos";
import { prisma } from "@/lib/prisma";
import { getGuestSessionId } from "@/lib/guest-session";
import type { FeedItem } from "@/types/feed";

export const dynamic = "force-dynamic";

async function getInitialFeedItems(): Promise<FeedItem[]> {
  const session = await auth();
  const userId = session?.user?.id;
  const sessionId = userId ? undefined : await getGuestSessionId();

  const { videos } = await getRecommendedVideos({
    userId,
    sessionId,
    limit: 20,
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

  return videos.map((video) =>
    mapVideoToFeedItem(video, {
      liked: likedIds.has(video.id),
      saved: savedIds.has(video.id),
      following: followingSet.has(video.creatorId),
      followingServer: video.serverId
        ? followingServerSet.has(video.serverId)
        : false,
    })
  );
}

export default async function FeedPage() {
  const initialItems = await getInitialFeedItems();
  return <VideoFeed initialItems={initialItems} />;
}
