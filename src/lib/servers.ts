import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import type { ServerSystemKey } from "@/lib/constants";
import { normalizeMediaUrl } from "@/lib/media-url";
import { buildServerSystemsWhere } from "@/lib/server-systems";
import { ContentStatus, GameplayDifficulty, Prisma, SchoolType } from "@/generated/prisma/client";

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
  schoolType?: string;
  gameplayDifficulty?: string;
  mainLanguage?: string;
  originCountry?: string;
  maxLevel?: number;
  systems?: ServerSystemKey[];
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

  if (filters.mainLanguage) where.mainLanguage = filters.mainLanguage;
  if (filters.originCountry) where.originCountry = filters.originCountry;
  if (filters.schoolType) where.schoolType = filters.schoolType as SchoolType;
  if (filters.gameplayDifficulty) {
    where.gameplayDifficulty = filters.gameplayDifficulty as GameplayDifficulty;
  }
  if (filters.maxLevel) where.maxLevel = { lte: filters.maxLevel };
  if (filters.featured) where.featured = true;
  if (filters.verified) where.verified = true;

  if (filters.systems?.length) {
    where.AND = buildServerSystemsWhere(filters.systems);
  }

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

export function serverDataFromSubmission(data: {
  name: string;
  websiteUrl?: string;
  discordUrl?: string;
  logoUrl?: string;
  bannerUrl?: string;
  launchDate?: string;
  memberRole?: string;
  representsServer: boolean;
  maxLevel?: number | "" | null;
  schoolType: string;
  gameplayDifficulty: string;
  originCountry: string;
  mainLanguage: string;
  supportedLanguages: string[];
  description?: string;
  otherSystems?: string;
  systems?: Partial<Record<ServerSystemKey, boolean>>;
}) {
  const systems = data.systems ?? {};
  return {
    name: data.name,
    websiteUrl: data.websiteUrl || null,
    discordUrl: data.discordUrl || null,
    logoUrl: data.logoUrl ? normalizeMediaUrl(data.logoUrl) || null : null,
    bannerUrl: data.bannerUrl ? normalizeMediaUrl(data.bannerUrl) || null : null,
    launchDate: data.launchDate ? new Date(data.launchDate) : null,
    representsServer: data.representsServer,
    maxLevel: typeof data.maxLevel === "number" ? data.maxLevel : null,
    schoolType: data.schoolType as SchoolType,
    gameplayDifficulty: data.gameplayDifficulty as GameplayDifficulty,
    originCountry: data.originCountry,
    mainLanguage: data.mainLanguage,
    supportedLanguages: data.supportedLanguages,
    description: data.description || null,
    otherSystems: data.otherSystems?.trim() || null,
    systemAlchemy: systems.systemAlchemy === true,
    systemScarf: systems.systemScarf === true,
    systemLycan: systems.systemLycan === true,
    systemBonus67: systems.systemBonus67 === true,
    systemOfflineShop: systems.systemOfflineShop === true,
    systemCostume: systems.systemCostume === true,
    systemPet: systems.systemPet === true,
    systemMount: systems.systemMount === true,
    systemBattlePass: systems.systemBattlePass === true,
    systemDungeonRanking: systems.systemDungeonRanking === true,
    systemElement: systems.systemElement === true,
    systemTalisman: systems.systemTalisman === true,
    verificationStatus: data.representsServer ? ("PENDING" as const) : ("NONE" as const),
  };
}

/** @deprecated Use buildServerWhere */
export const buildListingWhere = buildServerWhere;

/** @deprecated Use serverInclude */
export const listingInclude = serverInclude;

/** @deprecated Use syncServerTags */
export const syncListingTags = syncServerTags;
