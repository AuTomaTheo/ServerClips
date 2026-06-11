import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/client";

export async function generateUniqueUsername(base: string, excludeUserId?: string) {
  const slug = slugify(base, { lower: true, strict: true }) || "user";
  let username = slug.slice(0, 30);
  let counter = 1;

  while (true) {
    const existing = await prisma.user.findFirst({
      where: { username, ...(excludeUserId ? { NOT: { id: excludeUserId } } : {}) },
    });
    if (!existing) return username;
    username = `${slug.slice(0, 26)}-${counter++}`;
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
} as const;

export async function getProfileStats(userId: string) {
  const [followers, following, totalLikes, videoCount] = await Promise.all([
    prisma.follow.count({ where: { followingId: userId } }),
    prisma.follow.count({ where: { followerId: userId } }),
    prisma.like.count({ where: { video: { creatorId: userId } } }),
    prisma.video.count({ where: { creatorId: userId, status: "APPROVED", visibility: "PUBLIC" } }),
  ]);

  return { followers, following, totalLikes, videoCount };
}

export async function isFollowing(followerId: string, followingId: string) {
  const row = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });
  return !!row;
}

/** First video upload upgrades USER → CREATOR. */
export async function promoteToCreatorIfNeeded(userId: string, currentRole: Role): Promise<boolean> {
  if (currentRole !== "USER") return false;

  await prisma.user.update({
    where: { id: userId },
    data: { role: "CREATOR" },
  });

  return true;
}
