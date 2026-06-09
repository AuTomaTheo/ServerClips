import Link from "next/link";
import { cn } from "@/lib/utils";
import { Metin2Frame } from "@/components/metin2/metin2-frame";

const TABS = [
  { id: "videos", label: "Videos" },
  { id: "liked", label: "Liked" },
  { id: "saved", label: "Saved" },
  { id: "servers", label: "Servers" },
] as const;

type ProfileVideo = {
  id: string;
  title: string;
  metrics?: { views: number; likes?: number } | null;
  _count: { likes: number };
};

export function ProfileTabs({
  username,
  activeTab,
  isOwner,
  likedPublic,
  savedPublic,
  videos,
  likedVideos,
  savedVideos,
  servers,
}: {
  username: string;
  activeTab: string;
  isOwner: boolean;
  likedPublic: boolean;
  savedPublic: boolean;
  videos: ProfileVideo[];
  likedVideos: ProfileVideo[];
  savedVideos: ProfileVideo[];
  servers: { id: string; name: string; slug: string; serverType: string; region: string }[];
}) {
  const visibleTabs = TABS.filter((t) => {
    if (t.id === "saved") return savedPublic || isOwner;
    if (t.id === "liked") return likedPublic || isOwner;
    return true;
  });

  function getViews(v: ProfileVideo) {
    return v.metrics?.views ?? 0;
  }

  return (
    <>
      <nav className="mb-4 flex gap-1 border-b border-metin2-wood">
        {visibleTabs.map((tab) => (
          <Link
            key={tab.id}
            href={`/u/${username}?tab=${tab.id}`}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-b-2 border-metin2-gold text-metin2-gold"
                : "text-metin2-parchment/70 hover:text-metin2-parchment"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {activeTab === "videos" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {videos.length === 0 ? (
            <p className="text-metin2-parchment/60">No public videos yet.</p>
          ) : (
            videos.map((v) => (
              <Metin2Frame key={v.id} variant="wood">
                <Link href={`/?v=${v.id}`} className="block">
                  <p className="font-medium text-metin2-gold">{v.title}</p>
                  <p className="text-xs text-metin2-parchment/60">
                    {getViews(v)} views · {v._count.likes} likes
                  </p>
                </Link>
              </Metin2Frame>
            ))
          )}
        </div>
      )}

      {activeTab === "liked" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {likedVideos.length === 0 ? (
            <p className="text-metin2-parchment/60">No liked videos.</p>
          ) : (
            likedVideos.map((v) => (
              <Metin2Frame key={v.id} variant="wood">
                <Link href={`/?v=${v.id}`} className="block">
                  <p className="font-medium text-metin2-gold">{v.title}</p>
                </Link>
              </Metin2Frame>
            ))
          )}
        </div>
      )}

      {activeTab === "saved" && (savedPublic || isOwner) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {savedVideos.length === 0 ? (
            <p className="text-metin2-parchment/60">No saved videos.</p>
          ) : (
            savedVideos.map((v) => (
              <Metin2Frame key={v.id} variant="wood">
                <Link href={`/?v=${v.id}`} className="block">
                  <p className="font-medium text-metin2-gold">{v.title}</p>
                </Link>
              </Metin2Frame>
            ))
          )}
        </div>
      )}

      {activeTab === "servers" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {servers.length === 0 ? (
            <p className="text-metin2-parchment/60">No server profiles.</p>
          ) : (
            servers.map((s) => (
              <Metin2Frame key={s.id} variant="wood">
                <Link href={`/server/${s.slug}`} className="block">
                  <p className="font-medium text-metin2-gold">{s.name}</p>
                  <p className="text-xs text-metin2-parchment/60">{s.serverType} · {s.region}</p>
                </Link>
              </Metin2Frame>
            ))
          )}
        </div>
      )}
    </>
  );
}
