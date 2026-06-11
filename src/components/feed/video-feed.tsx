"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import type { FeedItem, FeedFilters } from "@/types/feed";
import { VideoFeedItem } from "./video-feed-item";
import { FeedTopBar, type FeedTab } from "./feed-top-bar";
import { SearchOverlay } from "./search-overlay";
import { BottomNav } from "./bottom-nav";
import { buildFeedQuery } from "@/lib/feed-filters";
import Link from "next/link";

export function VideoFeed({ initialItems }: { initialItems: FeedItem[] }) {
  const { data: session, status: sessionStatus } = useSession();
  const isAuthenticated = sessionStatus === "authenticated" && !!session?.user;
  const knownGuest = sessionStatus === "unauthenticated";
  const sessionPending = sessionStatus === "loading";
  const [items, setItems] = useState<FeedItem[]>(initialItems);
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [feedTab, setFeedTab] = useState<FeedTab>("forYou");
  const [filters, setFilters] = useState<FeedFilters>({});
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingTab, setLoadingTab] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const loadFeed = useCallback(
    async (f: FeedFilters, cursor?: string) => {
      const qs = buildFeedQuery(f);
      const url = `/api/feed?${qs}&limit=20${cursor ? `&cursor=${cursor}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      return data as { items: FeedItem[]; nextCursor: string | null };
    },
    []
  );

  const applyFilters = useCallback(
    async (f: FeedFilters, tab: FeedTab = feedTab) => {
      const merged = { ...f, followingOnly: tab === "following" };
      setFilters(merged);
      setActiveIndex(0);
      setLoadingTab(true);
      const data = await loadFeed(merged);
      setItems(data.items);
      setNextCursor(data.nextCursor);
      setLoadingTab(false);
      containerRef.current?.scrollTo({ top: 0 });
    },
    [feedTab, loadFeed]
  );

  const switchTab = useCallback(
    async (tab: FeedTab) => {
      setFeedTab(tab);
      await applyFilters(filters, tab);
    },
    [applyFilters, filters]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const idx = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(idx)) setActiveIndex(idx);
          }
        });
      },
      { root: container, threshold: [0.5, 0.75] }
    );

    const raf = requestAnimationFrame(() => {
      itemRefs.current.forEach((el) => {
        if (el) observer.observe(el);
      });
    });

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [items]);

  useEffect(() => {
    if (activeIndex >= items.length - 3 && nextCursor && !loadingMore) {
      setLoadingMore(true);
      loadFeed(filters, nextCursor).then((data) => {
        setItems((prev) => [...prev, ...data.items]);
        setNextCursor(data.nextCursor);
        setLoadingMore(false);
      });
    }
  }, [activeIndex, items.length, nextCursor, loadingMore, filters, loadFeed]);

  if (loadingTab) {
    return (
      <div className="relative flex h-[100dvh] items-center justify-center bg-black">
        <FeedTopBar activeTab={feedTab} onTabChange={switchTab} onSearchOpen={() => setSearchOpen(true)} />
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
        <BottomNav />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="relative flex h-[100dvh] flex-col items-center justify-center bg-black px-6 text-center">
        <FeedTopBar activeTab={feedTab} onTabChange={switchTab} onSearchOpen={() => setSearchOpen(true)} />
        <p className="text-lg font-semibold text-white">
          {feedTab === "following" ? "No videos from people you follow" : "No server videos found"}
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          {feedTab === "following"
            ? "Follow creators or servers to build your Following feed."
            : "Try adjusting your search or explore all servers."}
        </p>
        {feedTab === "following" ? (
          <button
            type="button"
            onClick={() => switchTab("forYou")}
            className="mt-6 rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-500 active:scale-95"
          >
            Browse For You
          </button>
        ) : (
          <Link
            href="/explore"
            className="mt-6 rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-500 active:scale-95"
          >
            Explore Servers
          </Link>
        )}
        <SearchOverlay
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          onApplyFilters={(f) => applyFilters(f, feedTab)}
          initialFilters={filters}
        />
        <BottomNav />
      </div>
    );
  }

  return (
    <div
      className="relative h-[100dvh] w-full overflow-hidden bg-black"
      data-auth-status={sessionStatus}
    >
      <FeedTopBar activeTab={feedTab} onTabChange={switchTab} onSearchOpen={() => setSearchOpen(true)} />

      <div
        ref={containerRef}
        className="feed-scroll-container h-full w-full overflow-y-scroll overscroll-y-contain pt-10 pb-20"
      >
        {items.map((item, index) => (
          <VideoFeedItem
            key={item.id}
            item={item}
            index={index}
            isActive={index === activeIndex}
            isAuthenticated={isAuthenticated}
            knownGuest={knownGuest}
            sessionPending={sessionPending}
            currentUserId={session?.user?.id}
            itemRef={(el) => {
              itemRefs.current[index] = el;
            }}
          />
        ))}
      </div>

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onApplyFilters={(f) => applyFilters(f, feedTab)}
        initialFilters={filters}
      />
      <BottomNav />
    </div>
  );
}
