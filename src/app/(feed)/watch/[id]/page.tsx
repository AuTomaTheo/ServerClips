import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { canModerateContent } from "@/lib/permissions";
import { getVideoForWatch, mapVideoToFeedItem } from "@/lib/videos";
import { SingleVideoFeed } from "@/components/feed/single-video-feed";

export const dynamic = "force-dynamic";

export default async function WatchVideoPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { from?: string };
}) {
  const session = await auth();
  const viewerId = session?.user?.id;
  const isModerator = session?.user ? canModerateContent(session.user) : false;

  const video = await getVideoForWatch(params.id, viewerId, isModerator);
  if (!video) notFound();

  const feedItem = mapVideoToFeedItem(video, {
    liked: false,
    saved: false,
    following: false,
    followingServer: false,
  });

  const fromAdmin = searchParams.from === "admin";
  const backHref = fromAdmin
    ? `/admin/videos${video.status === "PENDING" ? "?status=PENDING" : ""}`
    : "/";

  return (
    <SingleVideoFeed
      item={feedItem}
      showModeration={isModerator && fromAdmin}
      videoStatus={video.status}
      backHref={backHref}
    />
  );
}
