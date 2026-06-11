import Link from "next/link";
import { requireModerator } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { AdminListCard, AdminPageTitle } from "@/components/admin/admin-ui";
import { DeleteCommentButton } from "@/components/admin/admin-actions";

export const metadata = { title: "Admin — Comments" };

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: { q?: string; reported?: string };
}) {
  await requireModerator();
  const q = searchParams.q?.trim();

  let reportedIds: string[] | undefined;
  if (searchParams.reported === "true") {
    const reported = await prisma.report.findMany({
      where: { targetType: "COMMENT", status: { in: ["OPEN", "REVIEWING"] } },
      select: { targetId: true },
    });
    reportedIds = reported.map((r) => r.targetId);
    if (reportedIds.length === 0) {
      return (
        <div>
          <AdminPageTitle title="Comments" />
          <p className="text-zinc-400">No reported comments.</p>
        </div>
      );
    }
  }

  const comments = await prisma.comment.findMany({
    where: {
      status: { not: "DELETED" },
      ...(q ? { body: { contains: q, mode: "insensitive" } } : {}),
      ...(reportedIds ? { id: { in: reportedIds } } : {}),
    },
    include: {
      user: { select: { username: true, displayName: true } },
      video: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const reportCounts =
    comments.length > 0
      ? await prisma.report.groupBy({
          by: ["targetId"],
          where: {
            targetType: "COMMENT",
            targetId: { in: comments.map((c) => c.id) },
            status: { in: ["OPEN", "REVIEWING"] },
          },
          _count: true,
        })
      : [];

  const reportCountMap = new Map(reportCounts.map((r) => [r.targetId, r._count]));

  return (
    <div>
      <AdminPageTitle title="Comments" />
      <form className="mb-6 flex flex-wrap items-center gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search comments..."
          className="app-input max-w-md flex-1 px-3 py-2"
        />
        <label className="flex items-center gap-2 text-sm text-zinc-400">
          <input
            type="checkbox"
            name="reported"
            value="true"
            defaultChecked={searchParams.reported === "true"}
            className="rounded border-zinc-600"
          />
          Reported only
        </label>
      </form>
      <div className="space-y-3">
        {comments.map((comment) => {
          const reports = reportCountMap.get(comment.id) ?? 0;
          return (
            <AdminListCard key={comment.id}>
              <p className="text-sm text-zinc-200">{comment.body}</p>
              <p className="mt-2 text-xs text-zinc-500">
                by @{comment.user.username ?? comment.user.displayName} on{" "}
                <Link
                  href={`/watch/${comment.video.id}?from=admin`}
                  className="text-red-400 hover:underline"
                >
                  {comment.video.title}
                </Link>
                {reports > 0 && (
                  <span className="ml-2 text-red-400">{reports} reports</span>
                )}
              </p>
              <div className="mt-3">
                <DeleteCommentButton commentId={comment.id} />
              </div>
            </AdminListCard>
          );
        })}
      </div>
    </div>
  );
}
