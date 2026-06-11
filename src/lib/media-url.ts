import { getAppBaseUrl } from "@/lib/utils";

/** Normalize logo/banner URLs — supports local `/uploads/...` paths and external https URLs. */
export function normalizeMediaUrl(value: string | null | undefined): string {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return "";

  // Fix URLs broken by an earlier validator that prefixed https:// onto relative paths
  if (/^https?:\/\/\//i.test(trimmed)) {
    return trimmed.replace(/^https?:\/\//i, "/");
  }

  // Fix protocol-relative paths like //uploads/... (invalid in browsers)
  if (trimmed.startsWith("//uploads/")) {
    return trimmed.slice(1);
  }

  if (trimmed.startsWith("/")) return trimmed;

  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  return `https://${trimmed}`;
}

/** Public sample clips — used when seed paths like /videos/sample1.mp4 are not on the host (e.g. Vercel). */
const SAMPLE_VIDEO_CDN: Record<string, string> = {
  "/videos/sample1.mp4":
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "/videos/sample2.mp4":
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "/videos/sample3.mp4":
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "/videos/sample4.mp4":
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
};

export const PUBLIC_SAMPLE_VIDEO_URLS = Object.values(SAMPLE_VIDEO_CDN);

/** Resolve a stored video URL for <video src> — CDN fallbacks for local-only seed paths. */
export function videoUrlForPlayback(value: string | null | undefined): string | null {
  const normalized = normalizeMediaUrl(value);
  if (!normalized) return null;

  if (SAMPLE_VIDEO_CDN[normalized]) {
    return SAMPLE_VIDEO_CDN[normalized];
  }

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  return mediaUrlForDisplay(normalized);
}

/** Absolute URL safe for next/image and <img> (avoids //uploads protocol-relative bug). */
export function mediaUrlForDisplay(value: string | null | undefined): string | null {
  const normalized = normalizeMediaUrl(value);
  if (!normalized) return null;

  if (normalized.startsWith("/")) {
    return `${getAppBaseUrl()}${normalized}`;
  }

  return normalized;
}
