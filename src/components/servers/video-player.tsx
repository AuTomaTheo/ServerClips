"use client";

import { videoUrlForPlayback } from "@/lib/media-url";

export function VideoPlayer({ src, poster }: { src: string; poster?: string }) {
  const playbackSrc = videoUrlForPlayback(src) ?? src;
  return (
    <video
      className="aspect-video w-full rounded-xl bg-black"
      controls
      playsInline
      preload="metadata"
      poster={poster}
    >
      <source src={playbackSrc} />
      Your browser does not support the video tag.
    </video>
  );
}
