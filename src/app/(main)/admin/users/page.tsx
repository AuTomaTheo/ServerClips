import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  AdminListCard,
  AdminPageTitle,
  AdminStatusBadge,
} from "@/components/admin/admin-ui";
import { UserAdminActions } from "@/components/admin/user-admin-actions";
import { ImpersonateButton } from "@/components/admin/impersonate-button";

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
      <AdminPageTitle title="Users" />
      <form className="mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search username, email..."
          className="app-input w-full max-w-md px-3 py-2"
        />
      </form>
      <div className="space-y-3">
        {users.map((user) => (
          <AdminListCard key={user.id}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-medium text-white">
                  {user.username ? (
                    <Link href={`/u/${user.username}`} className="hover:text-red-400">
                      @{user.username}
                    </Link>
                  ) : (
                    user.displayName
                  )}
                </p>
                <p className="text-xs text-zinc-500">{user.email}</p>
                <div className="mt-2 flex gap-2">
                  <AdminStatusBadge status={user.role} />
                  <AdminStatusBadge status={user.status} />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <UserAdminActions userId={user.id} role={user.role} status={user.status} />
                {user.role !== "ADMIN" && (
                  <ImpersonateButton userId={user.id} username={user.username} />
                )}
              </div>
            </div>
          </AdminListCard>
        ))}
      </div>
    </div>
  );
}
