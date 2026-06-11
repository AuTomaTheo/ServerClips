import { GAMEPLAY_DIFFICULTIES, SCHOOL_TYPES } from "@/lib/constants";
import { buildServerSystemsWhere } from "@/lib/server-systems";
import type { Prisma } from "@/generated/prisma/client";
import type { FeedFilters } from "@/types/feed";

export interface RankableVideo {
  id: string;
  creatorId: string;
  title: string;
  description: string | null;
  createdAt: Date;
  metrics: {
    views: number;
    likes: number;
    comments: number;
    saves?: number;
    serverClicks?: number;
    completionRate?: number;
  } | null;
  server: {
    name: string;
    schoolType: string;
    gameplayDifficulty: string;
    mainLanguage: string;
    originCountry: string;
    maxLevel: number | null;
    launchDate: Date | null;
    featured: boolean;
    verified: boolean;
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
    tags: { tag: { name: string } }[];
  } | null;
}

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

function tokenize(query: string): string[] {
  return normalize(query).split(/\s+/).filter((t) => t.length > 1);
}

function metricViews(video: RankableVideo) {
  return video.metrics?.views ?? 0;
}

function metricLikes(video: RankableVideo) {
  return video.metrics?.likes ?? 0;
}

function labelForSchool(value: string) {
  return SCHOOL_TYPES.find((t) => t.value === value)?.label.toLowerCase() ?? "";
}

function labelForDifficulty(value: string) {
  return GAMEPLAY_DIFFICULTIES.find((t) => t.value === value)?.label.toLowerCase() ?? "";
}

export function rankVideos<T extends RankableVideo>(videos: T[], query?: string): T[] {
  if (!query?.trim()) {
    return [...videos].sort((a, b) => {
      const popA =
        metricLikes(a) * 3 +
        metricViews(a) +
        (a.server?.featured ? 100 : 0) +
        (a.server?.verified ? 25 : 0);
      const popB =
        metricLikes(b) * 3 +
        metricViews(b) +
        (b.server?.featured ? 100 : 0) +
        (b.server?.verified ? 25 : 0);
      if (popB !== popA) return popB - popA;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  const tokens = tokenize(query);

  const scored = videos.map((video) => {
    let score = 0;
    const n = normalize(video.title);
    for (const token of tokens) {
      if (n.includes(token)) score += 20;
    }

    const server = video.server;
    if (server) {
      const sn = normalize(server.name);
      for (const token of tokens) {
        if (sn.includes(token)) score += 25;
      }
      const schoolLabel = labelForSchool(server.schoolType);
      const diffLabel = labelForDifficulty(server.gameplayDifficulty);
      for (const token of tokens) {
        if (
          server.schoolType.toLowerCase().includes(token) ||
          schoolLabel.includes(token) ||
          server.gameplayDifficulty.toLowerCase().includes(token) ||
          diffLabel.includes(token)
        ) {
          score += 15;
        }
      }
      for (const tag of server.tags) {
        const t = normalize(tag.tag.name);
        for (const token of tokens) {
          if (t.includes(token)) score += 12;
        }
      }
    }

    if (video.description) {
      const d = normalize(video.description);
      for (const token of tokens) {
        if (d.includes(token)) score += 8;
      }
    }

    score += Math.log10(metricLikes(video) + 1) * 5;
    score += Math.log10(metricViews(video) + 1) * 2;
    if (server?.verified) score += 10;

    return { video, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.video) as T[];
}

function normalizeFeedFilters(filters: FeedFilters): FeedFilters {
  return {
    ...filters,
    schoolType: filters.schoolType ?? filters.serverType,
    mainLanguage: filters.mainLanguage ?? filters.language,
    originCountry: filters.originCountry ?? filters.region,
  };
}

export function buildFeedWhere(filters: FeedFilters): {
  where: Prisma.VideoWhereInput;
  recentlyAdded: boolean;
} {
  const f = normalizeFeedFilters(filters);
  const and: Prisma.VideoWhereInput[] = [
    { status: "APPROVED", visibility: "PUBLIC" },
    { creator: { status: { in: ["ACTIVE", "WARNED"] } } },
  ];

  const serverWhere: Prisma.ServerWhereInput = {};

  if (f.schoolType) {
    serverWhere.schoolType = f.schoolType as Prisma.EnumSchoolTypeFilter;
  }
  if (f.gameplayDifficulty) {
    serverWhere.gameplayDifficulty = f.gameplayDifficulty as Prisma.EnumGameplayDifficultyFilter;
  }
  if (f.mainLanguage) {
    serverWhere.mainLanguage = f.mainLanguage;
  }
  if (f.originCountry) {
    serverWhere.originCountry = f.originCountry;
  }
  if (f.maxLevel) {
    serverWhere.maxLevel = { lte: f.maxLevel };
  }
  if (f.verifiedOnly) {
    serverWhere.verified = true;
  }
  if (f.systems?.length) {
    serverWhere.AND = buildServerSystemsWhere(f.systems);
  }
  if (f.international) {
    serverWhere.OR = [
      { mainLanguage: "English" },
      { originCountry: "Global" },
      { supportedLanguages: { has: "English" } },
    ];
  }
  if (f.launchingSoon) {
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    serverWhere.launchDate = { gte: now, lte: in30Days };
  }

  if (Object.keys(serverWhere).length > 0) {
    and.push({ server: serverWhere });
  }

  return { where: { AND: and }, recentlyAdded: !!f.recentlyAdded };
}

export function rankServers<
  T extends {
    name: string;
    description: string | null;
    _count: { videos: number };
    createdAt: Date;
    featured?: boolean;
    verified?: boolean;
    tags: { tag: { name: string } }[];
    mainLanguage: string;
    originCountry: string;
    schoolType: string;
    gameplayDifficulty: string;
    videos?: { metrics?: { views: number } | null }[];
  },
>(servers: T[], query?: string): T[] {
  if (!query?.trim()) {
    return [...servers].sort((a, b) => {
      const viewsA = a.videos?.reduce((s, v) => s + (v.metrics?.views ?? 0), 0) ?? 0;
      const viewsB = b.videos?.reduce((s, v) => s + (v.metrics?.views ?? 0), 0) ?? 0;
      const popA = a._count.videos * 10 + viewsA + (a.featured ? 100 : 0) + (a.verified ? 25 : 0);
      const popB = b._count.videos * 10 + viewsB + (b.featured ? 100 : 0) + (b.verified ? 25 : 0);
      return popB - popA || b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  const tokens = tokenize(query);
  return servers
    .map((server) => {
      let score = 0;
      const n = normalize(server.name);
      for (const t of tokens) if (n.includes(t)) score += 20;
      for (const tag of server.tags) {
        for (const t of tokens) if (normalize(tag.tag.name).includes(t)) score += 12;
      }
      const schoolLabel = labelForSchool(server.schoolType);
      const diffLabel = labelForDifficulty(server.gameplayDifficulty);
      for (const t of tokens) {
        if (
          server.schoolType.toLowerCase().includes(t) ||
          schoolLabel.includes(t) ||
          server.gameplayDifficulty.toLowerCase().includes(t) ||
          diffLabel.includes(t)
        ) {
          score += 15;
        }
      }
      if (server.verified) score += 10;
      return { server, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.server);
}

/** @deprecated Use rankServers */
export const rankListings = rankServers;
