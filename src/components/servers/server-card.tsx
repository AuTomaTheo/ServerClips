import Link from "next/link";
import Image from "next/image";
import { formatNumber } from "@/lib/utils";
import { Eye, Heart, MessageCircle, Play, Video } from "lucide-react";
import { SERVER_TYPES } from "@/lib/constants";
import { Metin2Badge } from "@/components/metin2/metin2-badge";

export interface ServerCardData {
  id: string;
  slug: string;
  name: string;
  serverType: string;
  region: string;
  language: string;
  expRate: string;
  featured: boolean;
  verified?: boolean;
  tags?: { tag: { name: string } }[];
  videos?: {
    thumbnailUrl: string | null;
    videoUrl: string;
    metrics?: { views: number; likes: number; comments: number } | null;
  }[];
  _count?: { videos: number };
}

function getServerTypeLabel(value: string) {
  return SERVER_TYPES.find((t) => t.value === value)?.label ?? value;
}

export function ServerCard({ server }: { server: ServerCardData }) {
  const primary = server.videos?.[0];
  const thumb = primary?.thumbnailUrl;
  const totalViews = server.videos?.reduce((s, v) => s + (v.metrics?.views ?? 0), 0) ?? 0;
  const totalLikes = server.videos?.reduce((s, v) => s + (v.metrics?.likes ?? 0), 0) ?? 0;
  const totalComments = server.videos?.reduce((s, v) => s + (v.metrics?.comments ?? 0), 0) ?? 0;

  return (
    <Link href={`/server/${server.slug}`} className="group block">
      <article className="metin2-card overflow-hidden rounded">
        <div className="relative aspect-video overflow-hidden bg-metin2-woodDark">
          {thumb ? (
            <Image
              src={thumb}
              alt={server.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-metin2-wood to-metin2-bg text-metin2-parchment/40">
              No preview
            </div>
          )}
          {primary && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="rounded-full border-2 border-metin2-gold bg-metin2-red/80 p-3">
                <Play className="h-6 w-6 fill-metin2-parchment text-metin2-parchment" />
              </div>
            </div>
          )}
          {server.featured && (
            <span className="absolute left-2 top-2">
              <Metin2Badge variant="gold">Featured</Metin2Badge>
            </span>
          )}
        </div>

        <div className="metin2-parchment p-4">
          <h3 className="font-display mb-2 line-clamp-1 text-base font-bold text-metin2-ink group-hover:text-metin2-red">
            {server.name}
          </h3>

          <div className="mb-3 flex flex-wrap gap-1.5">
            <Metin2Badge variant="red">{getServerTypeLabel(server.serverType)}</Metin2Badge>
            <Metin2Badge>{server.region}</Metin2Badge>
            <Metin2Badge variant="gold">EXP {server.expRate}</Metin2Badge>
          </div>

          {server.tags && server.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-x-2">
              {server.tags.slice(0, 3).map(({ tag }) => (
                <span key={tag.name} className="text-xs text-metin2-red">#{tag.name}</span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-metin2-ink/70">
            <span className="flex items-center gap-1">
              <Video className="h-3.5 w-3.5" />
              {server._count?.videos ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {formatNumber(totalViews)}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              {formatNumber(totalLikes)}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {formatNumber(totalComments)}
            </span>
            <span className="ml-auto">{server.language}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
