"use client";

import { Share2 } from "lucide-react";
import { absoluteUrl } from "@/lib/utils";

export function ServerShareButton({ slug, name }: { slug: string; name: string }) {
  async function share() {
    const url = absoluteUrl(`/server/${slug}`);
    if (navigator.share) {
      await navigator.share({ url, title: `${name} on ServerClips` });
    } else {
      await navigator.clipboard.writeText(url);
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900/80 text-white backdrop-blur-sm transition-all hover:bg-zinc-800 active:scale-95"
      aria-label="Share server"
    >
      <Share2 className="h-4 w-4" />
    </button>
  );
}
