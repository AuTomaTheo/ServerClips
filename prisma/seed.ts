import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SAMPLE_VIDEOS = [
  "/videos/sample1.mp4",
  "/videos/sample2.mp4",
  "/videos/sample3.mp4",
  "/videos/sample4.mp4",
];

async function upsertUser(data: {
  email: string;
  username: string;
  displayName: string;
  role: "USER" | "CREATOR" | "MODERATOR" | "ADMIN";
  bio?: string;
  avatarUrl?: string;
  passwordHash: string;
  likedVideosPublic?: boolean;
  savedVideosPublic?: boolean;
}) {
  return prisma.user.upsert({
    where: { email: data.email },
    update: {
      username: data.username,
      displayName: data.displayName,
      role: data.role,
      bio: data.bio,
      avatarUrl: data.avatarUrl,
      likedVideosPublic: data.likedVideosPublic,
      savedVideosPublic: data.savedVideosPublic,
    },
    create: {
      email: data.email,
      username: data.username,
      displayName: data.displayName,
      name: data.displayName,
      role: data.role,
      bio: data.bio,
      avatarUrl: data.avatarUrl,
      passwordHash: data.passwordHash,
      status: "ACTIVE",
      likedVideosPublic: data.likedVideosPublic ?? false,
      savedVideosPublic: data.savedVideosPublic ?? false,
    },
  });
}

async function upsertServerMember(
  serverId: string,
  userId: string,
  role: "OWNER" | "ADMIN" | "PROMOTER" | "ANALYST"
) {
  return prisma.serverMember.upsert({
    where: { serverId_userId: { serverId, userId } },
    create: { serverId, userId, role },
    update: { role },
  });
}

async function upsertVideoMetric(
  videoId: string,
  data: {
    views: number;
    uniqueViews: number;
    likes: number;
    comments: number;
    saves: number;
    shares?: number;
    serverClicks?: number;
    profileClicks?: number;
    averageWatchSeconds?: number;
    completionRate?: number;
  }
) {
  return prisma.videoMetric.upsert({
    where: { videoId },
    create: { videoId, ...data },
    update: data,
  });
}

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  const admin = await upsertUser({
    email: "admin@serverclips.dev",
    username: "admin",
    displayName: "Platform Admin",
    role: "ADMIN",
    passwordHash,
  });

  const moderator = await upsertUser({
    email: "moderator@serverclips.dev",
    username: "modteam",
    displayName: "Mod Team",
    role: "MODERATOR",
    passwordHash,
  });

  const [creator1, creator2, creator3] = await Promise.all([
    upsertUser({
      email: "creator@serverclips.dev",
      username: "metin2promo",
      displayName: "Metin2 Promoter",
      role: "CREATOR",
      bio: "Official promo videos for top Metin2 private servers.",
      passwordHash,
      likedVideosPublic: true,
    }),
    upsertUser({
      email: "dragonclips@serverclips.dev",
      username: "dragonclips",
      displayName: "Dragon Clips",
      role: "CREATOR",
      bio: "PvP highlights and guild war montages.",
      passwordHash,
    }),
    upsertUser({
      email: "pvmmaster@serverclips.dev",
      username: "pvmmaster",
      displayName: "PvM Master",
      role: "CREATOR",
      bio: "Dungeon guides and boss kill showcases.",
      passwordHash,
    }),
  ]);

  const [user1, user2, user3, user4, user5] = await Promise.all([
    upsertUser({
      email: "user@serverclips.dev",
      username: "playerone",
      displayName: "Player One",
      role: "USER",
      bio: "PvP enthusiast. Always looking for new servers.",
      passwordHash,
      likedVideosPublic: true,
      savedVideosPublic: true,
    }),
    upsertUser({
      email: "playertwo@serverclips.dev",
      username: "playertwo",
      displayName: "Player Two",
      role: "USER",
      bio: "Casual explorer of Metin2 servers.",
      passwordHash,
    }),
    upsertUser({
      email: "playerthree@serverclips.dev",
      username: "playerthree",
      displayName: "Player Three",
      role: "USER",
      passwordHash,
    }),
    upsertUser({
      email: "playerfour@serverclips.dev",
      username: "playerfour",
      displayName: "Player Four",
      role: "USER",
      passwordHash,
    }),
    upsertUser({
      email: "playerfive@serverclips.dev",
      username: "playerfive",
      displayName: "Player Five",
      role: "USER",
      passwordHash,
    }),
  ]);

  const serversData = [
    {
      name: "Eternal Kingdoms",
      slug: "eternal-kingdoms",
      description:
        "A classic Metin2-inspired experience with balanced PvM progression, active community events, and weekly boss raids.",
      region: "Europe",
      language: "English",
      serverType: "OLDSCHOOL" as const,
      expRate: "x50",
      yangRate: "x25",
      dropRate: "x30",
      websiteUrl: "https://example.com/eternal",
      discordUrl: "https://discord.gg/eternal",
      status: "APPROVED" as const,
      featured: true,
      verified: true,
      verificationStatus: "VERIFIED" as const,
      launchDate: new Date("2025-03-15"),
      tags: ["oldschool", "international", "events"],
      ownerId: creator1.id,
      members: [
        { userId: creator1.id, role: "OWNER" as const },
        { userId: creator2.id, role: "ADMIN" as const },
        { userId: creator3.id, role: "PROMOTER" as const },
        { userId: user1.id, role: "ANALYST" as const },
      ],
    },
    {
      name: "Dragon Valley PvP",
      slug: "dragon-valley-pvp",
      description:
        "Hardcore PvP focused server with fast-paced combat, guild wars every weekend, and competitive rankings.",
      region: "North America",
      language: "English",
      serverType: "PVP" as const,
      expRate: "x100",
      yangRate: "x50",
      dropRate: "x50",
      websiteUrl: "https://example.com/dragon",
      discordUrl: "https://discord.gg/dragon",
      status: "APPROVED" as const,
      featured: true,
      verified: true,
      verificationStatus: "VERIFIED" as const,
      launchDate: new Date("2026-06-15"),
      tags: ["pvp", "hardcore", "gw"],
      ownerId: creator2.id,
      members: [
        { userId: creator2.id, role: "OWNER" as const },
        { userId: creator1.id, role: "ADMIN" as const },
        { userId: user2.id, role: "PROMOTER" as const },
        { userId: user3.id, role: "ANALYST" as const },
      ],
    },
    {
      name: "Mystic Realm",
      slug: "mystic-realm",
      description:
        "Middleschool rates with a focus on PvM dungeons, crafting economy, and seasonal content.",
      region: "Europe",
      language: "German",
      serverType: "MIDDLESCHOOL" as const,
      expRate: "x20",
      yangRate: "x15",
      dropRate: "x20",
      websiteUrl: "https://example.com/mystic",
      status: "APPROVED" as const,
      featured: false,
      verified: false,
      verificationStatus: "PENDING" as const,
      launchDate: new Date("2025-01-20"),
      tags: ["pvm", "crafting", "german"],
      ownerId: creator3.id,
      members: [
        { userId: creator3.id, role: "OWNER" as const },
        { userId: user1.id, role: "PROMOTER" as const },
        { userId: user4.id, role: "ANALYST" as const },
      ],
    },
    {
      name: "Nova School",
      slug: "nova-school",
      description: "Newschool server with modern systems, battle pass, and cosmetic shop.",
      region: "Global",
      language: "English",
      serverType: "NEWSCHOOL" as const,
      expRate: "x500",
      yangRate: "x200",
      dropRate: "x300",
      status: "PENDING" as const,
      featured: false,
      verified: false,
      verificationStatus: "NONE" as const,
      tags: ["newschool", "casual"],
      ownerId: creator1.id,
      members: [
        { userId: creator1.id, role: "OWNER" as const },
        { userId: user5.id, role: "PROMOTER" as const },
      ],
    },
    {
      name: "Iron Forge",
      slug: "iron-forge",
      description: "Mixed PvP/PvM server with crafting focus and seasonal tournaments.",
      region: "Europe",
      language: "Polish",
      serverType: "MIXED" as const,
      expRate: "x75",
      yangRate: "x40",
      dropRate: "x35",
      websiteUrl: "https://example.com/iron",
      status: "APPROVED" as const,
      featured: false,
      verified: false,
      verificationStatus: "REJECTED" as const,
      launchDate: new Date("2024-11-01"),
      tags: ["mixed", "crafting", "polish"],
      ownerId: creator2.id,
      members: [
        { userId: creator2.id, role: "OWNER" as const },
        { userId: creator3.id, role: "ADMIN" as const },
        { userId: user2.id, role: "ANALYST" as const },
      ],
    },
  ];

  const videoTemplates = [
    { suffix: "trailer", title: "Official Trailer" },
    { suffix: "highlights", title: "Highlights Reel" },
    { suffix: "gameplay", title: "Gameplay Preview" },
  ];

  const createdVideos: { id: string; creatorId: string; serverId: string }[] = [];

  for (const data of serversData) {
    const { tags, ownerId, members, ...serverFields } = data;

    const server = await prisma.server.upsert({
      where: { slug: data.slug },
      update: serverFields,
      create: serverFields,
    });

    for (const member of members) {
      await upsertServerMember(server.id, member.userId, member.role);
    }

    for (const tagName of tags) {
      const slug = tagName.toLowerCase();
      const tag = await prisma.tag.upsert({
        where: { slug },
        create: { name: tagName, slug },
        update: { name: tagName },
      });
      await prisma.serverTag.upsert({
        where: { serverId_tagId: { serverId: server.id, tagId: tag.id } },
        create: { serverId: server.id, tagId: tag.id },
        update: {},
      });
    }

    const creatorForServer =
      data.slug === "dragon-valley-pvp" || data.slug === "iron-forge"
        ? creator2
        : data.slug === "mystic-realm"
          ? creator3
          : creator1;

    for (let i = 0; i < videoTemplates.length; i++) {
      const tmpl = videoTemplates[i];
      const videoId = `seed-video-${data.slug}-${tmpl.suffix}`;
      const video = await prisma.video.upsert({
        where: { id: videoId },
        update: {
          title: `${data.name} — ${tmpl.title}`,
          videoUrl: SAMPLE_VIDEOS[i % SAMPLE_VIDEOS.length],
          status: server.status === "APPROVED" ? "APPROVED" : "PENDING",
          visibility: "PUBLIC",
        },
        create: {
          id: videoId,
          creatorId: creatorForServer.id,
          serverId: server.id,
          title: `${data.name} — ${tmpl.title}`,
          description: data.description.slice(0, 200),
          videoUrl: SAMPLE_VIDEOS[i % SAMPLE_VIDEOS.length],
          status: server.status === "APPROVED" ? "APPROVED" : "PENDING",
          visibility: "PUBLIC",
        },
      });

      const baseViews =
        data.slug === "eternal-kingdoms" ? 1200 : data.slug === "dragon-valley-pvp" ? 890 : 400;
      const views = baseViews + i * 150;
      const likes = Math.floor(views * 0.08);
      const comments = Math.floor(views * 0.02);
      const saves = Math.floor(views * 0.03);

      await upsertVideoMetric(video.id, {
        views,
        uniqueViews: Math.floor(views * 0.7),
        likes,
        comments,
        saves,
        shares: Math.floor(views * 0.01),
        serverClicks: Math.floor(views * 0.05),
        profileClicks: Math.floor(views * 0.02),
        averageWatchSeconds: 45 + i * 10,
        completionRate: 0.55 + i * 0.1,
      });

      createdVideos.push({ id: video.id, creatorId: video.creatorId, serverId: server.id });
    }
  }

  const allUsers = [user1, user2, user3, user4, user5];
  const allCreators = [creator1, creator2, creator3];

  for (const user of allUsers) {
    for (const creator of allCreators) {
      if (user.id !== creator.id) {
        await prisma.follow.upsert({
          where: { followerId_followingId: { followerId: user.id, followingId: creator.id } },
          create: { followerId: user.id, followingId: creator.id },
          update: {},
        });
      }
    }
  }

  const approvedServers = await prisma.server.findMany({
    where: { status: "APPROVED" },
    select: { id: true },
  });
  for (const user of [user1, user2, user3]) {
    for (const server of approvedServers.slice(0, 3)) {
      await prisma.serverFollow.upsert({
        where: { userId_serverId: { userId: user.id, serverId: server.id } },
        create: { userId: user.id, serverId: server.id },
        update: {},
      });
    }
  }

  const eternalVideo = createdVideos.find((v) => v.id.includes("eternal-kingdoms-trailer"));
  const dragonVideo = createdVideos.find((v) => v.id.includes("dragon-valley-pvp-trailer"));

  if (eternalVideo) {
    for (const user of [user1, user2, user3]) {
      await prisma.like.upsert({
        where: { userId_videoId: { userId: user.id, videoId: eternalVideo.id } },
        create: { userId: user.id, videoId: eternalVideo.id },
        update: {},
      });
    }

    await prisma.save.upsert({
      where: { userId_videoId: { userId: user1.id, videoId: eternalVideo.id } },
      create: { userId: user1.id, videoId: eternalVideo.id },
      update: {},
    });

    await prisma.comment.upsert({
      where: { id: "seed-comment-1" },
      create: {
        id: "seed-comment-1",
        userId: user1.id,
        videoId: eternalVideo.id,
        body: "Great server, very active community! The events are well organized.",
        status: "VISIBLE",
      },
      update: {},
    });

    await prisma.comment.upsert({
      where: { id: "seed-comment-2" },
      create: {
        id: "seed-comment-2",
        userId: user2.id,
        videoId: eternalVideo.id,
        body: "Joined last week, loving the oldschool feel.",
        status: "VISIBLE",
      },
      update: {},
    });
  }

  if (dragonVideo) {
    await prisma.comment.upsert({
      where: { id: "seed-comment-3" },
      create: {
        id: "seed-comment-3",
        userId: user3.id,
        videoId: dragonVideo.id,
        body: "Guild wars are insane on this server!",
        status: "VISIBLE",
      },
      update: {},
    });
  }

  for (let idx = 0; idx < Math.min(8, createdVideos.length); idx++) {
    const video = createdVideos[idx];
    await prisma.videoViewEvent.create({
      data: {
        videoId: video.id,
        userId: idx % 2 === 0 ? user1.id : null,
        sessionId: `seed-session-${idx}`,
        watchSeconds: 30 + idx * 5,
        completed: idx % 3 === 0,
        source: idx % 2 === 0 ? "FEED" : "SEARCH",
      },
    });
  }

  for (let idx = 0; idx < Math.min(5, createdVideos.length); idx++) {
    const video = createdVideos[idx];
    await prisma.serverClickEvent.create({
      data: {
        videoId: video.id,
        serverId: video.serverId,
        userId: idx % 2 === 0 ? user1.id : null,
        sessionId: `seed-click-${idx}`,
        referrerSource: "FEED",
        clickType: idx % 2 === 0 ? "website" : "discord",
      },
    });
  }

  await prisma.report.upsert({
    where: { id: "seed-report-video" },
    create: {
      id: "seed-report-video",
      reporterId: user1.id,
      targetType: "VIDEO",
      targetId: dragonVideo?.id ?? createdVideos[3]?.id ?? "unknown",
      reason: "MISLEADING",
      details: "Rates advertised don't match in-game experience.",
      status: "OPEN",
    },
    update: {},
  });

  await prisma.report.upsert({
    where: { id: "seed-report-server" },
    create: {
      id: "seed-report-server",
      reporterId: user2.id,
      targetType: "SERVER",
      targetId: approvedServers[1]?.id ?? "unknown",
      reason: "SCAM",
      details: "Suspicious donation practices reported by community.",
      status: "OPEN",
    },
    update: {},
  });

  await prisma.report.upsert({
    where: { id: "seed-report-comment" },
    create: {
      id: "seed-report-comment",
      reporterId: user4.id,
      targetType: "COMMENT",
      targetId: "seed-comment-3",
      reason: "SPAM",
      details: "Looks like astroturfing.",
      status: "REVIEWING",
    },
    update: {},
  });

  await prisma.adminAuditLog.create({
    data: {
      adminId: admin.id,
      action: "VIDEO_APPROVE",
      targetType: "video",
      targetId: eternalVideo?.id ?? "unknown",
      reason: "Seed audit log entry",
      metadata: { source: "seed" },
    },
  });

  console.log("Seed completed:");
  console.log("  Admin:      admin@serverclips.dev / password123 (@admin)");
  console.log("  Moderator:  moderator@serverclips.dev / password123 (@modteam)");
  console.log("  Creators:   creator@serverclips.dev, dragonclips@serverclips.dev, pvmmaster@serverclips.dev");
  console.log("  Users:      user@serverclips.dev, playertwo@, playerthree@, playerfour@, playerfive@");
  console.log("  Password:   password123 (all accounts)");
  console.log(`  Servers:    ${serversData.length} | Videos: ${createdVideos.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
