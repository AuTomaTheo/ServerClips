import { ChevronRight } from "lucide-react";
import { requireModerator } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  AdminListCard,
  AdminPageTitle,
  AdminStatusBadge,
} from "@/components/admin/admin-ui";

export const metadata = { title: "Admin — Servers" };

export default async function AdminServersPage() {
  await requireModerator();
  const servers = await prisma.server.findMany({
    include: {
      members: {
        include: { user: { select: { username: true } } },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
      _count: { select: { videos: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <AdminPageTitle
        title="Servers"
        description="Click a server to review the full submission details."
      />
      <div className="space-y-3">
        {servers.map((server) => {
          const owner = server.members[0]?.user;

          return (
            <AdminListCard key={server.id} href={`/admin/servers/${server.id}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{server.name}</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    @{owner?.username ?? "unknown"} · {server._count.videos} videos
                    {server.verified && " · Verified"}
                  </p>
                  <div className="mt-2">
                    <AdminStatusBadge status={server.status} />
                  </div>
                </div>
                <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-zinc-500" />
              </div>
            </AdminListCard>
          );
        })}
      </div>
    </div>
  );
}
