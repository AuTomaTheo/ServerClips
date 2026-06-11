import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadFile } from "@/lib/upload";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const kind = formData.get("kind") as "image" | "video" | null;

  const canUpload =
    ["USER", "CREATOR", "MODERATOR", "ADMIN"].includes(session.user.role);

  if (!canUpload) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const limit = rateLimit(`upload:${session.user.id}`, 10, 60_000);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many uploads" }, { status: 429 });
  }

  const file = formData.get("file") as File | null;

  if (!file || !kind || !["image", "video"].includes(kind)) {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  const blocked = [".exe", ".zip", ".rar", ".7z", ".msi", ".bat", ".cmd", ".dll"];
  if (blocked.some((ext) => file.name.toLowerCase().endsWith(ext))) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }

  try {
    const result = await uploadFile(file, kind);
    return NextResponse.json({ url: result.url, key: result.key });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 400 }
    );
  }
}
