"use client";

import { useCallback, useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { extractUploadThingFile } from "@/lib/upload/extract-uploadthing-file";

export type MediaUploadKind = "image" | "video";

export interface MediaUploadResult {
  url: string;
  key: string;
}

const PRODUCTION_UPLOAD_HINT =
  "Upload failed. Add UPLOADTHING_TOKEN in Vercel (https://uploadthing.com/dashboard), enable Production scope, then redeploy.";

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
        const startUpload =
          kind === "video" ? video.startUpload : image.startUpload;

        try {
          const res = await startUpload([file]);
          const parsed = extractUploadThingFile(
            res?.[0] as Record<string, unknown> | undefined
          );
          if (parsed) return parsed;
        } catch (err) {
          if (process.env.NODE_ENV === "production") {
            const message =
              err instanceof Error ? err.message : PRODUCTION_UPLOAD_HINT;
            throw new Error(message || PRODUCTION_UPLOAD_HINT);
          }
        }

        if (process.env.NODE_ENV === "production") {
          throw new Error(PRODUCTION_UPLOAD_HINT);
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
