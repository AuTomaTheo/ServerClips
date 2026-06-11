import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { getUserServers } from "@/lib/servers";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Server Dashboard" };

function StatusBadge({ status }: { status: string }) {
  const colors =
    status === "APPROVED"
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
      : status === "PENDING"
        ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
        : "bg-red-500/15 text-red-400 border-red-500/30";
  return (
    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase", colors)}>
      {status}
    </span>
  );
}

export default async function ServerDashboardPage() {
  const user = await requireAuth();
  const memberships = await getUserServers(user.id);

  if (memberships.length === 0) {
    redirect("/studio");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Server Dashboard</h1>
        <p className="text-zinc-500">Manage servers you belong to</p>
      </div>

      <div className="space-y-4">
        {memberships.map(({ server, role }) => (
          <div key={server.id} className="app-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-white">{server.name}</p>
                <div className="mt-2 flex items-center gap-2">
                  <StatusBadge status={server.status} />
                  <p className="text-sm text-zinc-500">
                    Role: {role} · {server._count.videos} videos · {server._count.follows} followers
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {server.status === "APPROVED" && (
                  <Link
                    href={`/server/${server.slug}`}
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                  >
                    View profile
                  </Link>
                )}
                <Link
                  href={`/studio/servers/${server.id}/edit`}
                  className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
                >
                  Edit
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
