"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  MessageCircle,
  ExternalLink,
  Server,
  Volume2,
  VolumeX,
  BadgeCheck,
  MoreHorizontal,
  Plus,
  Heart,
  Bookmark,
  Share2,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import type { FeedItem } from "@/types/feed";
import { GAMEPLAY_DIFFICULTIES, SCHOOL_TYPES } from "@/lib/constants";
import { mediaUrlForDisplay } from "@/lib/media-url";
import { CommentsDrawer } from "./comments-drawer";
import { LoginPromptModal } from "./login-prompt-modal";
import { ReportDialog } from "@/components/reports/report-dialog";
import { cn, formatNumber, absoluteUrl } from "@/lib/utils";

function labelFor(value: string, list: readonly { value: string; label: string }[]) {
  return list.find((t) => t.value === value)?.label ?? value;
}

function RailButton({
  onClick,
  label,
  ariaLabel,
  children,
  active,
}: {
  onClick?: () => void;
  label: string;
  ariaLabel?: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 text-white transition-transform active:scale-90"
      aria-label={ariaLabel ?? label}
    >
      <span className={cn("flex h-7 w-7 items-center justify-center", active && "text-red-500")}>
        {children}
      </span>
      <span className="text-[9px] font-medium text-zinc-300">{label}</span>
    </button>
  );
}

export function VideoFeedItem({
  item,
  index,
  isActive,
  isAuthenticated,
  knownGuest,
  sessionPending,
  currentUserId,
  itemRef,
}: {
  item: FeedItem;
  index: number;
  isActive: boolean;
  isAuthenticated: boolean;
  knownGuest: boolean;
  sessionPending: boolean;
  currentUserId?: string;
  itemRef?: (el: HTMLElement | null) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewTrackedRef = useRef(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginAction, setLoginAction] = useState("continue");
  const [expanded, setExpanded] = useState(false);
  const [muted, setMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [liked, setLiked] = useState(item.liked);
  const [likeCount, setLikeCount] = useState(item.metrics.likes);
  const [saved, setSaved] = useState(item.saved);
  const [following, setFollowing] = useState(item.following);

  const server = item.server;
  const creator = item.creator;
  const metrics = item.metrics;
  const isVideo = !!item.videoUrl && !videoError;
  const creatorHref = creator.username ? `/u/${creator.username}` : "/search";
  const avatarUrl = mediaUrlForDisplay(creator.avatarUrl);
  const serverLogoUrl = server?.logoUrl ? mediaUrlForDisplay(server.logoUrl) : null;
  const isSelf = currentUserId === creator.id;

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

  function requireAuth(action: string, fn: () => void) {
    if (sessionPending) return;
    if (knownGuest) {
      setLoginAction(action);
      setLoginOpen(true);
      return;
    }
    fn();
  }

  async function toggleLike() {
    requireAuth("like videos", async () => {
      const res = await fetch(`/api/videos/${item.id}/like`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setLiked(data.liked);
        setLikeCount(data.count);
      }
    });
  }

  async function toggleSave() {
    requireAuth("save videos", async () => {
      const res = await fetch(`/api/videos/${item.id}/save`, { method: "POST" });
      const data = await res.json();
      if (res.ok) setSaved(data.saved);
    });
  }

  async function toggleFollow() {
    if (!creator.username || isSelf) return;
    requireAuth("follow creators", async () => {
      const res = await fetch(`/api/users/${creator.username}/follow`, { method: "POST" });
      const data = await res.json();
      if (res.ok) setFollowing(data.following);
    });
  }

  async function handleShare() {
    const url = absoluteUrl(`/?v=${item.id}`);
    if (navigator.share) {
      try {
        await navigator.share({ title: item.title, url });
      } catch {
        /* cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
    fetch(`/api/videos/${item.id}/share`, { method: "POST" }).catch(() => {});
  }

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

  return (
    <section
      ref={itemRef}
      data-index={index}
      className="feed-snap-item flex h-[calc(100dvh-5.5rem)] shrink-0 snap-start snap-always items-center justify-center px-2 py-1"
      data-active={isActive}
    >
      <div className="relative mx-auto h-full w-full max-w-[min(100%,340px)] overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900 shadow-xl shadow-black/40">
        {/* Video */}
        {item.videoUrl && !videoError ? (
          <video
            ref={videoRef}
            src={item.videoUrl}
            className="absolute inset-0 h-full w-full object-cover"
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
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 to-black" />
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/40" />

        {/* Right action rail */}
        <div className="absolute bottom-20 right-1.5 z-10 flex flex-col items-center gap-2">
          {/* Avatar + follow */}
          <div className="flex flex-col items-center gap-1">
            <div className="relative">
              <Link href={creatorHref} className="block">
                <div className="relative h-9 w-9 overflow-hidden rounded-full border border-red-500 bg-zinc-800">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : serverLogoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={serverLogoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-bold text-red-400">
                      {(creator.displayName ?? creator.username ?? "?")[0]}
                    </div>
                  )}
                </div>
              </Link>
              {!isSelf && creator.username && !following && (
                <button
                  type="button"
                  onClick={toggleFollow}
                  className="absolute -bottom-0.5 left-1/2 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full bg-red-600 text-white shadow active:scale-90"
                  aria-label="Follow"
                >
                  <Plus className="h-2.5 w-2.5" strokeWidth={3} />
                </button>
              )}
            </div>
            <Link href={creatorHref} className="max-w-[48px] truncate text-[8px] font-medium text-white">
              @{creator.username ?? "creator"}
            </Link>
          </div>

          <RailButton
            label={formatNumber(likeCount)}
            ariaLabel="Like"
            onClick={toggleLike}
            active={liked}
          >
            <Heart className={cn("h-5 w-5", liked && "fill-red-500 text-red-500")} />
          </RailButton>

          <RailButton
            label={formatNumber(metrics.comments)}
            ariaLabel="Comments"
            onClick={() => {
              if (sessionPending) return;
              if (knownGuest) {
                setLoginAction("comment on videos");
                setLoginOpen(true);
                return;
              }
              setCommentsOpen(true);
            }}
          >
            <MessageCircle className="h-5 w-5" />
          </RailButton>

          <RailButton
            label={formatNumber(metrics.saves)}
            ariaLabel="Save"
            onClick={toggleSave}
            active={saved}
          >
            <Bookmark className={cn("h-5 w-5", saved && "fill-white")} />
          </RailButton>

          <RailButton label={formatNumber(metrics.shares)} onClick={handleShare}>
            <Share2 className="h-5 w-5" />
          </RailButton>

          {server && (
            <Link
              href={`/server/${server.slug}`}
              className="flex flex-col items-center gap-0.5 text-white active:scale-90"
            >
              <span className="flex h-7 w-7 items-center justify-center">
                <Server className="h-5 w-5 text-amber-400" />
              </span>
              <span className="text-[9px] font-medium text-zinc-300">Server</span>
            </Link>
          )}

          {isVideo && isActive && (
            <RailButton
              label={muted ? "Unmute" : "Sound"}
              onClick={() => setMuted(!muted)}
            >
              {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </RailButton>
          )}

          <ReportDialog
            targetType="VIDEO"
            targetId={item.id}
            trigger={
              <button
                type="button"
                className="flex flex-col items-center gap-0.5 text-white transition-transform active:scale-90"
                aria-label="Report"
              >
                <span className="flex h-7 w-7 items-center justify-center">
                  <MoreHorizontal className="h-5 w-5" />
                </span>
                <span className="text-[9px] font-medium text-zinc-300">Report</span>
              </button>
            }
          />
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-12 z-10 p-2.5">
          {server && (
            <Link
              href={`/server/${server.slug}`}
              className="mb-2 flex items-center gap-2 rounded-lg border border-zinc-700/40 bg-black/50 p-1.5 backdrop-blur-sm transition-colors hover:bg-black/70"
            >
              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md bg-zinc-800">
                {serverLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={serverLogoUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-bold text-red-400">
                    {server.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="truncate text-xs font-bold text-white">{server.name}</span>
                  {server.verified && <BadgeCheck className="h-3 w-3 shrink-0 text-amber-400" />}
                </div>
                <p className="truncate text-[9px] text-zinc-400">
                  {labelFor(server.schoolType, SCHOOL_TYPES)}
                  {" · "}
                  {labelFor(server.gameplayDifficulty, GAMEPLAY_DIFFICULTIES)}
                  {server.maxLevel != null && ` · Max Lv. ${server.maxLevel}`}
                </p>
              </div>
            </Link>
          )}

          <h2 className="text-sm font-bold leading-tight text-white drop-shadow-lg">
            {item.title}
          </h2>

          <p className={cn("mt-1 text-[11px] leading-snug text-zinc-300 drop-shadow", !expanded && "line-clamp-2")}>
            {shortDesc}
            {item.description.length > 120 && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="ml-1 font-semibold text-white hover:underline"
              >
                {expanded ? "less" : "more"}
              </button>
            )}
          </p>

          {server && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1">
              <span className="app-pill-red">{labelFor(server.schoolType, SCHOOL_TYPES)}</span>
              <span className="app-pill">{labelFor(server.gameplayDifficulty, GAMEPLAY_DIFFICULTIES)}</span>
              {server.tags.slice(0, 1).map((tag) => (
                <span key={tag} className="app-pill">
                  {tag}
                </span>
              ))}
              {server.launchDate && (
                <span className="inline-flex items-center gap-0.5 app-pill">
                  <Calendar className="h-2.5 w-2.5 text-zinc-500" />
                  {format(new Date(server.launchDate), "MMM d, yyyy")}
                </span>
              )}
            </div>
          )}

          {server?.websiteUrl && (
            <a
              href={server.websiteUrl}
              onClick={handleServerClick}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex w-full items-center gap-2 rounded-xl border border-red-800/50 bg-gradient-to-r from-red-950/90 to-red-900/80 px-3 py-2 shadow-lg shadow-black/30 transition-all active:scale-[0.98]"
            >
              <ExternalLink className="h-4 w-4 shrink-0 text-red-300" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white">Visit Server</div>
                <div className="text-[9px] text-red-300/80">Join thousands of players now!</div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-red-400" />
            </a>
          )}
        </div>

        {!isActive && <div className="pointer-events-none absolute inset-0 bg-black/25" />}
      </div>

      <CommentsDrawer
        videoId={item.id}
        videoTitle={item.title}
        initialCount={metrics.comments}
        isAuthenticated={isAuthenticated}
        currentUserId={currentUserId}
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        onAuthRequired={() => {
          setLoginAction("comment on videos");
          setLoginOpen(true);
        }}
      />

      <LoginPromptModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        action={loginAction}
      />
    </section>
  );
}
