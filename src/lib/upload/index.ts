import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_IMAGE_SIZE_MB,
  MAX_VIDEO_SIZE_MB,
} from "@/lib/constants";
import { isObjectStorageConfigured } from "@/lib/upload/config";
import { isS3Configured, uploadToS3 } from "@/lib/upload/s3";

export type UploadKind = "image" | "video";

export interface UploadResult {
  url: string;
  key: string;
}

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

export function validateUpload(
  file: File,
  kind: UploadKind
): { ok: true } | { ok: false; error: string } {
  const allowed =
    kind === "video" ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES;
  const maxMb = kind === "video" ? MAX_VIDEO_SIZE_MB : MAX_IMAGE_SIZE_MB;

  if (!allowed.includes(file.type)) {
    return {
      ok: false,
      error: `Invalid file type. Allowed: ${allowed.join(", ")}`,
    };
  }

  if (file.size > maxMb * 1024 * 1024) {
    return { ok: false, error: `File too large. Max ${maxMb}MB.` };
  }

  return { ok: true };
}

/** Production: UploadThing (client) or S3. Development: local disk when unset. */
export function getUploadBackend(): "s3" | "local" {
  if (process.env.NODE_ENV === "production" && !isObjectStorageConfigured()) {
    throw new Error(
      "Object storage must be configured in production. Set UPLOADTHING_TOKEN (recommended — https://uploadthing.com/dashboard) or S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY."
    );
  }
  return isS3Configured() ? "s3" : "local";
}

export async function uploadFile(
  file: File,
  kind: UploadKind
): Promise<UploadResult> {
  const validation = validateUpload(file, kind);
  if (!validation.ok) throw new Error(validation.error);

  const ext = getExtension(file.name, file.type);
  const key = `${kind}s/${randomUUID()}${ext}`;

  if (getUploadBackend() === "s3") {
    return uploadToS3(file, kind, key);
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", kind + "s");
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = path.join(uploadDir, path.basename(key));
  await writeFile(filePath, buffer);

  return {
    url: `/uploads/${key}`,
    key,
  };
}
