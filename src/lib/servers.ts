import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { ContentStatus, Prisma, ServerType } from "@/generated/prisma/client";

export async function generateUniqueSlug(name: string, excludeId?: string) {
  const base = slugify(name, { lower: true, strict: true }) || "server";
  let slug = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.server.findFirst({
      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    });
    if (!existing) return slug;
    slug = `${base}-${counter++}`;
  }
}

export interface ServerFilters {
  q?: string;
  language?: string;
  serverType?: string;
  region?: string;
  expRate?: string;
  launchAfter?: string;
  launchBefore?: string;
  featured?: boolean;
  verified?: boolean;
}

export function buildServerWhere(
  filters: ServerFilters,
  status: ContentStatus = "APPROVED"
): Prisma.ServerWhereInput {
  const where: Prisma.ServerWhereInput = { status };

  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
      { tags: { some: { tag: { name: { contains: filters.q, mode: "insensitive" } } } } },
    ];
  }

  if (filters.language) where.language = filters.language;
  if (filters.region) where.region = filters.region;
  if (filters.serverType) where.serverType = filters.serverType as ServerType;
  if (filters.expRate) where.expRate = { contains: filters.expRate, mode: "insensitive" };
  if (filters.featured) where.featured = true;
  if (filters.verified) where.verified = true;

  if (filters.launchAfter || filters.launchBefore) {
    where.launchDate = {};
    if (filters.launchAfter) where.launchDate.gte = new Date(filters.launchAfter);
    if (filters.launchBefore) where.launchDate.lte = new Date(filters.launchBefore);
  }

  return where;
}

export const serverInclude = {
  members: {
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          name: true,
          avatarUrl: true,
          image: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "asc" as const },
  },
  tags: { include: { tag: true } },
  videos: {
    where: { status: "APPROVED", visibility: "PUBLIC" },
    take: 1,
    orderBy: { createdAt: "desc" as const },
    select: {
      id: true,
      thumbnailUrl: true,
      videoUrl: true,
      metrics: {
        select: {
          views: true,
          likes: true,
          comments: true,
        },
      },
    },
  },
  _count: {
    select: {
      videos: { where: { status: "APPROVED" } },
      follows: true,
      members: true,
    },
  },
} as const;

export async function syncServerTags(serverId: string, tagsInput: string) {
  const tagNames = tagsInput
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 10);

  await prisma.serverTag.deleteMany({ where: { serverId } });

  for (const name of tagNames) {
    const slug = slugify(name, { lower: true, strict: true }) || "tag";
    const tag = await prisma.tag.upsert({
      where: { slug },
      create: { name, slug },
      update: { name },
    });
    await prisma.serverTag.create({
      data: { serverId, tagId: tag.id },
    });
  }
}

export async function getServerMember(serverId: string, userId: string) {
  return prisma.serverMember.findUnique({
    where: { serverId_userId: { serverId, userId } },
    select: { id: true, role: true, serverId: true, userId: true },
  });
}

export async function getUserServers(userId: string) {
  return prisma.serverMember.findMany({
    where: { userId },
    include: {
      server: {
        include: serverInclude,
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

/** @deprecated Use buildServerWhere */
export const buildListingWhere = buildServerWhere;

/** @deprecated Use serverInclude */
export const listingInclude = serverInclude;

/** @deprecated Use syncServerTags */
export const syncListingTags = syncServerTags;
