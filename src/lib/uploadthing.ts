import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

/** Only send cookies to our API — not UploadThing ingest URLs (CORS rejects credentials + *). */
export const { useUploadThing } = generateReactHelpers<OurFileRouter>({
  fetch: (input, init) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;

    const needsCredentials = url.includes("/api/uploadthing");

    return fetch(input, {
      ...init,
      ...(needsCredentials ? { credentials: "include" as RequestCredentials } : {}),
    });
  },
});
