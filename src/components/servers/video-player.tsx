"use client";

export function VideoPlayer({ src, poster }: { src: string; poster?: string }) {
  return (
    <video
      className="aspect-video w-full rounded-xl bg-black"
      controls
      playsInline
      preload="metadata"
      poster={poster}
    >
      <source src={src} />
      Your browser does not support the video tag.
    </video>
  );
}
