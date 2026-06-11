"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import type { ContentStatus } from "@/generated/prisma/client";
import type { FeedItem } from "@/types/feed";
import { VideoFeedItem } from "./video-feed-item";
import { VideoModerationActions } from "@/components/admin/video-moderation-actions";

export function SingleVideoFeed({
  item,
  showModeration,
  videoStatus,
  backHref = "/",
}: {
  item: FeedItem;
  showModeration?: boolean;
  videoStatus?: ContentStatus;
  backHref?: string;
}) {
  const { data: session, status: sessionStatus } = useSession();
  const isAuthenticated = sessionStatus === "authenticated" && !!session?.user;

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-black">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-50 bg-gradient-to-b from-black/90 via-black/40 to-transparent pb-16 pt-3">
        <div className="pointer-events-auto flex items-start justify-between gap-3 px-4">
          <Link
            href={backHref}
            className="flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm hover:bg-black/70"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          {showModeration && videoStatus && (
            <div className="rounded-xl bg-black/60 p-2 backdrop-blur-sm">
              <VideoModerationActions videoId={item.id} status={videoStatus} />
            </div>
          )}
        </div>
      </div>

      <div className="feed-scroll-container h-full w-full overflow-hidden pb-20 pt-10">
        <VideoFeedItem
          item={item}
          index={0}
          isActive
          isAuthenticated={isAuthenticated}
          knownGuest={sessionStatus === "unauthenticated"}
          sessionPending={sessionStatus === "loading"}
          currentUserId={session?.user?.id}
          itemRef={() => {}}
        />
      </div>
    </div>
  );
}
