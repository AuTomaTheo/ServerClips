"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MessageCircle,
  ExternalLink,
  ChevronUp,
  Server,
  Volume2,
  VolumeX,
  BadgeCheck,
} from "lucide-react";
import { format } from "date-fns";
import type { FeedItem } from "@/types/feed";
import { SERVER_TYPES } from "@/lib/constants";
import { FeedLikeButton } from "./feed-like-button";
import { FeedSaveButton } from "./feed-save-button";
import { FeedFollowButton } from "./feed-follow-button";
import { ShareButton } from "./share-button";
import { CommentsDrawer } from "./comments-drawer";
import { LoginPromptModal } from "./login-prompt-modal";
import { cn } from "@/lib/utils";

function getServerTypeLabel(value: string) {
  return SERVER_TYPES.find((t) => t.value === value)?.label ?? value;
}

export function VideoFeedItem({
  item,
  index,
  isActive,
  isAuthenticated,
  currentUserId,
  itemRef,
}: {
  item: FeedItem;
  index: number;
  isActive: boolean;
  isAuthenticated: boolean;
  currentUserId?: string;
  itemRef?: (el: HTMLElement | null) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewTrackedRef = useRef(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentLoginOpen, setCommentLoginOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [muted, setMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);

  const server = item.server;
  const creator = item.creator;
  const metrics = item.metrics;
  const isVideo = !!item.videoUrl && !videoError;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideo) return;
    video.muted = muted;
    if (isActive) video.play().catch(() => {});
    else video.pause();
  }, [isActive, isVideo, muted]);

  useEffect(() => {
    if (!isActive) {
      viewTrackedRef.current = false;
      return;
    }
    if (viewTrackedRef.current) return;
    viewTrackedRef.current = true;
    fetch(`/api/videos/${item.id}/view`, { method: "POST" }).catch(() => {});
  }, [isActive, item.id]);

  const shortDesc =
    item.description.length > 120 && !expanded
      ? item.description.slice(0, 120) + "..."
      : item.description;

  const creatorHref = creator.username ? `/u/${creator.username}` : "/search";

  async function handleServerClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!server?.websiteUrl) return;
    e.preventDefault();
    window.open(server.websiteUrl, "_blank", "noopener,noreferrer");
    fetch("/api/servers/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serverId: server.id, videoId: item.id, clickType: "website" }),
    }).catch(() => {});
  }

  function openComments() {
    setCommentsOpen(true);
  }

  return (
    <section
      ref={itemRef}
      data-index={index}
      className="feed-snap-item relative mx-auto h-[100dvh] w-full max-w-[480px] shrink-0 snap-start snap-always overflow-hidden bg-black sm:border-x border-[#5c3d1e]/30"
      data-active={isActive}
    >
      {item.videoUrl && !videoError ? (
        <video
          ref={videoRef}
          src={item.videoUrl}
          className="absolute inset-0 z-0 h-full w-full object-cover"
          loop
          muted={muted}
          autoPlay={isActive}
          playsInline
          preload={isActive ? "auto" : "metadata"}
          poster={item.thumbnailUrl ?? undefined}
          onError={() => setVideoError(true)}
        />
      ) : item.thumbnailUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${item.thumbnailUrl})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-black" />
      )}

      <div className="pointer-events-none absolute inset-0 metin2-feed-overlay" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

      {isVideo && isActive && (
        <button
          onClick={() => setMuted(!muted)}
          className="absolute right-16 top-16 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      )}

      <div className="absolute bottom-24 right-2 z-10 flex flex-col items-center gap-4">
        <Link href={creatorHref} className="flex flex-col items-center gap-0.5">
          <div className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-metin2-gold bg-black/50">
            {creator.avatarUrl ? (
              <Image src={creator.avatarUrl} alt="" fill className="object-cover" unoptimized />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-metin2-wood text-xs font-bold text-metin2-gold">
                {(creator.displayName ?? "?")[0]}
              </div>
            )}
          </div>
        </Link>

        <FeedFollowButton
          username={creator.username}
          initialFollowing={item.following}
          isAuthenticated={isAuthenticated}
          isSelf={currentUserId === creator.id}
        />
        <FeedLikeButton
          videoId={item.id}
          initialLiked={item.liked}
          initialCount={metrics.likes}
          isAuthenticated={isAuthenticated}
        />
        <button
          onClick={openComments}
          className="flex flex-col items-center gap-0.5 text-white"
          aria-label="Comments"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 backdrop-blur-sm">
            <MessageCircle className="h-6 w-6" />
          </span>
          <span className="text-[11px] font-medium drop-shadow">{metrics.comments}</span>
        </button>
        <FeedSaveButton
          videoId={item.id}
          initialSaved={item.saved}
          isAuthenticated={isAuthenticated}
        />
        <ShareButton videoId={item.id} title={item.title} />
        {server && (
          <Link
            href={`/server/${server.slug}`}
            className="flex flex-col items-center gap-0.5 text-white"
            aria-label="Server profile"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 backdrop-blur-sm">
              <Server className="h-5 w-5 text-metin2-gold" />
            </span>
            <span className="max-w-[52px] truncate text-[10px] font-medium drop-shadow">Server</span>
          </Link>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-14 z-10 p-4 pb-20">
        <Link href={creatorHref} className="mb-1 inline-block text-sm font-semibold text-white drop-shadow">
          @{creator.username ?? "creator"}
        </Link>
        <h2 className="metin2-feed-title text-lg sm:text-xl">{item.title}</h2>

        {server && (
          <div className="mt-2 flex flex-wrap items-center gap-1">
            <span className="metin2-feed-badge rounded-full px-2 py-0.5 text-[10px] font-medium">
              {getServerTypeLabel(server.serverType)}
            </span>
            {server.verified && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-metin2-gold/20 px-2 py-0.5 text-[10px] font-medium text-metin2-gold">
                <BadgeCheck className="h-3 w-3" />
                Verified
              </span>
            )}
            <span className="metin2-feed-badge-muted rounded-full px-2 py-0.5 text-[10px]">
              {server.language} · {server.region}
            </span>
            <span className="metin2-feed-badge-muted rounded-full px-2 py-0.5 text-[10px]">
              EXP {server.expRate}
            </span>
            {server.launchDate && (
              <span className="metin2-feed-badge-muted rounded-full px-2 py-0.5 text-[10px]">
                Launch {format(new Date(server.launchDate), "MMM d, yyyy")}
              </span>
            )}
          </div>
        )}

        {server && server.tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-x-2">
            {server.tags.map((tag) => (
              <span key={tag} className="metin2-feed-tag text-xs">#{tag}</span>
            ))}
          </div>
        )}

        <p className="mt-2 text-sm leading-relaxed text-zinc-200 drop-shadow">
          {shortDesc}
          {item.description.length > 120 && (
            <button onClick={() => setExpanded(!expanded)} className="ml-1 font-medium text-white hover:underline">
              {expanded ? "less" : "more"}
            </button>
          )}
        </p>

        {server?.websiteUrl && (
          <a
            href={server.websiteUrl}
            onClick={handleServerClick}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "metin2-feed-cta mt-3 inline-flex w-full max-w-xs items-center justify-center gap-2",
              "rounded px-4 py-2.5 text-xs font-bold active:scale-95"
            )}
          >
            <ExternalLink className="h-4 w-4" />
            Visit Server
          </a>
        )}
        {server?.websiteUrl && (
          <p className="mt-1 text-[10px] text-zinc-400">
            External link — leave ServerClips at your own risk
          </p>
        )}
      </div>

      {!isActive && <div className="pointer-events-none absolute inset-0 bg-black/20" />}
      {isActive && (
        <div className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 animate-bounce text-white/40">
          <ChevronUp className="h-4 w-4" />
        </div>
      )}

      <CommentsDrawer
        videoId={item.id}
        videoTitle={item.title}
        initialCount={metrics.comments}
        isAuthenticated={isAuthenticated}
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        onAuthRequired={() => setCommentLoginOpen(true)}
      />

      <LoginPromptModal
        open={commentLoginOpen}
        onClose={() => setCommentLoginOpen(false)}
        action="comment on videos"
      />
    </section>
  );
}
