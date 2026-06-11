import Image from "next/image";
import Link from "next/link";
import { Settings, Upload, Server, LayoutDashboard } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ProfileFollowButton } from "@/components/profile/profile-follow-button";
import { ProfileShareButton } from "@/components/profile/profile-share-button";
import { cn } from "@/lib/utils";

interface ProfileHeaderProps {
  user: {
    username: string | null;
    displayName: string | null;
    name: string | null;
    bio: string | null;
    avatarUrl: string | null;
    bannerUrl: string | null;
    websiteUrl: string | null;
    socialLinks: unknown;
    role: string;
  };
  stats: {
    followers: number;
    following: number;
    totalLikes: number;
    videoCount: number;
  };
  isOwner: boolean;
  following: boolean;
}

export function ProfileHeader({ user, stats, isOwner, following }: ProfileHeaderProps) {
  const social = (user.socialLinks as Record<string, string> | null) ?? {};
  const displayName = user.displayName ?? user.name ?? user.username ?? "User";

  return (
    <div className="app-card mb-6 overflow-hidden">
      {user.bannerUrl && (
        <div className="relative h-32 overflow-hidden">
          <Image src={user.bannerUrl} alt="" fill className="object-cover" unoptimized />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
        </div>
      )}

      <div className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="relative mx-auto h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-zinc-700 bg-zinc-800 sm:mx-0 sm:-mt-12">
            {user.avatarUrl ? (
              <Image src={user.avatarUrl} alt="" fill className="object-cover" unoptimized />
            ) : (
              <div className="flex h-full items-center justify-center text-2xl font-bold text-red-400">
                {displayName[0]?.toUpperCase() ?? "?"}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
              <h1 className="text-xl font-bold text-white sm:text-2xl">{displayName}</h1>
              {user.username && (
                <span className="text-sm text-zinc-500">@{user.username}</span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap justify-center gap-5 text-sm sm:justify-start">
              <span>
                <strong className="text-white">{formatNumber(stats.following)}</strong>
                <span className="ml-1 text-zinc-500">Following</span>
              </span>
              <span>
                <strong className="text-white">{formatNumber(stats.followers)}</strong>
                <span className="ml-1 text-zinc-500">Followers</span>
              </span>
              <span>
                <strong className="text-white">{formatNumber(stats.totalLikes)}</strong>
                <span className="ml-1 text-zinc-500">Likes</span>
              </span>
            </div>

            {user.bio ? (
              <p className="mt-3 text-sm text-zinc-400">{user.bio}</p>
            ) : isOwner ? (
              <p className="mt-3 text-sm text-zinc-600">No bio yet.</p>
            ) : null}

            {(user.websiteUrl || Object.values(social).some(Boolean)) && (
              <div className="mt-2 flex flex-wrap justify-center gap-2 text-xs sm:justify-start">
                {user.websiteUrl && (
                  <a
                    href={user.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400 hover:underline"
                  >
                    Website
                  </a>
                )}
                {Object.entries(social).map(([k, v]) =>
                  v ? (
                    <a
                      key={k}
                      href={v}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-400 capitalize hover:underline"
                    >
                      {k}
                    </a>
                  ) : null
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
          {isOwner ? (
            <>
              <Link href="/account/edit" className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
                <Settings className="h-4 w-4" />
                Edit profile
              </Link>
              <Link href="/studio/videos/new" className={cn(buttonVariants({ size: "sm" }))}>
                <Upload className="h-4 w-4" />
                Upload video
              </Link>
              <Link href="/submit-server" className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
                <Server className="h-4 w-4" />
                Submit server
              </Link>
              {(user.role === "CREATOR" || user.role === "MODERATOR" || user.role === "ADMIN") && (
                <Link href="/studio" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                  <LayoutDashboard className="h-4 w-4" />
                  Studio
                </Link>
              )}
            </>
          ) : (
            <>
              <ProfileFollowButton username={user.username!} initialFollowing={following} />
              <ProfileShareButton username={user.username!} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
