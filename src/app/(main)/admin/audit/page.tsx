import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Metin2Frame } from "@/components/metin2/metin2-frame";
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
      <h1 className="mb-6 font-display text-2xl font-bold text-metin2-gold">Audit Logs</h1>
      <div className="space-y-2">
        {logs.map((log) => (
          <Metin2Frame key={log.id} variant="wood">
            <div className="flex flex-wrap items-start justify-between gap-2 text-sm">
              <div>
                <p className="font-medium text-metin2-gold">{log.action}</p>
                <p className="text-metin2-parchment/60">
                  {log.targetType}/{log.targetId} by {log.admin.username ?? log.admin.email}
                </p>
                {log.reason && <p className="text-metin2-parchment/50">{log.reason}</p>}
              </div>
              <span className="text-xs text-metin2-parchment/50">
                {format(log.createdAt, "MMM d, yyyy HH:mm")}
              </span>
            </div>
          </Metin2Frame>
        ))}
      </div>
    </div>
  );
}
