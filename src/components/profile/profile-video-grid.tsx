import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export type ProfileGridVideo = {
  id: string;
  title: string;
  thumbnailUrl?: string | null;
  status?: string;
  metrics?: { views: number; likes?: number } | null;
  _count?: { likes: number };
};

export function ProfileVideoGrid({
  videos,
  emptyMessage,
}: {
  videos: ProfileGridVideo[];
  emptyMessage: string;
}) {
  if (videos.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-metin2-parchment/50">{emptyMessage}</p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
      {videos.map((video) => {
        const views = video.metrics?.views ?? 0;
        return (
          <Link
            key={video.id}
            href={`/?v=${video.id}`}
            className="group relative aspect-[9/16] overflow-hidden bg-metin2-woodDark"
          >
            {video.thumbnailUrl ? (
              <Image
                src={video.thumbnailUrl}
                alt={video.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 33vw, 200px"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-b from-metin2-wood to-metin2-bg p-2">
                <p className="line-clamp-3 text-center text-[10px] font-medium text-metin2-parchment/70">
                  {video.title}
                </p>
              </div>
            )}

            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />

            {video.status && video.status !== "APPROVED" && (
              <span className="absolute left-1 top-1 rounded bg-amber-600/90 px-1.5 py-0.5 text-[9px] font-medium text-white">
                {video.status}
              </span>
            )}

            <div className="absolute bottom-1 left-1 flex items-center gap-0.5 text-[10px] font-semibold text-white drop-shadow">
              <Play className="h-3 w-3 fill-white" />
              {formatNumber(views)}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
