/** Normalize UploadThing client response — field names vary by version/config. */
export function extractUploadThingFile(
  uploaded: Record<string, unknown> | undefined | null
): { url: string; key: string } | null {
  if (!uploaded) return null;

  const serverData =
    uploaded.serverData && typeof uploaded.serverData === "object"
      ? (uploaded.serverData as Record<string, unknown>)
      : null;

  const url =
    (typeof uploaded.url === "string" && uploaded.url) ||
    (typeof uploaded.ufsUrl === "string" && uploaded.ufsUrl) ||
    (typeof serverData?.url === "string" && serverData.url) ||
    null;

  const key =
    (typeof uploaded.key === "string" && uploaded.key) ||
    (typeof serverData?.key === "string" && serverData.key) ||
    null;

  if (!url) return null;
  return { url, key: key ?? url };
}
