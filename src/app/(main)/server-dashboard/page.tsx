import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { getUserServers } from "@/lib/servers";
import { Metin2Frame } from "@/components/metin2/metin2-frame";
import { Metin2Button } from "@/components/metin2/metin2-button";
import { Metin2Badge } from "@/components/metin2/metin2-badge";

export const metadata = { title: "Server Dashboard" };

export default async function ServerDashboardPage() {
  const user = await requireAuth();
  const memberships = await getUserServers(user.id);

  if (memberships.length === 0) {
    redirect("/studio");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-metin2-gold">Server Dashboard</h1>
        <p className="text-metin2-parchment/70">Manage servers you belong to</p>
      </div>

      <div className="space-y-4">
        {memberships.map(({ server, role }) => (
          <Metin2Frame key={server.id} title={server.name}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Metin2Badge>{server.status}</Metin2Badge>
                <p className="mt-2 text-sm text-[#4a3020]">
                  Role: {role} · {server._count.videos} videos · {server._count.follows} followers
                </p>
              </div>
              <div className="flex gap-2">
                {server.status === "APPROVED" && (
                  <Metin2Button href={`/server/${server.slug}`} variant="ghost" className="text-sm">
                    View profile
                  </Metin2Button>
                )}
                <Metin2Button href={`/studio/servers/${server.id}/edit`} variant="gold" className="text-sm">
                  Edit
                </Metin2Button>
              </div>
            </div>
          </Metin2Frame>
        ))}
      </div>
    </div>
  );
}
