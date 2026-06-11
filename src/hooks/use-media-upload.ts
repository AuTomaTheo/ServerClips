"use client";

import { useCallback, useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { extractUploadThingFile } from "@/lib/upload/extract-uploadthing-file";

export type MediaUploadKind = "image" | "video";

export interface MediaUploadResult {
  url: string;
  key: string;
}

async function uploadViaS3Presign(
  file: File,
  kind: MediaUploadKind
): Promise<MediaUploadResult | null> {
  const res = await fetch("/api/upload/presign", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kind,
      filename: file.name,
      contentType: file.type,
      size: file.size,
    }),
  });

  if (res.status === 404) return null;

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "S3 upload failed");
  }

  const put = await fetch(data.uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  if (!put.ok) {
    throw new Error("Failed to upload file to storage");
  }

  return { url: data.publicUrl, key: data.key };
}

async function uploadViaLocalApi(
  file: File,
  kind: MediaUploadKind
): Promise<MediaUploadResult> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("kind", kind);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "Upload failed");
  }
  return { url: data.url, key: data.key };
}

export function useMediaUpload() {
  const [uploading, setUploading] = useState(false);
  const video = useUploadThing("videoUploader");
  const image = useUploadThing("imageUploader");

  const upload = useCallback(
    async (file: File, kind: MediaUploadKind): Promise<MediaUploadResult> => {
      setUploading(true);
      try {
        const s3Result = await uploadViaS3Presign(file, kind);
        if (s3Result) return s3Result;

        const startUpload =
          kind === "video" ? video.startUpload : image.startUpload;

        try {
          const res = await startUpload([file]);
          const parsed = extractUploadThingFile(
            res?.[0] as Record<string, unknown> | undefined
          );
          if (parsed) return parsed;
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Upload failed";
          if (process.env.NODE_ENV === "production") {
            throw new Error(message);
          }
        }

        if (process.env.NODE_ENV === "production") {
          throw new Error(
            "Upload failed. Configure S3 (S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY) or UPLOADTHING_TOKEN in Vercel, then redeploy."
          );
        }

        return uploadViaLocalApi(file, kind);
      } finally {
        setUploading(false);
      }
    },
    [video.startUpload, image.startUpload]
  );

  return {
    upload,
    uploading: uploading || video.isUploading || image.isUploading,
  };
}
