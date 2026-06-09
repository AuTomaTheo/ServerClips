import {
  Prisma,
  ReferrerSource,
  ViewSource,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type VideoMetricCounterField =
  | "views"
  | "uniqueViews"
  | "likes"
  | "comments"
  | "saves"
  | "shares"
  | "serverClicks"
  | "profileClicks";

async function ensureVideoMetric(videoId: string) {
  return prisma.videoMetric.upsert({
    where: { videoId },
    create: { videoId },
    update: {},
  });
}

export async function incrementVideoMetric(
  videoId: string,
  field: VideoMetricCounterField,
  amount = 1
) {
  await ensureVideoMetric(videoId);
  await prisma.videoMetric.update({
    where: { videoId },
    data: { [field]: { increment: amount } },
  });
}

export async function updateVideoMetricAverages(
  videoId: string,
  watchSeconds: number,
  completed: boolean
) {
  const metric = await ensureVideoMetric(videoId);
  const viewCount = Math.max(metric.views, 1);
  const nextAverage =
    (metric.averageWatchSeconds * (viewCount - 1) + watchSeconds) / viewCount;
  const completionSamples = metric.views;
  const nextCompletion =
    completionSamples <= 1
      ? completed
        ? 1
        : 0
      : (metric.completionRate * (completionSamples - 1) + (completed ? 1 : 0)) /
        completionSamples;

  await prisma.videoMetric.update({
    where: { videoId },
    data: {
      averageWatchSeconds: nextAverage,
      completionRate: nextCompletion,
    },
  });
}

export async function trackVideoView(params: {
  videoId: string;
  userId?: string;
  sessionId?: string;
  watchSeconds?: number;
  completed?: boolean;
  source?: ViewSource;
}) {
  const {
    videoId,
    userId,
    sessionId,
    watchSeconds = 0,
    completed = false,
    source = "FEED",
  } = params;

  const identityFilter: Prisma.VideoViewEventWhereInput[] = [];
  if (userId) identityFilter.push({ userId });
  if (sessionId) identityFilter.push({ sessionId });

  const priorViews =
    identityFilter.length > 0
      ? await prisma.videoViewEvent.count({
          where: {
            videoId,
            OR: identityFilter,
          },
        })
      : 0;

  await prisma.videoViewEvent.create({
    data: {
      videoId,
      userId,
      sessionId,
      watchSeconds,
      completed,
      source,
    },
  });

  await incrementVideoMetric(videoId, "views");
  if (priorViews === 0) {
    await incrementVideoMetric(videoId, "uniqueViews");
  }

  if (watchSeconds > 0 || completed) {
    await updateVideoMetricAverages(videoId, watchSeconds, completed);
  }
}

export async function trackServerClick(params: {
  serverId: string;
  videoId?: string;
  userId?: string;
  sessionId?: string;
  referrerSource?: ReferrerSource;
  clickType?: string;
}) {
  const {
    serverId,
    videoId,
    userId,
    sessionId,
    referrerSource = "FEED",
    clickType = "website",
  } = params;

  await prisma.serverClickEvent.create({
    data: {
      serverId,
      videoId,
      userId,
      sessionId,
      referrerSource,
      clickType,
    },
  });

  await prisma.server.update({
    where: { id: serverId },
    data: { profileViews: { increment: clickType === "profile" ? 1 : 0 } },
  });

  if (videoId) {
    await incrementVideoMetric(videoId, "serverClicks");
  }
}

export async function trackSearch(params: {
  userId?: string;
  sessionId?: string;
  query?: string;
  filters?: Prisma.InputJsonValue;
}) {
  await prisma.searchEvent.create({
    data: {
      userId: params.userId,
      sessionId: params.sessionId,
      query: params.query,
      filters: params.filters,
    },
  });
}

export async function trackProfileClick(videoId: string) {
  await incrementVideoMetric(videoId, "profileClicks");
}

/** Convenience wrapper for simple view increments without event detail. */
export async function incrementVideoViews(videoId: string) {
  await trackVideoView({ videoId });
}
