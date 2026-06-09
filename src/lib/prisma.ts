import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: pg.Pool | undefined;
};

/** Bump when schema delegates change to bust stale dev singletons after `prisma generate`. */
const PRISMA_CLIENT_REVISION = "product-v2";

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool =
    globalForPrisma.pool ??
    new pg.Pool({
      connectionString,
      // Neon requires SSL; sslmode=require in the URL is usually enough
      ssl: connectionString.includes("neon.tech")
        ? { rejectUnauthorized: false }
        : undefined,
    });
  const adapter = new PrismaPg(pool);

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool;
  }

  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  Object.defineProperty(client, "__revision", {
    value: PRISMA_CLIENT_REVISION,
    enumerable: false,
  });

  return client;
}

function getPrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma as (PrismaClient & { __revision?: string }) | undefined;
  const stale =
    !cached ||
    cached.__revision !== PRISMA_CLIENT_REVISION ||
    typeof cached.video === "undefined";

  if (stale) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma!;
}

export const prisma = getPrismaClient();
