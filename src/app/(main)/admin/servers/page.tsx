import Link from "next/link";
import { requireModerator } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Metin2Frame } from "@/components/metin2/metin2-frame";
import { Metin2Badge } from "@/components/metin2/metin2-badge";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
      <h1 className="mb-2 font-display text-2xl font-bold text-metin2-gold">Servers</h1>
      <p className="mb-6 text-sm text-[#6b5a40]">
        Click a server to review the full submission details.
      </p>
      <div className="space-y-3">
        {servers.map((server) => {
          const owner = server.members[0]?.user;
          const isPending = server.status === "PENDING";

          return (
            <Link
              key={server.id}
              href={`/admin/servers/${server.id}`}
              className="group block"
            >
              <Metin2Frame
                title={server.name}
                className={cn(
                  "transition-all group-hover:ring-2 group-hover:ring-metin2-gold/40",
                  isPending && "ring-1 ring-amber-600/30"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="mb-2 text-sm text-[#6b5a40]">
                      @{owner?.username ?? "unknown"} · {server._count.videos} videos
                      {server.verified && " · Verified"}
                    </p>
                    <Metin2Badge>{server.status}</Metin2Badge>
                  </div>
                  <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-[#6b5a40] transition-transform group-hover:translate-x-0.5 group-hover:text-metin2-gold" />
                </div>
                <p className="mt-3 text-xs text-[#6b5a40] group-hover:text-metin2-gold">
                  View full submission →
                </p>
              </Metin2Frame>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
