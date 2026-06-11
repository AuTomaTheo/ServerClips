import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { normalizeMediaUrl } from "../src/lib/media-url";

async function main() {
  const servers = await prisma.server.findMany({
    select: { id: true, name: true, logoUrl: true, bannerUrl: true },
  });

  let updated = 0;
  for (const server of servers) {
    const logoUrl = server.logoUrl ? normalizeMediaUrl(server.logoUrl) : null;
    const bannerUrl = server.bannerUrl ? normalizeMediaUrl(server.bannerUrl) : null;

    if (logoUrl !== server.logoUrl || bannerUrl !== server.bannerUrl) {
      await prisma.server.update({
        where: { id: server.id },
        data: {
          logoUrl: logoUrl || null,
          bannerUrl: bannerUrl || null,
        },
      });
      console.log(`Fixed: ${server.name}`);
      updated++;
    }
  }

  console.log(`Done. Updated ${updated} server(s).`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
