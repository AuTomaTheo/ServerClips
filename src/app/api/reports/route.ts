import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reportSchema } from "@/lib/validators/video";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";

export async function POST(req: Request) {
  const session = await auth();
  const reporterId = session?.user?.id;

  if (reporterId) {
    const limit = rateLimit(`report:${reporterId}`, 5, 60_000);
    if (!limit.success) {
      return NextResponse.json({ error: "Too many reports" }, { status: 429 });
    }
  }

  const body = await req.json();
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { reason, details, targetType, targetId } = parsed.data;

  const report = await prisma.report.create({
    data: {
      reporterId: reporterId ?? null,
      targetType,
      targetId,
      reason,
      details: details ? sanitizeText(details) : null,
    },
  });

  return NextResponse.json({ id: report.id });
}
