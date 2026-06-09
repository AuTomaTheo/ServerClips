import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Metin2Frame } from "@/components/metin2/metin2-frame";
import { Metin2Badge } from "@/components/metin2/metin2-badge";
import { UserAdminActions } from "@/components/admin/user-admin-actions";
import { ImpersonateButton } from "@/components/admin/impersonate-button";
import Link from "next/link";

export const metadata = { title: "Admin — Users" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  await requireAdmin();
  const q = searchParams.q?.trim();

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { username: { contains: q, mode: "insensitive" } },
            { displayName: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      role: true,
      status: true,
      _count: { select: { videos: true, followers: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <h1 className="mb-4 font-display text-2xl font-bold text-metin2-gold">Users</h1>
      <form className="mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search username, email..."
          className="metin2-input w-full max-w-md px-3 py-2"
        />
      </form>
      <div className="space-y-3">
        {users.map((user) => (
          <Metin2Frame key={user.id} variant="wood">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-medium text-metin2-gold">
                  {user.username ? (
                    <Link href={`/u/${user.username}`} className="hover:underline">@{user.username}</Link>
                  ) : (
                    user.displayName
                  )}
                </p>
                <p className="text-xs text-metin2-parchment/60">{user.email}</p>
                <div className="mt-2 flex gap-2">
                  <Metin2Badge>{user.role}</Metin2Badge>
                  <Metin2Badge variant={user.status === "ACTIVE" ? "gold" : "red"}>{user.status}</Metin2Badge>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <UserAdminActions userId={user.id} role={user.role} status={user.status} />
                {user.role !== "ADMIN" && (
                  <ImpersonateButton userId={user.id} username={user.username} />
                )}
              </div>
            </div>
          </Metin2Frame>
        ))}
      </div>
    </div>
  );
}
