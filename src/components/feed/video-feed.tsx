"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import type { FeedItem, FeedFilters } from "@/types/feed";
import { VideoFeedItem } from "./video-feed-item";
import { FeedTopBar } from "./feed-top-bar";
import { SearchOverlay } from "./search-overlay";
import { BottomNav } from "./bottom-nav";

function buildQuery(filters: FeedFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.serverType) params.set("serverType", filters.serverType);
  if (filters.language) params.set("language", filters.language);
  if (filters.region) params.set("region", filters.region);
  if (filters.international) params.set("international", "true");
  if (filters.launchingSoon) params.set("launchingSoon", "true");
  if (filters.verifiedOnly) params.set("verifiedOnly", "true");
  return params.toString();
}

export function VideoFeed({ initialItems }: { initialItems: FeedItem[] }) {
  const { data: session } = useSession();
  const [items, setItems] = useState<FeedItem[]>(initialItems);
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filters, setFilters] = useState<FeedFilters>({});
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const loadFeed = useCallback(async (f: FeedFilters, cursor?: string) => {
    const qs = buildQuery(f);
    const url = `/api/feed?${qs}&limit=20${cursor ? `&cursor=${cursor}` : ""}`;
    const res = await fetch(url);
    const data = await res.json();
    return data as { items: FeedItem[]; nextCursor: string | null };
  }, []);

  const applyFilters = useCallback(
    async (f: FeedFilters) => {
      setFilters(f);
      setActiveIndex(0);
      const data = await loadFeed(f);
      setItems(data.items);
      setNextCursor(data.nextCursor);
      containerRef.current?.scrollTo({ top: 0 });
    },
    [loadFeed]
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

  if (items.length === 0) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center bg-zinc-950 px-6 text-center">
        <FeedTopBar onSearchOpen={() => setSearchOpen(true)} />
        <p className="text-lg text-zinc-300">No server videos found</p>
        <p className="mt-2 text-sm text-zinc-500">
          Try adjusting your search or explore all servers.
        </p>
        <a
          href="/explore"
          className="mt-6 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold hover:bg-violet-500"
        >
          Browse Explore
        </a>
        <SearchOverlay
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          onApplyFilters={applyFilters}
          initialFilters={filters}
        />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#0a0a0a]">
      <FeedTopBar onSearchOpen={() => setSearchOpen(true)} />

      <div
        ref={containerRef}
        className="feed-scroll-container h-full w-full overflow-y-scroll overscroll-y-contain"
      >
        {items.map((item, index) => (
          <VideoFeedItem
            key={item.id}
            item={item}
            index={index}
            isActive={index === activeIndex}
            isAuthenticated={!!session?.user}
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
        onApplyFilters={applyFilters}
        initialFilters={filters}
      />
      <BottomNav />
    </div>
  );
}
