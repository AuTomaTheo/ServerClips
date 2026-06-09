import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma CLI (migrate, db push, seed) uses DIRECT_URL — unpooled Neon endpoint.
// Runtime app queries use DATABASE_URL — pooled endpoint (see src/lib/prisma.ts).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
