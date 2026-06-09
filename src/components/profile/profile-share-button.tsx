"use client";

import { Metin2Button } from "@/components/metin2/metin2-button";
import { Share2 } from "lucide-react";
import { absoluteUrl } from "@/lib/utils";

export function ProfileShareButton({ username }: { username: string }) {
  async function share() {
    const url = absoluteUrl(`/u/${username}`);
    if (navigator.share) {
      await navigator.share({ url, title: `@${username} on ServerClips` });
    } else {
      await navigator.clipboard.writeText(url);
    }
  }

  return (
    <Metin2Button variant="ghost" onClick={share}>
      <Share2 className="h-4 w-4" /> Share
    </Metin2Button>
  );
}
