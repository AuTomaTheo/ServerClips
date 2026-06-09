import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const [users, videos] = await Promise.all([
    prisma.user.count(),
    prisma.video.count({ where: { status: "APPROVED", visibility: "PUBLIC" } }),
  ]);
  console.log(`Neon OK — users: ${users}, approved public videos: ${videos}`);
}

main()
  .catch((e) => {
    console.error("Neon connection failed:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
