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

/** Absolute URL safe for next/image and <img> (avoids //uploads protocol-relative bug). */
export function mediaUrlForDisplay(value: string | null | undefined): string | null {
  const normalized = normalizeMediaUrl(value);
  if (!normalized) return null;

  if (normalized.startsWith("/")) {
    const base =
      process.env.NEXT_PUBLIC_APP_URL ??
      (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    return `${base.replace(/\/$/, "")}${normalized}`;
  }

  return normalized;
}
