import { auth } from "@/lib/auth";
import { getRecommendedVideos } from "@/lib/recommendations";
import { SearchPageClient } from "@/components/feed/search-page-client";
import {
  mapVideoToFeedItem,
  getUserVideoEngagement,
} from "@/lib/videos";
import { prisma } from "@/lib/prisma";
import { getGuestSessionId } from "@/lib/guest-session";

export const metadata = { title: "Search" };

export default async function SearchPage() {
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

  const { likedIds, savedIds } = userId
    ? await getUserVideoEngagement(userId, videoIds)
    : { likedIds: new Set<string>(), savedIds: new Set<string>() };

  let followingSet = new Set<string>();
  if (userId && videos.length > 0) {
    const follows = await prisma.follow.findMany({
      where: { followerId: userId, followingId: { in: creatorIds } },
      select: { followingId: true },
    });
    followingSet = new Set(follows.map((f) => f.followingId));
  }

  const initialItems = videos.map((video) =>
    mapVideoToFeedItem(video, {
      liked: likedIds.has(video.id),
      saved: savedIds.has(video.id),
      following: followingSet.has(video.creatorId),
    })
  );

  return <SearchPageClient initialItems={initialItems} />;
}
