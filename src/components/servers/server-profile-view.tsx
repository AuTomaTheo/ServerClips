import Image from "next/image";
import Link from "next/link";
import { ServerMediaImage } from "@/components/servers/server-media-image";
import { format } from "date-fns";
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  ChevronRight,
  ExternalLink,
  Globe,
  MessageCircle,
  Play,
  Shield,
  Sparkles,
  Swords,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import {
  GAMEPLAY_DIFFICULTIES,
  SCHOOL_TYPES,
  SERVER_SYSTEMS,
} from "@/lib/constants";
import { otherSystemsLabels } from "@/lib/server-systems";
import { countryFlag, languageFlag } from "@/lib/locale-flags";
import { formatNumber, cn } from "@/lib/utils";
import { ServerFollowButton } from "@/components/servers/server-follow-button";
import { ServerShareButton } from "@/components/servers/server-share-button";
import { ReportDialog } from "@/components/reports/report-dialog";

function labelFor(value: string, list: readonly { value: string; label: string }[]) {
  return list.find((item) => item.value === value)?.label ?? value;
}

function formatDuration(seconds: number | null | undefined) {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export type ServerProfileVideo = {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  duration: number | null;
  views: number;
  creator: {
    id: string;
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
  };
};

export type ServerProfileCreator = {
  id: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  followers: number;
  totalViews: number;
};

export type ServerProfileViewProps = {
  server: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    bannerUrl: string | null;
    description: string | null;
    websiteUrl: string | null;
    discordUrl: string | null;
    launchDate: Date | null;
    maxLevel: number | null;
    schoolType: string;
    gameplayDifficulty: string;
    originCountry: string;
    mainLanguage: string;
    supportedLanguages: string[];
    verified: boolean;
    status: string;
    profileViews: number;
    otherSystems: string | null;
    systemAlchemy: boolean;
    systemScarf: boolean;
    systemLycan: boolean;
    systemBonus67: boolean;
    systemOfflineShop: boolean;
    systemCostume: boolean;
    systemPet: boolean;
    systemMount: boolean;
    systemBattlePass: boolean;
    systemDungeonRanking: boolean;
    systemElement: boolean;
    systemTalisman: boolean;
  };
  videos: ServerProfileVideo[];
  mediaUrls: string[];
  topCreators: ServerProfileCreator[];
  followerCount: number;
  isFollowing: boolean;
  isAuthenticated: boolean;
  canEdit: boolean;
  isMember: boolean;
};

function ProfileCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-zinc-800 bg-zinc-900/80 p-5", className)}>
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-500">{title}</h2>
      {children}
    </section>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-zinc-800/80 py-3 last:border-0">
      <span className="shrink-0 text-sm text-zinc-500">{label}</span>
      <span className="text-right text-sm text-white">{children}</span>
    </div>
  );
}

function StatPill({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-1 border-r border-zinc-800 px-3 py-4 last:border-r-0 sm:px-4">
      <Icon className="mb-1 h-4 w-4 text-red-500" />
      <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{label}</span>
      <span className="truncate text-sm font-bold text-white">{value}</span>
    </div>
  );
}

export function ServerProfileView({
  server,
  videos,
  mediaUrls,
  topCreators,
  followerCount,
  isFollowing,
  isAuthenticated,
  canEdit,
  isMember,
}: ServerProfileViewProps) {
  const schoolLabel = labelFor(server.schoolType, SCHOOL_TYPES);
  const difficultyLabel = labelFor(server.gameplayDifficulty, GAMEPLAY_DIFFICULTIES);
  const customSystems = otherSystemsLabels(server.otherSystems);
  const hasAnySystem = SERVER_SYSTEMS.some((s) => server[s.key] === true) || customSystems.length > 0;
  const subtitle = [schoolLabel, difficultyLabel].filter(Boolean).join(" • ");
  const totalViews = videos.reduce((sum, v) => sum + v.views, 0);

  return (
    <div className="pb-16">
      {/* Hero */}
      <div className="relative">
        <div className="relative h-56 sm:h-72 md:h-80">
          {server.bannerUrl ? (
            <ServerMediaImage
              src={server.bannerUrl}
              alt=""
              className="absolute inset-0"
              priority
            />
          ) : (
            <div className="h-full bg-gradient-to-br from-zinc-900 via-red-950/40 to-zinc-950" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/40 to-transparent" />
        </div>

        <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-4 sm:p-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700/80 bg-black/40 px-3 py-2 text-sm text-white backdrop-blur-sm transition-all hover:bg-black/60 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to feed
          </Link>
          <div className="flex items-center gap-2">
            <ServerShareButton slug={server.slug} name={server.name} />
            <ReportDialog
              targetType="SERVER"
              targetId={server.id}
              trigger={
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900/80 text-white backdrop-blur-sm transition-all hover:bg-zinc-800 active:scale-95"
                  aria-label="More options"
                >
                  <span className="text-lg leading-none">⋯</span>
                </button>
              }
            />
          </div>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="-mt-16 flex flex-col gap-6 sm:-mt-20 sm:flex-row sm:items-end">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border-4 border-[#0a0a0a] bg-zinc-900 shadow-xl sm:h-32 sm:w-32">
              {server.logoUrl ? (
                <ServerMediaImage src={server.logoUrl} alt={server.name} className="absolute inset-0" priority />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-red-700 to-red-950 text-3xl font-bold">
                  {server.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 pb-2">
              {server.verified && (
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  VERIFIED SERVER
                </div>
              )}
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{server.name}</h1>
              <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {server.websiteUrl && (
              <a
                href={server.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-900/30 transition-all hover:bg-red-500 active:scale-[0.97]"
              >
                Visit Website
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            {server.discordUrl && (
              <a
                href={server.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-600 bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-zinc-800 active:scale-[0.97]"
              >
                <MessageCircle className="h-4 w-4" />
                Join Discord
              </a>
            )}
            <ServerFollowButton
              serverId={server.id}
              serverSlug={server.slug}
              initialFollowing={isFollowing}
              initialFollowers={followerCount}
              isAuthenticated={isAuthenticated}
            />
            {canEdit && (
              <Link
                href={`/studio/servers/${server.id}/edit`}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-600 bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-zinc-800 active:scale-[0.97]"
              >
                Edit profile
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        {server.status !== "APPROVED" && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            This server profile is <strong>{server.status}</strong> and may not be visible publicly yet.
          </div>
        )}

        {/* Quick stats */}
        <div className="flex overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60">
          <StatPill
            icon={Calendar}
            label="Launch Date"
            value={server.launchDate ? format(server.launchDate, "MMM d, yyyy") : "TBA"}
          />
          <StatPill
            icon={TrendingUp}
            label="Max Level"
            value={server.maxLevel != null ? String(server.maxLevel) : "—"}
          />
          <StatPill icon={Users} label="Followers" value={formatNumber(followerCount)} />
          <StatPill icon={Swords} label="Server Type" value={schoolLabel} />
          <StatPill icon={Zap} label="Game Style" value={difficultyLabel} />
        </div>

        {/* Info grid */}
        <div className="grid gap-4 lg:grid-cols-3">
          <ProfileCard title="Basic Information">
            <InfoRow label="Origin">
              <span className="inline-flex items-center gap-1.5">
                {countryFlag(server.originCountry)} {server.originCountry}
              </span>
            </InfoRow>
            <InfoRow label="Main Language">
              <span className="inline-flex items-center gap-1.5">
                {languageFlag(server.mainLanguage)} {server.mainLanguage}
              </span>
            </InfoRow>
            <InfoRow label="Supported Languages">
              <span className="inline-flex flex-wrap justify-end gap-1">
                {server.supportedLanguages.map((lang) => (
                  <span key={lang} title={lang} className="text-base">
                    {languageFlag(lang)}
                  </span>
                ))}
              </span>
            </InfoRow>
            <InfoRow label="Website">
              {server.websiteUrl ? (
                <a
                  href={server.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-400 hover:underline"
                >
                  {server.websiteUrl.replace(/^https?:\/\//, "")}
                </a>
              ) : (
                <span className="text-zinc-600">—</span>
              )}
            </InfoRow>
            <InfoRow label="Discord">
              {server.discordUrl ? (
                <a
                  href={server.discordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-400 hover:underline"
                >
                  Join server
                </a>
              ) : (
                <span className="text-zinc-600">—</span>
              )}
            </InfoRow>
          </ProfileCard>

          <ProfileCard title="Gameplay">
            <InfoRow label="School Type">
              <span className="rounded-full bg-red-600/20 px-2.5 py-0.5 text-xs font-semibold text-red-400">
                {schoolLabel}
              </span>
            </InfoRow>
            <InfoRow label="Gameplay Style">
              <span className="rounded-full bg-red-600/20 px-2.5 py-0.5 text-xs font-semibold text-red-400">
                {difficultyLabel}
              </span>
            </InfoRow>
            <InfoRow label="Max Level">{server.maxLevel ?? "—"}</InfoRow>
            <InfoRow label="Profile Views">{formatNumber(server.profileViews)}</InfoRow>
            <InfoRow label="Promo Videos">{videos.length}</InfoRow>
          </ProfileCard>

          <ProfileCard title="Systems & Features">
            {!hasAnySystem ? (
              <p className="text-sm text-zinc-500">No systems listed yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {SERVER_SYSTEMS.filter((s) => server[s.key] === true).map((s) => (
                  <span
                    key={s.key}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium",
                      s.key === "systemLycan"
                        ? "border-red-500/40 bg-red-500/10 text-red-400"
                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    )}
                  >
                    ✓ {s.label}
                  </span>
                ))}
                {customSystems.map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400"
                  >
                    ✓ {label}
                  </span>
                ))}
              </div>
            )}
          </ProfileCard>
        </div>

        {/* About */}
        {server.description && (
          <ProfileCard title={`About ${server.name}`}>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
              {server.description}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-zinc-800 pt-6 sm:grid-cols-4">
              {[
                { icon: Shield, label: "Stable & Secure" },
                { icon: Users, label: "Active Staff" },
                { icon: Sparkles, label: "Daily Events" },
                { icon: Globe, label: "Long Term Vision" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800">
                    <Icon className="h-5 w-5 text-red-500" />
                  </div>
                  <span className="text-xs text-zinc-400">{label}</span>
                </div>
              ))}
            </div>
          </ProfileCard>
        )}

        {/* Media */}
        {mediaUrls.length > 0 && (
          <ProfileCard title="Media">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              {mediaUrls.slice(0, 4).map((url, i) => (
                <div
                  key={`${url}-${i}`}
                  className="relative aspect-video overflow-hidden rounded-lg border border-zinc-800 bg-zinc-800"
                >
                  <ServerMediaImage src={url} alt="" className="absolute inset-0" />
                </div>
              ))}
              {mediaUrls.length > 4 && (
                <div className="flex aspect-video items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800/50 text-sm text-zinc-400">
                  View all {mediaUrls.length} images
                </div>
              )}
            </div>
          </ProfileCard>
        )}

        {/* Related videos */}
        {videos.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                Related Videos
              </h2>
              {videos.length > 5 && (
                <span className="text-xs text-zinc-500">{videos.length} videos</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {videos.slice(0, 5).map((video) => (
                <Link
                  key={video.id}
                  href={`/search?q=${encodeURIComponent(server.name)}`}
                  className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition-all hover:border-zinc-600 active:scale-[0.98]"
                >
                  <div className="relative aspect-video bg-zinc-800">
                    {video.thumbnailUrl ? (
                      <Image
                        src={video.thumbnailUrl}
                        alt={video.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Play className="h-8 w-8 text-zinc-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                      <Play className="h-10 w-10 fill-white text-white" />
                    </div>
                    {formatDuration(video.duration) && (
                      <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium">
                        {formatDuration(video.duration)}
                      </span>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="line-clamp-2 text-xs font-semibold text-white">{video.title}</p>
                    <p className="mt-1 truncate text-[10px] text-zinc-500">
                      {video.creator.displayName ?? video.creator.username ?? "Creator"} ·{" "}
                      {formatNumber(video.views)} views
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Top creators */}
        {topCreators.length > 0 && (
          <section>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
              Top Creators & Promoters
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {topCreators.slice(0, 3).map((creator) => (
                <div
                  key={creator.id}
                  className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-zinc-800">
                    {creator.avatarUrl ? (
                      <Image
                        src={creator.avatarUrl}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm font-bold text-zinc-500">
                        {(creator.displayName ?? creator.username ?? "?").charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    {creator.username ? (
                      <Link
                        href={`/u/${creator.username}`}
                        className="truncate text-sm font-semibold text-white hover:text-red-400"
                      >
                        {creator.displayName ?? `@${creator.username}`}
                      </Link>
                    ) : (
                      <p className="truncate text-sm font-semibold text-white">Creator</p>
                    )}
                    <p className="text-[10px] text-zinc-500">
                      {formatNumber(creator.followers)} followers · {formatNumber(creator.totalViews)} views
                    </p>
                  </div>
                  {creator.username && (
                    <Link
                      href={`/u/${creator.username}`}
                      className="shrink-0 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-red-500 active:scale-95"
                    >
                      Follow
                    </Link>
                  )}
                </div>
              ))}
              {topCreators.length > 3 && (
                <div className="flex items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-4 text-sm text-zinc-500">
                  +{topCreators.length - 3} more creators
                </div>
              )}
            </div>
          </section>
        )}

        {/* Claim CTA */}
        {!isMember && server.status === "APPROVED" && (
          <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 sm:flex-row sm:items-center">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-600/20">
                <Shield className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Think this is your server?</h3>
                <p className="mt-1 max-w-lg text-sm text-zinc-400">
                  Submit or claim your server profile to unlock analytics, manage your listing, and
                  connect promo videos.
                </p>
              </div>
            </div>
            <Link
              href={isAuthenticated ? "/submit-server" : "/login?callbackUrl=/submit-server"}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-red-500 active:scale-[0.97]"
            >
              Claim This Server
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {totalViews > 0 && (
          <p className="text-center text-xs text-zinc-600">
            {formatNumber(totalViews)} total video views across {videos.length} promo clip
            {videos.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
}
