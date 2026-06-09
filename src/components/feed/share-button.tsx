"use client";

import { Share2 } from "lucide-react";
import { absoluteUrl } from "@/lib/utils";

export function ShareButton({
  videoId,
  title,
}: {
  videoId: string;
  title: string;
}) {
  async function handleShare() {
    const url = absoluteUrl(`/?v=${videoId}`);
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        /* cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
    fetch(`/api/videos/${videoId}/share`, { method: "POST" }).catch(() => {});
  }

  return (
    <button
      onClick={handleShare}
      className="flex flex-col items-center gap-0.5 text-white"
      aria-label="Share"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 backdrop-blur-sm">
        <Share2 className="h-6 w-6" />
      </span>
      <span className="text-[11px] font-medium drop-shadow">Share</span>
    </button>
  );
}
