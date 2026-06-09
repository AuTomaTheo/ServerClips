import { requireModerator } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Metin2Frame } from "@/components/metin2/metin2-frame";
import { DeleteCommentButton } from "@/components/admin/admin-actions";
import Link from "next/link";

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
          <h1 className="mb-4 font-display text-2xl font-bold text-metin2-gold">Comments</h1>
          <p className="text-metin2-parchment/60">No reported comments.</p>
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
      <h1 className="mb-4 font-display text-2xl font-bold text-metin2-gold">Comments</h1>
      <form className="mb-6 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search comments..."
          className="metin2-input max-w-md flex-1 px-3 py-2"
        />
        <label className="flex items-center gap-2 text-sm text-metin2-parchment/70">
          <input type="checkbox" name="reported" value="true" defaultChecked={searchParams.reported === "true"} />
          Reported only
        </label>
      </form>
      <div className="space-y-3">
        {comments.map((comment) => {
          const reports = reportCountMap.get(comment.id) ?? 0;
          return (
            <Metin2Frame key={comment.id} variant="wood">
              <p className="text-sm text-[#3d2814]">{comment.body}</p>
              <p className="mt-2 text-xs text-[#6b5a40]">
                by @{comment.user.username ?? comment.user.displayName} on{" "}
                <Link href={`/?v=${comment.video.id}`} className="text-metin2-red hover:underline">
                  {comment.video.title}
                </Link>
                {reports > 0 && <span className="ml-2 text-red-700">{reports} reports</span>}
              </p>
              <div className="mt-3">
                <DeleteCommentButton commentId={comment.id} />
              </div>
            </Metin2Frame>
          );
        })}
      </div>
    </div>
  );
}
