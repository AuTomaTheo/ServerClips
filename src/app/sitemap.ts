import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [servers, users] = await Promise.all([
    prisma.server.findMany({
      where: { status: "APPROVED" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.user.findMany({
      where: { username: { not: null }, status: { in: ["ACTIVE", "WARNED"] } },
      select: { username: true, updatedAt: true },
    }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/explore"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/legal/terms"), changeFrequency: "monthly", priority: 0.3 },
    { url: absoluteUrl("/legal/privacy"), changeFrequency: "monthly", priority: 0.3 },
    { url: absoluteUrl("/legal/copyright"), changeFrequency: "monthly", priority: 0.3 },
    { url: absoluteUrl("/legal/guidelines"), changeFrequency: "monthly", priority: 0.3 },
  ];

  const serverPages: MetadataRoute.Sitemap = servers.map((server) => ({
    url: absoluteUrl(`/server/${server.slug}`),
    lastModified: server.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const profilePages: MetadataRoute.Sitemap = users
    .filter((u): u is { username: string; updatedAt: Date } => !!u.username)
    .map((user) => ({
      url: absoluteUrl(`/u/${user.username}`),
      lastModified: user.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  return [...staticPages, ...serverPages, ...profilePages];
}
