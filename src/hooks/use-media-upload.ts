"use client";

import { useCallback, useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";

export type MediaUploadKind = "image" | "video";

export interface MediaUploadResult {
  url: string;
  key: string;
}

async function uploadViaApi(
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
          const uploaded = res?.[0];
          if (uploaded?.url) {
            return { url: uploaded.url, key: uploaded.key };
          }
        } catch {
          if (process.env.NODE_ENV === "production") {
            throw new Error(
              "Upload failed. Add UPLOADTHING_TOKEN in Vercel (https://uploadthing.com/dashboard) or configure S3."
            );
          }
        }

        return uploadViaApi(file, kind);
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
