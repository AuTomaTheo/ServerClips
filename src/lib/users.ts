import slugify from "slugify";
import { prisma } from "@/lib/prisma";

export async function generateUniqueUsername(base: string, excludeUserId?: string) {
  const normalized =
    slugify(base, { lower: true, strict: true }).slice(0, 30) || "user";
  let username = normalized;
  let counter = 1;

  while (true) {
    const existing = await prisma.user.findFirst({
      where: {
        username,
        ...(excludeUserId ? { NOT: { id: excludeUserId } } : {}),
      },
    });
    if (!existing) return username;
    username = `${normalized}${counter++}`.slice(0, 30);
  }
}

export const profileSelect = {
  id: true,
  username: true,
  displayName: true,
  name: true,
  bio: true,
  avatarUrl: true,
  bannerUrl: true,
  websiteUrl: true,
  socialLinks: true,
  likedVideosPublic: true,
  savedVideosPublic: true,
  role: true,
  status: true,
  createdAt: true,
} as const;

export async function getProfileStats(userId: string) {
  const [followers, following, totalLikes, videoCount] = await Promise.all([
    prisma.follow.count({ where: { followingId: userId } }),
    prisma.follow.count({ where: { followerId: userId } }),
    prisma.like.count({
      where: { video: { creatorId: userId, status: "APPROVED" } },
    }),
    prisma.video.count({
      where: { creatorId: userId, status: "APPROVED", visibility: "PUBLIC" },
    }),
  ]);

  return { followers, following, totalLikes, videoCount };
}

export async function isFollowing(followerId: string, followingId: string) {
  const row = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });
  return !!row;
}
