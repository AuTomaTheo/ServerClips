import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { AdminListCard, AdminPageTitle } from "@/components/admin/admin-ui";
import { format } from "date-fns";

export const metadata = { title: "Admin — Audit Logs" };

export default async function AdminAuditPage() {
  await requireAdmin();
  const logs = await prisma.adminAuditLog.findMany({
    include: { admin: { select: { username: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <AdminPageTitle title="Audit Logs" />
      <div className="space-y-2">
        {logs.map((log) => (
          <AdminListCard key={log.id}>
            <div className="flex flex-wrap items-start justify-between gap-2 text-sm">
              <div>
                <p className="font-medium text-white">{log.action}</p>
                <p className="text-zinc-500">
                  {log.targetType}/{log.targetId} by {log.admin.username ?? log.admin.email}
                </p>
                {log.reason && <p className="text-zinc-600">{log.reason}</p>}
              </div>
              <span className="text-xs text-zinc-600">
                {format(log.createdAt, "MMM d, yyyy HH:mm")}
              </span>
            </div>
          </AdminListCard>
        ))}
      </div>
    </div>
  );
}
