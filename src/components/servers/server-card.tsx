import Link from "next/link";
import Image from "next/image";
import { formatNumber } from "@/lib/utils";
import { Eye, Heart, MessageCircle, Play, Video, BadgeCheck } from "lucide-react";
import { GAMEPLAY_DIFFICULTIES, SCHOOL_TYPES } from "@/lib/constants";
import { mediaUrlForDisplay } from "@/lib/media-url";

export interface ServerCardData {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
  schoolType: string;
  gameplayDifficulty: string;
  originCountry: string;
  mainLanguage: string;
  maxLevel?: number | null;
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

function labelFor(value: string, list: readonly { value: string; label: string }[]) {
  return list.find((t) => t.value === value)?.label ?? value;
}

export function ServerCard({ server }: { server: ServerCardData }) {
  const primary = server.videos?.[0];
  const thumb = primary?.thumbnailUrl;
  const logoUrl = mediaUrlForDisplay(server.logoUrl);
  const totalViews = server.videos?.reduce((s, v) => s + (v.metrics?.views ?? 0), 0) ?? 0;
  const totalLikes = server.videos?.reduce((s, v) => s + (v.metrics?.likes ?? 0), 0) ?? 0;
  const totalComments = server.videos?.reduce((s, v) => s + (v.metrics?.comments ?? 0), 0) ?? 0;

  return (
    <Link href={`/server/${server.slug}`} className="group block">
      <article className="app-card overflow-hidden transition-all hover:border-zinc-700 active:scale-[0.99]">
        <div className="relative aspect-video overflow-hidden bg-zinc-800">
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
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-600">
              No preview
            </div>
          )}
          {primary && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="rounded-full bg-red-600/90 p-3 shadow-lg">
                <Play className="h-5 w-5 fill-white text-white" />
              </div>
            </div>
          )}
          {server.featured && (
            <span className="absolute left-2 top-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
              Featured
            </span>
          )}
        </div>

        <div className="p-4">
          <div className="mb-2 flex items-center gap-2">
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="h-7 w-7 rounded-md border border-zinc-700 object-cover" />
            )}
            <h3 className="line-clamp-1 flex-1 text-sm font-bold text-white group-hover:text-red-400">
              {server.name}
            </h3>
            {server.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-amber-400" />}
          </div>

          <div className="mb-3 flex flex-wrap gap-1">
            <span className="app-pill-red">{labelFor(server.schoolType, SCHOOL_TYPES)}</span>
            <span className="app-pill">{labelFor(server.gameplayDifficulty, GAMEPLAY_DIFFICULTIES)}</span>
            <span className="app-pill">{server.originCountry}</span>
            {server.maxLevel != null && <span className="app-pill">Lv. {server.maxLevel}</span>}
          </div>

          {server.tags && server.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-x-2">
              {server.tags.slice(0, 3).map(({ tag }) => (
                <span key={tag.name} className="text-[10px] text-red-400">
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 text-[10px] text-zinc-500">
            <span className="flex items-center gap-1">
              <Video className="h-3 w-3" />
              {server._count?.videos ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatNumber(totalViews)}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {formatNumber(totalLikes)}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {formatNumber(totalComments)}
            </span>
            <span className="ml-auto">{server.mainLanguage}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
