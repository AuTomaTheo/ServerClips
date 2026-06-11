import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export const { useUploadThing } = generateReactHelpers<OurFileRouter>({
  fetch: (input, init) =>
    fetch(input, {
      ...init,
      credentials: "include",
    }),
});
