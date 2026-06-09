import { prisma } from "@/lib/prisma";
import { buildFeedWhere, rankVideos } from "@/lib/search-ranking";
import {
  publicVideoWhere,
  videoInclude,
  type VideoWithIncludes,
} from "@/lib/videos";
import type { FeedFilters } from "@/types/feed";

/** Tunable weights from product spec — adjust here without touching scoring logic. */
export const RECOMMENDATION_SCORES = {
  FOLLOWED_CREATOR: 50,
  FOLLOWED_SERVER: 50,
  SERVER_TYPE_MATCH: 30,
  LANGUAGE_REGION_MATCH: 25,
  SEARCH_TERM_MATCH: 20,
  HIGH_COMPLETION: 15,
  TRENDING: 10,
  RECENT: 5,
  WATCHED_PENALTY: -100,
} as const;

const WATCH_PENALTY_THRESHOLD = 2;
const RECENT_DAYS = 7;
const CANDIDATE_POOL = 200;

export interface GetRecommendedVideosParams {
  userId?: string;
  sessionId?: string;
  query?: string;
  filters?: FeedFilters;
  limit?: number;
  cursor?: string;
}

export interface RecommendedVideosResult {
  videos: VideoWithIncludes[];
  nextCursor: string | null;
  total: number;
}

type WeightMap = Record<string, number>;

interface RecommendationContext {
  followedCreatorIds: Set<string>;
  followedServerIds: Set<string>;
  watchCounts: Map<string, number>;
  serverTypeWeights: WeightMap;
  regionWeights: WeightMap;
  languageWeights: WeightMap;
  tagWeights: WeightMap;
  searchTokens: string[];
}

function normalize(text: string) {
  return text.toLowerCase().trim();
}

function tokenize(text?: string) {
  if (!text?.trim()) return [];
  return normalize(text).split(/\s+/).filter((t) => t.length > 1);
}

function bump(weights: WeightMap, key: string, amount = 1) {
  weights[key] = (weights[key] ?? 0) + amount;
}

function topKeys(weights: WeightMap, limit = 5) {
  return Object.entries(weights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key]) => key);
}

function parseJsonWeights(value: unknown): WeightMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: WeightMap = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (typeof val === "number" && Number.isFinite(val)) out[key] = val;
  }
  return out;
}

async function loadEngagedServerTraits(videoIds: string[]) {
  if (videoIds.length === 0) {
    return { serverTypeWeights: {}, regionWeights: {}, languageWeights: {}, tagWeights: {} };
  }

  const videos = await prisma.video.findMany({
    where: { id: { in: videoIds } },
    select: {
      server: {
        select: {
          serverType: true,
          region: true,
          language: true,
          tags: { select: { tag: { select: { name: true } } } },
        },
      },
    },
  });

  const serverTypeWeights: WeightMap = {};
  const regionWeights: WeightMap = {};
  const languageWeights: WeightMap = {};
  const tagWeights: WeightMap = {};

  for (const video of videos) {
    const server = video.server;
    if (!server) continue;
    bump(serverTypeWeights, server.serverType, 2);
    bump(regionWeights, server.region, 2);
    bump(languageWeights, server.language, 2);
    for (const tag of server.tags) {
      bump(tagWeights, normalize(tag.tag.name), 1);
    }
  }

  return { serverTypeWeights, regionWeights, languageWeights, tagWeights };
}

async function buildRecommendationContext(
  userId?: string,
  sessionId?: string,
  query?: string
): Promise<RecommendationContext> {
  const followedCreatorIds = new Set<string>();
  const followedServerIds = new Set<string>();
  const watchCounts = new Map<string, number>();

  let serverTypeWeights: WeightMap = {};
  let regionWeights: WeightMap = {};
  let languageWeights: WeightMap = {};
  let tagWeights: WeightMap = {};
  const searchTokens = new Set<string>(tokenize(query));

  const engagedVideoIds: string[] = [];

  if (userId) {
    const [creatorFollows, serverFollows, likes, saves, comments, preference, views, searches] =
      await Promise.all([
        prisma.follow.findMany({
          where: { followerId: userId },
          select: { followingId: true },
        }),
        prisma.serverFollow.findMany({
          where: { userId },
          select: { serverId: true },
        }),
        prisma.like.findMany({
          where: { userId },
          select: { videoId: true },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
        prisma.save.findMany({
          where: { userId },
          select: { videoId: true },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
        prisma.comment.findMany({
          where: { userId, status: "VISIBLE" },
          select: { videoId: true },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
        prisma.recommendationPreference.findUnique({ where: { userId } }),
        prisma.videoViewEvent.findMany({
          where: { userId },
          select: { videoId: true },
          orderBy: { createdAt: "desc" },
          take: 100,
        }),
        prisma.searchEvent.findMany({
          where: { userId },
          select: { query: true },
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
      ]);

    for (const f of creatorFollows) followedCreatorIds.add(f.followingId);
    for (const f of serverFollows) followedServerIds.add(f.serverId);

    engagedVideoIds.push(
      ...likes.map((l) => l.videoId),
      ...saves.map((s) => s.videoId),
      ...comments.map((c) => c.videoId)
    );

    for (const view of views) {
      watchCounts.set(view.videoId, (watchCounts.get(view.videoId) ?? 0) + 1);
    }

    for (const search of searches) {
      for (const token of tokenize(search.query ?? undefined)) searchTokens.add(token);
    }

    if (preference) {
      serverTypeWeights = { ...serverTypeWeights, ...parseJsonWeights(preference.serverTypeWeights) };
      regionWeights = { ...regionWeights, ...parseJsonWeights(preference.regionWeights) };
      languageWeights = { ...languageWeights, ...parseJsonWeights(preference.languageWeights) };
      tagWeights = { ...tagWeights, ...parseJsonWeights(preference.tagWeights) };
    }
  }

  if (sessionId) {
    const [views, searches] = await Promise.all([
      prisma.videoViewEvent.findMany({
        where: { sessionId },
        select: { videoId: true },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.searchEvent.findMany({
        where: { sessionId },
        select: { query: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    for (const view of views) {
      watchCounts.set(view.videoId, (watchCounts.get(view.videoId) ?? 0) + 1);
      engagedVideoIds.push(view.videoId);
    }

    for (const search of searches) {
      for (const token of tokenize(search.query ?? undefined)) searchTokens.add(token);
    }
  }

  const inferred = await loadEngagedServerTraits(Array.from(new Set(engagedVideoIds)));
  serverTypeWeights = { ...inferred.serverTypeWeights, ...serverTypeWeights };
  regionWeights = { ...inferred.regionWeights, ...regionWeights };
  languageWeights = { ...inferred.languageWeights, ...languageWeights };
  tagWeights = { ...inferred.tagWeights, ...tagWeights };

  return {
    followedCreatorIds,
    followedServerIds,
    watchCounts,
    serverTypeWeights,
    regionWeights,
    languageWeights,
    tagWeights,
    searchTokens: Array.from(searchTokens),
  };
}

function matchesTokens(haystack: string, tokens: string[]) {
  const normalized = normalize(haystack);
  return tokens.some((token) => normalized.includes(token));
}

function scoreVideo(
  video: VideoWithIncludes,
  ctx: RecommendationContext,
  query?: string,
  maxTrending = 1
): number {
  let score = 0;
  const metrics = video.metrics;
  const server = video.server;

  if (ctx.followedCreatorIds.has(video.creatorId)) {
    score += RECOMMENDATION_SCORES.FOLLOWED_CREATOR;
  }

  if (video.serverId && ctx.followedServerIds.has(video.serverId)) {
    score += RECOMMENDATION_SCORES.FOLLOWED_SERVER;
  }

  if (server) {
    const preferredTypes = topKeys(ctx.serverTypeWeights);
    if (preferredTypes.includes(server.serverType)) {
      score += RECOMMENDATION_SCORES.SERVER_TYPE_MATCH;
    }

    const preferredRegions = topKeys(ctx.regionWeights);
    const preferredLanguages = topKeys(ctx.languageWeights);
    if (preferredRegions.includes(server.region) || preferredLanguages.includes(server.language)) {
      score += RECOMMENDATION_SCORES.LANGUAGE_REGION_MATCH;
    }

    for (const tag of server.tags) {
      const tagName = normalize(tag.tag.name);
      if ((ctx.tagWeights[tagName] ?? 0) > 0) {
        score += Math.min(10, ctx.tagWeights[tagName]);
      }
    }
  }

  const searchTokens = query ? tokenize(query) : ctx.searchTokens;
  if (searchTokens.length > 0) {
    const fields = [
      video.title,
      video.description ?? "",
      server?.name ?? "",
      ...(server?.tags.map((t) => t.tag.name) ?? []),
    ];
    if (fields.some((field) => matchesTokens(field, searchTokens))) {
      score += RECOMMENDATION_SCORES.SEARCH_TERM_MATCH;
    }
  }

  const completionRate = metrics?.completionRate ?? 0;
  const avgWatch = metrics?.averageWatchSeconds ?? 0;
  if (completionRate >= 0.5 || avgWatch >= 15) {
    score += RECOMMENDATION_SCORES.HIGH_COMPLETION;
  }

  const trendingSignal = (metrics?.likes ?? 0) * 3 + (metrics?.views ?? 0);
  if (maxTrending > 0) {
    score += RECOMMENDATION_SCORES.TRENDING * (trendingSignal / maxTrending);
  }

  const recentCutoff = Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000;
  if (video.createdAt.getTime() >= recentCutoff) {
    score += RECOMMENDATION_SCORES.RECENT;
  }

  const watches = ctx.watchCounts.get(video.id) ?? 0;
  if (watches >= WATCH_PENALTY_THRESHOLD) {
    score += RECOMMENDATION_SCORES.WATCHED_PENALTY;
  }

  if (server?.verified) score += 5;
  if (server?.featured) score += 5;

  return score;
}

export async function getRecommendedVideos(
  params: GetRecommendedVideosParams
): Promise<RecommendedVideosResult> {
  const { userId, sessionId, query, filters = {}, limit = 20, cursor } = params;

  const filterWhere = filters.q || Object.keys(filters).some((k) => k !== "q" && filters[k as keyof FeedFilters])
    ? buildFeedWhere({ ...filters, q: filters.q ?? query }).where
    : publicVideoWhere();

  const candidates = await prisma.video.findMany({
    where: filterWhere,
    include: videoInclude,
    orderBy: { createdAt: "desc" },
    take: CANDIDATE_POOL,
  });

  const context = await buildRecommendationContext(userId, sessionId, query ?? filters.q);

  const maxTrending = Math.max(
    1,
    ...candidates.map((v) => (v.metrics?.likes ?? 0) * 3 + (v.metrics?.views ?? 0))
  );

  const personalized = [...candidates].sort((a, b) => {
    const scoreB = scoreVideo(b, context, query ?? filters.q, maxTrending);
    const scoreA = scoreVideo(a, context, query ?? filters.q, maxTrending);
    if (scoreB !== scoreA) return scoreB - scoreA;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const ranked = query?.trim() ? rankVideos(personalized, query) : personalized;

  let startIndex = 0;
  if (cursor) {
    const idx = ranked.findIndex((v) => v.id === cursor);
    startIndex = idx >= 0 ? idx + 1 : 0;
  }

  const page = ranked.slice(startIndex, startIndex + limit);
  const nextCursor =
    startIndex + limit < ranked.length ? page[page.length - 1]?.id ?? null : null;

  return {
    videos: page,
    nextCursor,
    total: ranked.length,
  };
}
