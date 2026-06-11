import Link from "next/link";
import { cn } from "@/lib/utils";
import { ProfileVideoGrid, type ProfileGridVideo } from "@/components/profile/profile-video-grid";

const TABS = [
  { id: "videos", label: "Videos" },
  { id: "saved", label: "Saved" },
  { id: "liked", label: "Liked" },
  { id: "servers", label: "Servers" },
] as const;

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
  videos: ProfileGridVideo[];
  likedVideos: ProfileGridVideo[];
  savedVideos: ProfileGridVideo[];
  servers: {
    id: string;
    name: string;
    slug: string;
    schoolType: string;
    gameplayDifficulty: string;
    originCountry: string;
  }[];
}) {
  const visibleTabs = TABS.filter((t) => {
    if (t.id === "saved") return savedPublic || isOwner;
    if (t.id === "liked") return likedPublic || isOwner;
    return true;
  });

  return (
    <>
      <nav className="mb-4 flex border-b border-zinc-800">
        {visibleTabs.map((tab) => (
          <Link
            key={tab.id}
            href={`/u/${username}?tab=${tab.id}`}
            className={cn(
              "flex-1 py-3 text-center text-sm font-semibold transition-colors",
              activeTab === tab.id
                ? "border-b-2 border-red-500 text-red-400"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {activeTab === "videos" && (
        <ProfileVideoGrid
          videos={videos}
          emptyMessage={isOwner ? "No videos yet. Upload your first promo!" : "No public videos yet."}
        />
      )}

      {activeTab === "liked" && (
        <ProfileVideoGrid videos={likedVideos} emptyMessage="No liked videos." />
      )}

      {activeTab === "saved" && (savedPublic || isOwner) && (
        <ProfileVideoGrid videos={savedVideos} emptyMessage="No saved videos." />
      )}

      {activeTab === "servers" && (
        <div className="grid gap-3 py-4 sm:grid-cols-2">
          {servers.length === 0 ? (
            <p className="col-span-full py-8 text-center text-sm text-zinc-500">
              {isOwner ? "No server profiles yet. Submit a server!" : "No server profiles."}
            </p>
          ) : (
            servers.map((s) => (
              <Link
                key={s.id}
                href={`/server/${s.slug}`}
                className="app-card block p-4 transition-colors hover:border-zinc-700"
              >
                <p className="font-semibold text-white">{s.name}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {s.schoolType} · {s.gameplayDifficulty} · {s.originCountry}
                </p>
              </Link>
            ))
          )}
        </div>
      )}
    </>
  );
}
