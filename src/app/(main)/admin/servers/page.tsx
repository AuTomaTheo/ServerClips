import { requireModerator } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Metin2Frame } from "@/components/metin2/metin2-frame";
import { ServerStatusActions } from "@/components/admin/admin-actions";
import { Metin2Badge } from "@/components/metin2/metin2-badge";

export const metadata = { title: "Admin — Servers" };

export default async function AdminServersPage() {
  await requireModerator();
  const servers = await prisma.server.findMany({
    include: {
      members: {
        where: { role: "OWNER" },
        include: { user: { select: { username: true } } },
        take: 1,
      },
      _count: { select: { videos: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-metin2-gold">Servers</h1>
      <div className="space-y-3">
        {servers.map((server) => {
          const owner = server.members[0]?.user;
          return (
            <Metin2Frame key={server.id} title={server.name}>
              <p className="mb-2 text-sm text-[#6b5a40]">
                @{owner?.username ?? "unknown"} · {server._count.videos} videos
                {server.verified && " · Verified"}
              </p>
              <Metin2Badge className="mb-3">{server.status}</Metin2Badge>
              <ServerStatusActions serverId={server.id} featured={server.featured} verified={server.verified} />
            </Metin2Frame>
          );
        })}
      </div>
    </div>
  );
}
