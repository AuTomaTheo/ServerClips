import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import path from "path";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { isS3Configured } from "@/lib/upload/s3";
import { createPresignedUpload } from "@/lib/upload/s3-presign";
import { validateUpload, type UploadKind } from "@/lib/upload";

function getExtension(filename: string, mimeType: string): string {
  const ext = path.extname(filename).toLowerCase();
  if (ext) return ext;
  const map: Record<string, string> = {
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
  };
  return map[mimeType] ?? "";
}

export async function POST(req: Request) {
  if (!isS3Configured()) {
    return NextResponse.json({ error: "S3 not configured" }, { status: 404 });
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!["USER", "CREATOR", "MODERATOR", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const limit = rateLimit(`upload:${session.user.id}`, 10, 60_000);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many uploads" }, { status: 429 });
  }

  const body = await req.json();
  const kind = body.kind as UploadKind | undefined;
  const filename = body.filename as string | undefined;
  const contentType = body.contentType as string | undefined;

  if (!kind || !filename || !contentType || !["image", "video"].includes(kind)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const pseudoFile = { name: filename, type: contentType, size: body.size ?? 0 } as File;
  const validation = validateUpload(pseudoFile, kind);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const ext = getExtension(filename, contentType);
  const key = `${kind}s/${randomUUID()}${ext}`;

  const presigned = await createPresignedUpload({ key, contentType });
  if (!presigned) {
    return NextResponse.json({ error: "S3 not configured" }, { status: 404 });
  }

  return NextResponse.json(presigned);
}
