import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireModerator } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { ServerReviewDetail } from "@/components/admin/server-review-detail";
import { ServerStatusActions } from "@/components/admin/admin-actions";
import { AdminSection } from "@/components/admin/admin-ui";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Admin — Review Server" };

export default async function AdminServerReviewPage({
  params,
}: {
  params: { id: string };
}) {
  await requireModerator();

  const server = await prisma.server.findUnique({
    where: { id: params.id },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
      _count: { select: { videos: true } },
    },
  });

  if (!server) notFound();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/servers"
            className="mb-2 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to servers
          </Link>
          <h1 className="text-2xl font-bold text-white">{server.name}</h1>
          <p className="text-sm text-zinc-400">Review server submission</p>
        </div>
        {server.status === "APPROVED" && (
          <Link
            href={`/server/${server.slug}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            View public profile
          </Link>
        )}
      </div>

      <AdminSection title="Moderation actions" className="mb-6">
        <ServerStatusActions
          serverId={server.id}
          featured={server.featured}
          verified={server.verified}
        />
      </AdminSection>

      <ServerReviewDetail server={server} />
    </div>
  );
}
